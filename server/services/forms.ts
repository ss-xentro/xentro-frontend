/**
 * XENTRO Forms Engine Service
 * 
 * All create/apply actions go through forms
 * Form states: draft → submitted → review → approved/rejected
 */

import { db } from '@/db/client';
import * as schema from '@/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { unlockContext } from './unified-auth';
import { createFeedItem } from './feed';
import { sendNotification } from './notifications';
import { logActivity } from './activity';
import type { 
  FormType, 
  FormStatus, 
  Form,
  StartupCreateFormData,
  MentorApplyFormData,
  InstitutionCreateFormData 
} from '@/lib/unified-types';
import { slugify } from '@/lib/utils';

// ============================================
// FORM CRUD
// ============================================

/**
 * Create a new form (starts as draft)
 */
export async function createForm(params: {
  type: FormType;
  submittedBy: string;
  data: Record<string, unknown>;
  attachments?: { name: string; url: string; type: string }[];
}): Promise<Form> {
  const [form] = await db
    .insert(schema.forms)
    .values({
      type: params.type,
      status: 'draft',
      submittedBy: params.submittedBy,
      data: params.data,
      attachments: params.attachments || [],
    })
    .returning();

  await logActivity({
    userId: params.submittedBy,
    action: 'form_created',
    entityType: 'form',
    entityId: form.id,
    details: { formType: params.type },
  });

  return form as Form;
}

/**
 * Update a draft form
 */
export async function updateForm(params: {
  formId: string;
  userId: string;
  data?: Record<string, unknown>;
  attachments?: { name: string; url: string; type: string }[];
}): Promise<Form | null> {
  // Verify ownership and draft status
  const [existing] = await db
    .select()
    .from(schema.forms)
    .where(
      and(
        eq(schema.forms.id, params.formId),
        eq(schema.forms.submittedBy, params.userId),
        eq(schema.forms.status, 'draft')
      )
    )
    .limit(1);

  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(schema.forms)
    .set({
      data: params.data || existing.data,
      attachments: params.attachments || existing.attachments,
      version: existing.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(schema.forms.id, params.formId))
    .returning();

  return updated as Form;
}

/**
 * Submit a form for review
 */
export async function submitForm(params: {
  formId: string;
  userId: string;
}): Promise<{ success: boolean; form?: Form; error?: string }> {
  const [form] = await db
    .select()
    .from(schema.forms)
    .where(
      and(
        eq(schema.forms.id, params.formId),
        eq(schema.forms.submittedBy, params.userId)
      )
    )
    .limit(1);

  if (!form) {
    return { success: false, error: 'Form not found' };
  }

  if (form.status !== 'draft') {
    return { success: false, error: 'Form already submitted' };
  }

  // Validate form data based on type
  const validation = validateFormData(form.type as FormType, form.data as Record<string, unknown>);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const [updated] = await db
    .update(schema.forms)
    .set({
      status: 'submitted',
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.forms.id, params.formId))
    .returning();

  await logActivity({
    userId: params.userId,
    action: 'form_submitted',
    entityType: 'form',
    entityId: form.id,
    details: { formType: form.type },
  });

  // Notify admins
  await notifyAdminsOfSubmission(updated as Form);

  return { success: true, form: updated as Form };
}

/**
 * Withdraw a submitted form
 */
export async function withdrawForm(params: {
  formId: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  const [form] = await db
    .select()
    .from(schema.forms)
    .where(
      and(
        eq(schema.forms.id, params.formId),
        eq(schema.forms.submittedBy, params.userId)
      )
    )
    .limit(1);

  if (!form) {
    return { success: false, error: 'Form not found' };
  }

  if (!['submitted', 'under_review'].includes(form.status)) {
    return { success: false, error: 'Cannot withdraw form in current status' };
  }

  await db
    .update(schema.forms)
    .set({
      status: 'withdrawn',
      updatedAt: new Date(),
    })
    .where(eq(schema.forms.id, params.formId));

  return { success: true };
}

// ============================================
// FORM REVIEW (Admin)
// ============================================

/**
 * Review a form (approve/reject)
 */
export async function reviewForm(params: {
  formId: string;
  reviewerId: string;
  action: 'approve' | 'reject' | 'request_changes';
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const [form] = await db
    .select()
    .from(schema.forms)
    .where(eq(schema.forms.id, params.formId))
    .limit(1);

  if (!form) {
    return { success: false, error: 'Form not found' };
  }

  if (!['submitted', 'under_review'].includes(form.status)) {
    return { success: false, error: 'Form cannot be reviewed in current status' };
  }

  const previousStatus = form.status as FormStatus;
  let newStatus: FormStatus;

  switch (params.action) {
    case 'approve':
      newStatus = 'approved';
      break;
    case 'reject':
      newStatus = 'rejected';
      break;
    case 'request_changes':
      newStatus = 'draft'; // Back to draft for changes
      break;
    default:
      return { success: false, error: 'Invalid action' };
  }

  // Update form
  await db
    .update(schema.forms)
    .set({
      status: newStatus,
      reviewedBy: params.reviewerId,
      reviewedAt: new Date(),
      reviewNotes: params.notes,
      updatedAt: new Date(),
    })
    .where(eq(schema.forms.id, params.formId));

  // Create review audit record
  await db
    .insert(schema.formReviews)
    .values({
      formId: params.formId,
      reviewerId: params.reviewerId,
      action: params.action,
      previousStatus,
      newStatus,
      notes: params.notes,
    });

  // Map action to activity action
  const activityActionMap: Record<string, 'form_approved' | 'form_rejected' | 'form_request_changes'> = {
    approve: 'form_approved',
    reject: 'form_rejected',
    request_changes: 'form_request_changes',
  };

  await logActivity({
    userId: params.reviewerId,
    action: activityActionMap[params.action] || 'form_approved',
    entityType: 'form',
    entityId: params.formId,
    details: { previousStatus, newStatus },
  });

  // If approved, process the form
  if (params.action === 'approve') {
    await processApprovedForm(form as unknown as Form);
  }

  // Notify submitter
  await sendNotification({
    userId: form.submittedBy,
    type: params.action === 'approve' ? 'form_approved' : 'form_rejected',
    title: `Your ${form.type.replace('_', ' ')} has been ${params.action === 'approve' ? 'approved' : 'rejected'}`,
    message: params.notes,
    entityType: 'form',
    entityId: form.id,
  });

  return { success: true };
}

// ============================================
// FORM PROCESSING (After Approval)
// ============================================

/**
 * Process an approved form - create the actual entity
 */
async function processApprovedForm(form: Form): Promise<void> {
  switch (form.type) {
    case 'startup_create':
      await processStartupCreate(form);
      break;
    case 'mentor_apply':
      await processMentorApply(form);
      break;
    case 'institute_create':
      await processInstituteCreate(form);
      break;
    case 'event_create':
      await processEventCreate(form);
      break;
    case 'program_create':
      await processProgramCreate(form);
      break;
    default:
      console.log(`No processor for form type: ${form.type}`);
  }
}

/**
 * Process startup creation form
 */
async function processStartupCreate(form: Form): Promise<void> {
  const data = form.data as unknown as StartupCreateFormData;
  const slug = slugify(data.name);

  // Create startup
  const [startup] = await db
    .insert(schema.startups)
    .values({
      slug,
      name: data.name,
      tagline: data.tagline,
      pitch: data.pitch,
      description: data.description,
      stage: data.stage,
      city: data.city,
      country: data.country,
      sectors: data.sectors || [],
      sdgFocus: data.sdgFocus || [],
      website: data.website,
      linkedin: data.linkedin,
      twitter: data.twitter,
      pitchDeckUrl: data.pitchDeckUrl,
      demoVideoUrl: data.demoVideoUrl,
      ownerId: form.submittedBy,
    })
    .returning();

  // Add founders as members
  for (const founder of data.founders || []) {
    // Find or create user for founder
    let [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, founder.email.toLowerCase()))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(schema.users)
        .values({
          email: founder.email.toLowerCase(),
          name: founder.name,
          accountType: 'explorer',
          unlockedContexts: ['explorer', 'startup'],
          activeContext: 'explorer',
        })
        .returning();
    } else {
      // Unlock startup context for existing user
      await unlockContext(user.id, 'startup');
    }

    // Add as startup member
    await db
      .insert(schema.startupMembers)
      .values({
        startupId: startup.id,
        userId: user.id,
        role: founder.role,
        title: founder.title,
        invitedBy: form.submittedBy,
        acceptedAt: user.id === form.submittedBy ? new Date() : undefined,
      })
      .onConflictDoNothing();
  }

  // Unlock startup context for form submitter
  await unlockContext(form.submittedBy, 'startup');

  // Update form with result
  await db
    .update(schema.forms)
    .set({
      resultEntityType: 'startup',
      resultEntityId: startup.id,
    })
    .where(eq(schema.forms.id, form.id));

  // Create feed item
  await createFeedItem({
    sourceType: 'startup',
    sourceId: startup.id,
    title: startup.name,
    summary: startup.tagline || startup.pitch || undefined,
    sectors: startup.sectors as string[],
    stages: startup.stage ? [startup.stage] : [],
    createdBy: form.submittedBy,
    creatorType: 'startup',
    creatorId: startup.id,
    creatorName: startup.name,
    creatorLogo: startup.logo || undefined,
  });

  await logActivity({
    userId: form.submittedBy,
    action: 'startup_created',
    entityType: 'startup',
    entityId: startup.id,
    details: { name: startup.name },
  });
}

/**
 * Process mentor application form
 */
async function processMentorApply(form: Form): Promise<void> {
  const data = form.data as unknown as MentorApplyFormData;

  // Check if mentor profile already exists
  const [existing] = await db
    .select()
    .from(schema.mentorProfiles)
    .where(eq(schema.mentorProfiles.userId, form.submittedBy))
    .limit(1);

  // Convert arrays to text for storage (current schema uses text fields)
  const expertiseText = Array.isArray(data.expertise) ? data.expertise.join(', ') : data.expertise;
  const availabilityText = typeof data.availability === 'object' ? JSON.stringify(data.availability) : data.availability;

  if (existing) {
    // Update existing profile
    await db
      .update(schema.mentorProfiles)
      .set({
        status: 'approved',
        expertise: expertiseText,
        occupation: data.occupation,
        rate: data.hourlyRate?.toString(),
        availability: availabilityText,
        approvedAt: new Date(),
      })
      .where(eq(schema.mentorProfiles.id, existing.id));
  } else {
    // Create new mentor profile
    await db
      .insert(schema.mentorProfiles)
      .values({
        userId: form.submittedBy,
        status: 'approved',
        expertise: expertiseText,
        occupation: data.occupation,
        rate: data.hourlyRate?.toString(),
        availability: availabilityText,
        approvedAt: new Date(),
      });
  }

  // Unlock mentor context
  await unlockContext(form.submittedBy, 'mentor');

  // Update form with result
  await db
    .update(schema.forms)
    .set({
      resultEntityType: 'mentor',
      resultEntityId: form.submittedBy, // mentor is tied to user
    })
    .where(eq(schema.forms.id, form.id));

  // Get user info for feed
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, form.submittedBy))
    .limit(1);

  // Create feed item
  await createFeedItem({
    sourceType: 'mentor',
    sourceId: form.submittedBy,
    title: `${user?.name || 'New Mentor'} joined as a mentor`,
    summary: data.headline,
    sectors: data.industries,
    stages: [],
    createdBy: form.submittedBy,
    creatorType: 'mentor',
    creatorId: form.submittedBy,
    creatorName: user?.name,
    creatorLogo: user?.avatar || undefined,
  });

  await logActivity({
    userId: form.submittedBy,
    action: 'mentor_approved',
    entityType: 'mentor',
    entityId: form.submittedBy,
  });
}

/**
 * Process institution creation form
 */
async function processInstituteCreate(form: Form): Promise<void> {
  const data = form.data as unknown as InstitutionCreateFormData;
  const slug = slugify(data.name);

  // Create institution
  const [institution] = await db
    .insert(schema.institutions)
    .values({
      slug,
      name: data.name,
      type: data.type,
      tagline: data.tagline,
      description: data.description,
      city: data.city,
      country: data.country,
      email: data.email,
      phone: data.phone,
      website: data.website,
      linkedin: data.linkedin,
      sectorFocus: data.sectorFocus || [],
      sdgFocus: data.sdgFocus || [],
      operatingMode: data.operatingMode,
      status: 'published',
      verified: true,
    })
    .returning();

  // Add submitter as owner
  await db
    .insert(schema.institutionMembers)
    .values({
      institutionId: institution.id,
      userId: form.submittedBy,
      role: 'owner',
      acceptedAt: new Date(),
    });

  // Unlock institute context
  await unlockContext(form.submittedBy, 'institute');

  // Update form with result
  await db
    .update(schema.forms)
    .set({
      resultEntityType: 'institution',
      resultEntityId: institution.id,
    })
    .where(eq(schema.forms.id, form.id));

  // Create feed item
  await createFeedItem({
    sourceType: 'institution',
    sourceId: institution.id,
    title: institution.name,
    summary: institution.tagline || undefined,
    sectors: institution.sectorFocus as string[],
    stages: [],
    createdBy: form.submittedBy,
    creatorType: 'institution',
    creatorId: institution.id,
    creatorName: institution.name,
    creatorLogo: institution.logo || undefined,
  });

  await logActivity({
    userId: form.submittedBy,
    action: 'institution_created',
    entityType: 'institution',
    entityId: institution.id,
    details: { name: institution.name },
  });
}

/**
 * Process event creation form
 */
async function processEventCreate(form: Form): Promise<void> {
  const data = form.data as Record<string, unknown>;

  const [event] = await db
    .insert(schema.events)
    .values({
      name: data.name as string,
      description: data.description as string | undefined,
      type: data.type as string | undefined,
      location: data.location as string | undefined,
      startTime: data.startTime ? new Date(data.startTime as string) : new Date(),
      price: data.price as string | undefined,
      institutionId: data.institutionId as string | undefined,
      createdBy: form.submittedBy,
      createdByType: 'institution' as const,
      approved: false,
    })
    .returning();

  await db
    .update(schema.forms)
    .set({
      resultEntityType: 'event',
      resultEntityId: event.id,
    })
    .where(eq(schema.forms.id, form.id));

  // Create feed item
  await createFeedItem({
    sourceType: 'event',
    sourceId: event.id,
    title: event.name,
    summary: event.description || undefined,
    sectors: [],
    stages: [],
    createdBy: form.submittedBy,
  });
}

/**
 * Process program creation form
 */
async function processProgramCreate(form: Form): Promise<void> {
  const data = form.data as Record<string, unknown>;

  const [program] = await db
    .insert(schema.programs)
    .values({
      institutionId: data.institutionId as string,
      name: data.name as string,
      type: data.type as string,
      description: data.description as string | undefined,
      duration: data.duration as string | undefined,
      startDate: data.startDate ? new Date(data.startDate as string) : undefined,
      endDate: data.endDate ? new Date(data.endDate as string) : undefined,
      isActive: true,
    })
    .returning();

  await db
    .update(schema.forms)
    .set({
      resultEntityType: 'program',
      resultEntityId: program.id,
    })
    .where(eq(schema.forms.id, form.id));
}

// ============================================
// VALIDATION
// ============================================

function validateFormData(
  type: FormType,
  data: Record<string, unknown>
): { valid: boolean; error?: string } {
  switch (type) {
    case 'startup_create':
      if (!data.name) return { valid: false, error: 'Startup name is required' };
      if (!data.stage) return { valid: false, error: 'Startup stage is required' };
      if (!data.founders || !Array.isArray(data.founders) || data.founders.length === 0) {
        return { valid: false, error: 'At least one founder is required' };
      }
      break;
    case 'mentor_apply':
      if (!data.headline) return { valid: false, error: 'Headline is required' };
      if (!data.expertise || !Array.isArray(data.expertise) || data.expertise.length === 0) {
        return { valid: false, error: 'At least one area of expertise is required' };
      }
      break;
    case 'institute_create':
      if (!data.name) return { valid: false, error: 'Institution name is required' };
      if (!data.type) return { valid: false, error: 'Institution type is required' };
      if (!data.email) return { valid: false, error: 'Email is required' };
      break;
  }
  return { valid: true };
}

// ============================================
// HELPERS
// ============================================

async function notifyAdminsOfSubmission(form: Form): Promise<void> {
  // Get all active admins
  const admins = await db
    .select({ userId: schema.adminProfiles.userId })
    .from(schema.adminProfiles)
    .where(eq(schema.adminProfiles.isActive, true));

  for (const admin of admins) {
    await sendNotification({
      userId: admin.userId,
      type: 'form_submitted',
      title: `New ${form.type.replace('_', ' ')} submitted`,
      message: 'A new form is ready for review',
      entityType: 'form',
      entityId: form.id,
      actionUrl: `/admin/reviews/${form.id}`,
    });
  }
}

// ============================================
// QUERIES
// ============================================

/**
 * Get forms for a user
 */
export async function getUserForms(
  userId: string,
  type?: FormType,
  status?: FormStatus
): Promise<Form[]> {
  let query = db
    .select()
    .from(schema.forms)
    .where(eq(schema.forms.submittedBy, userId))
    .orderBy(desc(schema.forms.createdAt));

  // Note: Drizzle doesn't support dynamic where chains well,
  // so in production you'd want to build the conditions array
  
  const forms = await query;
  
  // Filter in JS for now
  let filtered = forms;
  if (type) filtered = filtered.filter(f => f.type === type);
  if (status) filtered = filtered.filter(f => f.status === status);
  
  return filtered as Form[];
}

/**
 * Get forms for admin review
 */
export async function getFormsForReview(
  type?: FormType,
  status: FormStatus = 'submitted'
): Promise<Form[]> {
  const forms = await db
    .select()
    .from(schema.forms)
    .where(eq(schema.forms.status, status))
    .orderBy(desc(schema.forms.submittedAt));

  let filtered = forms;
  if (type) filtered = filtered.filter(f => f.type === type);

  return filtered as Form[];
}

/**
 * Get form by ID
 */
export async function getFormById(formId: string): Promise<Form | null> {
  const [form] = await db
    .select()
    .from(schema.forms)
    .where(eq(schema.forms.id, formId))
    .limit(1);

  return form as Form | null;
}
