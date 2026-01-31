import { pgEnum, pgTable, uuid, varchar, timestamp, boolean, text, integer, numeric, uniqueIndex, bigint, json, index } from 'drizzle-orm/pg-core';

export const accountTypeEnum = pgEnum('account_type', ['explorer', 'startup', 'mentor', 'investor', 'institution', 'admin', 'approver']);
export const createdByTypeEnum = pgEnum('created_by_type', ['mentor', 'startup', 'institution', 'investor']);
export const entityTypeEnum = pgEnum('entity_type', ['mentor', 'student', 'startup', 'investor', 'event']);
export const resourceTypeEnum = pgEnum('resource_type', ['video', 'pdf', 'link', 'course']);
export const authProviderEnum = pgEnum('auth_provider', ['credentials', 'google', 'otp']);
export const mentorStatusEnum = pgEnum('mentor_status', ['pending', 'approved', 'rejected', 'suspended']);
export const institutionRoleEnum = pgEnum('institution_role', ['owner', 'admin', 'manager', 'viewer']);

// Startup-specific enums
export const startupStageEnum = pgEnum('startup_stage', ['idea', 'mvp', 'early_traction', 'growth', 'scale']);
export const startupStatusEnum = pgEnum('startup_status', ['active', 'stealth', 'paused', 'acquired', 'shut_down']);
export const fundingRoundEnum = pgEnum('funding_round', ['bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b_plus', 'unicorn']);
export const founderRoleEnum = pgEnum('founder_role', ['ceo', 'cto', 'coo', 'cfo', 'cpo', 'founder', 'co_founder']);

// ============================================
// UNIFIED ARCHITECTURE ENUMS
// ============================================

// User contexts (dashboards they can access)
export const userContextEnum = pgEnum('user_context', [
  'explorer',      // Default for all users
  'startup',       // Founder or team member of a startup
  'mentor',        // Approved mentor
  'institute',     // Institute admin or member
  'admin'          // Platform admin (L1, L2, L3)
]);

// Form states - all create/apply actions go through forms
export const formStatusEnum = pgEnum('form_status', [
  'draft',         // User is still filling
  'submitted',     // Submitted for review
  'under_review',  // Being reviewed by admin
  'approved',      // Approved and processed
  'rejected',      // Rejected with feedback
  'withdrawn'      // Withdrawn by user
]);

// Form types
export const formTypeEnum = pgEnum('form_type', [
  'startup_create',        // Create a new startup
  'startup_update',        // Update startup info
  'mentor_apply',          // Apply to become mentor
  'mentor_update',         // Update mentor profile
  'institute_create',      // Create institution
  'institute_update',      // Update institution
  'event_create',          // Create an event
  'program_create',        // Create a program
  'team_invite',           // Invite team member
  'general'                // Generic form
]);

// Admin levels
export const adminLevelEnum = pgEnum('admin_level', ['L1', 'L2', 'L3']);

// Startup membership roles
export const startupRoleEnum = pgEnum('startup_role', ['founder', 'co_founder', 'cto', 'coo', 'cfo', 'team_member']);

// Feed interaction types
export const interactionTypeEnum = pgEnum('interaction_type', ['appreciate', 'viewed', 'mentor_tip', 'saved']);

// Notification types
export const notificationTypeEnum = pgEnum('notification_type', [
  'form_submitted',
  'form_approved', 
  'form_rejected',
  'form_changes_requested',
  'context_unlocked',
  'team_invite',
  'team_invite_accepted',
  'mentor_tip_received',
  'appreciation_received',
  'mention',
  'system'
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  avatar: varchar('avatar', { length: 512 }),
  accountType: accountTypeEnum('account_type').notNull(),
  
  // Unified architecture fields
  unlockedContexts: json('unlocked_contexts').$type<string[]>().default(['explorer']),
  activeContext: userContextEnum('active_context').default('explorer'),
  emailVerified: boolean('email_verified').default(false),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailUnique: uniqueIndex('users_email_idx').on(table.email),
}));

export const authAccounts = pgTable('auth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: authProviderEnum('provider').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 320 }).notNull(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerAccountUnique: uniqueIndex('auth_accounts_provider_account_idx').on(table.provider, table.providerAccountId),
}));

export const explorerProfiles = pgTable('explorer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  educationLevel: varchar('education_level', { length: 255 }),
  interests: text('interests'),
  upgraded: boolean('upgraded').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const startups = pgTable('startups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique(), // Optional for backward compatibility
  tagline: varchar('tagline', { length: 280 }),
  logo: varchar('logo', { length: 512 }),
  coverImage: varchar('cover_image', { length: 512 }), // Hero banner image (Kickstarter-style)
  pitch: varchar('pitch', { length: 160 }), // One-line pitch, max 160 chars
  description: text('description'), // Full description (Kickstarter story section)
  foundedDate: timestamp('founded_date', { withTimezone: true }),
  stage: startupStageEnum('stage'),
  status: startupStatusEnum('status').default('active').notNull(),
  fundingRound: fundingRoundEnum('funding_round').default('bootstrapped'),
  fundsRaised: numeric('funds_raised', { precision: 16, scale: 2 }),
  fundingGoal: numeric('funding_goal', { precision: 16, scale: 2 }), // Target funding amount
  fundingCurrency: varchar('funding_currency', { length: 8 }).default('USD'),
  investors: json('investors').$type<string[]>(),
  primaryContactEmail: varchar('primary_contact_email', { length: 320 }),
  // Keep existing fields for backward compatibility
  location: varchar('location', { length: 255 }),
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  oneLiner: varchar('one_liner', { length: 280 }),
  // Social links (LinkedIn-style)
  website: varchar('website', { length: 255 }),
  linkedin: varchar('linkedin', { length: 255 }),
  twitter: varchar('twitter', { length: 255 }),
  instagram: varchar('instagram', { length: 255 }),
  pitchDeckUrl: varchar('pitch_deck_url', { length: 512 }), // Link to pitch deck
  demoVideoUrl: varchar('demo_video_url', { length: 512 }), // YouTube/Vimeo embed
  // Industry & focus areas
  industry: varchar('industry', { length: 120 }),
  sectors: json('sectors').$type<string[]>(), // Array of sector tags
  sdgFocus: json('sdg_focus').$type<string[]>(), // UN SDG alignment
  // Metrics & highlights
  teamSize: integer('team_size'),
  employeeCount: varchar('employee_count', { length: 50 }), // "1-10", "11-50", etc.
  highlights: json('highlights').$type<string[]>(), // Key achievements/milestones
  mediaFeatures: json('media_features').$type<{ title: string; url: string; source: string }[]>(), // Press coverage
  // Relations
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  profileViews: integer('profile_views').default(0).notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('startups_slug_idx').on(table.slug),
  statusIdx: index('startups_status_idx').on(table.status),
  stageIdx: index('startups_stage_idx').on(table.stage),
}));

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 120 }).notNull(),
}, (table) => ({
  memberUnique: uniqueIndex('team_member_unique').on(table.userId, table.startupId),
}));

// Startup Members - links users to startups with roles (for unified architecture)
export const startupMembers = pgTable('startup_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: startupRoleEnum('role').notNull(),
  title: varchar('title', { length: 120 }),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  memberUnique: uniqueIndex('startup_member_unique_idx').on(table.startupId, table.userId),
  userIdx: index('startup_member_user_idx').on(table.userId),
  startupIdx: index('startup_member_startup_idx').on(table.startupId),
}));

export const mentorProfiles = pgTable('mentor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expertise: text('expertise'),
  rate: numeric('rate', { precision: 12, scale: 2 }),
  verified: boolean('verified').default(false).notNull(),
  status: mentorStatusEnum('status').default('pending').notNull(),
  occupation: varchar('occupation', { length: 255 }),
  packages: text('packages'),
  achievements: text('achievements'),
  availability: text('availability'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedReason: text('rejected_reason'),
});

export const approvers = pgTable('approvers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  mobile: varchar('mobile', { length: 50 }),
  employeeId: varchar('employee_id', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailUnique: uniqueIndex('approvers_email_idx').on(table.email),
  employeeIdUnique: uniqueIndex('approvers_employee_id_idx').on(table.employeeId),
}));

export const investorProfiles = pgTable('investor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  identityVerified: boolean('identity_verified').default(false).notNull(),
  fundsDeclared: boolean('funds_declared').default(false).notNull(),
  experienceVerified: boolean('experience_verified').default(false).notNull(),
});

export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(), // Unique URL-friendly identifier
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 280 }),
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  countryCode: varchar('country_code', { length: 4 }),
  operatingMode: varchar('operating_mode', { length: 50 }),
  location: varchar('location', { length: 255 }),
  startupsSupported: integer('startups_supported').default(0).notNull(),
  studentsMentored: integer('students_mentored').default(0).notNull(),
  fundingFacilitated: numeric('funding_facilitated', { precision: 16, scale: 2 }).default('0').notNull(),
  fundingCurrency: varchar('funding_currency', { length: 8 }),
  logo: varchar('logo', { length: 255 }),
  website: varchar('website', { length: 255 }),
  linkedin: varchar('linkedin', { length: 255 }),
  email: varchar('email', { length: 320 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  description: text('description'),
  sdgFocus: json('sdg_focus').$type<string[]>(),
  sectorFocus: json('sector_focus').$type<string[]>(),
  legalDocuments: json('legal_documents').$type<string[]>(), // Array of document URLs
  status: varchar('status', { length: 32 }).default('draft').notNull(),
  verified: boolean('verified').default(false).notNull(),
  profileViews: integer('profile_views').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('institutions_slug_idx').on(table.slug),
  statusIdx: index('institutions_status_idx').on(table.status),
}));

export const institutionApplications = pgTable('institution_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  type: varchar('type', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 280 }),
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  website: varchar('website', { length: 255 }),
  description: text('description'),
  logo: varchar('logo', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  sdgFocus: json('sdg_focus').$type<string[]>(),
  sectorFocus: json('sector_focus').$type<string[]>(),
  operatingMode: varchar('operating_mode', { length: 50 }),
  countryCode: varchar('country_code', { length: 4 }),
  startupsSupported: integer('startups_supported').default(0),
  studentsMentored: integer('students_mentored').default(0),
  fundingFacilitated: numeric('funding_facilitated', { precision: 16, scale: 2 }).default('0'),
  fundingCurrency: varchar('funding_currency', { length: 8 }),
  linkedin: varchar('linkedin', { length: 255 }),
  legalDocuments: json('legal_documents').$type<string[]>(), // Array of document URLs
  status: varchar('status', { length: 32 }).default('pending').notNull(),
  remark: text('remark'),
  verificationToken: varchar('verification_token', { length: 255 }),
  verified: boolean('verified').default(false).notNull(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  applicantUserId: uuid('applicant_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Institution team members - links users to institutions with roles
export const institutionMembers = pgTable('institution_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: institutionRoleEnum('role').notNull().default('viewer'),
  invitedByUserId: uuid('invited_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  memberUnique: uniqueIndex('institution_member_unique').on(table.institutionId, table.userId),
  institutionIdx: index('institution_members_institution_idx').on(table.institutionId),
}));

export const institutionSessions = pgTable('institution_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull(),
  otp: varchar('otp', { length: 10 }).notNull(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  bucket: varchar('bucket', { length: 180 }).notNull(),
  key: varchar('key', { length: 512 }).notNull(),
  url: text('url').notNull(),
  mimeType: varchar('mime_type', { length: 180 }),
  size: bigint('size', { mode: 'number' }),
  entityType: varchar('entity_type', { length: 120 }),
  entityId: uuid('entity_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyBucketIdx: uniqueIndex('media_assets_bucket_key_idx').on(table.bucket, table.key),
}));

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  description: text('description'),
  duration: varchar('duration', { length: 120 }),
  isActive: boolean('is_active').default(true).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
});

// Projects - research projects, collaborations, institutional initiatives
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('planning').notNull(), // planning, active, completed, on-hold
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  institutionIdx: index('projects_institution_idx').on(table.institutionId),
  statusIdx: index('projects_status_idx').on(table.status),
}));

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdByType: createdByTypeEnum('created_by_type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  type: varchar('type', { length: 120 }),
  startTime: timestamp('start_time', { withTimezone: true }),
  price: numeric('price', { precision: 12, scale: 2 }),
  approved: boolean('approved').default(false).notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'set null' }),
  mentorId: uuid('mentor_id').references(() => mentorProfiles.id, { onDelete: 'set null' }),
  slotTime: timestamp('slot_time', { withTimezone: true }),
  status: varchar('status', { length: 120 }).notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  outcome: text('outcome'),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 120 }).notNull(),
  providerRef: varchar('provider_ref', { length: 255 }),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  status: varchar('status', { length: 120 }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
});

export const trustScores = pgTable('trust_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull(),
  entityType: entityTypeEnum('entity_type').notNull(),
  score: integer('score').notNull(),
  level: varchar('level', { length: 120 }).notNull(),
});

export const blocks = pgTable('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  blockType: varchar('block_type', { length: 120 }).notNull(),
  contentRef: varchar('content_ref', { length: 255 }).notNull(),
  position: integer('position').default(0).notNull(),
});

export const blockVisibilities = pgTable('block_visibilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockId: uuid('block_id').references(() => blocks.id, { onDelete: 'cascade' }).notNull(),
  audience: varchar('audience', { length: 120 }).notNull(),
});

export const updateLogs = pgTable('update_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const demandSignals = pgTable('demand_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  intentType: varchar('intent_type', { length: 120 }).notNull(),
  note: text('note'),
});

export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(true).notNull(),
});

export const channels = pgTable('channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const learningResources = pgTable('learning_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  type: resourceTypeEnum('type').notNull(),
  r2Path: varchar('r2_path', { length: 512 }),
  stage: varchar('stage', { length: 120 }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
});

// Startup Founders - links users to startups with roles
export const startupFounders = pgTable('startup_founders', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  role: founderRoleEnum('role').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  founderUnique: uniqueIndex('startup_founder_unique').on(table.startupId, table.userId),
  startupIdx: index('startup_founders_startup_idx').on(table.startupId),
}));

// Startup Activity Logs - audit trail for all startup changes
export const startupActivityLogs = pgTable('startup_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 50 }).notNull(), // 'created', 'updated', 'founder_added', 'founder_removed', etc.
  details: json('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  startupIdx: index('startup_activity_startup_idx').on(table.startupId),
  createdAtIdx: index('startup_activity_created_idx').on(table.createdAt),
}));

// Startup Sessions - OTP-based authentication for founders
export const startupSessions = pgTable('startup_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull(),
  otp: varchar('otp', { length: 10 }).notNull(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// UNIFIED ARCHITECTURE TABLES
// ============================================

// OTP Sessions - Universal OTP storage
export const otpSessions = pgTable('otp_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull(),
  otp: varchar('otp', { length: 10 }).notNull(),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'login', 'verify_email', 'reset_password'
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailPurposeIdx: index('otp_email_purpose_idx').on(table.email, table.purpose),
}));

// Admin Profiles - Platform admins (L1, L2, L3)
export const adminProfiles = pgTable('admin_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  level: adminLevelEnum('level').notNull(),
  permissions: json('permissions').$type<string[]>().default([]),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex('admin_user_unique_idx').on(table.userId),
}));

// Forms - Universal form submissions for all create/apply actions
export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: formTypeEnum('type').notNull(),
  status: formStatusEnum('status').default('draft').notNull(),
  submittedBy: uuid('submitted_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  data: json('data').$type<Record<string, unknown>>().notNull(),
  attachments: json('attachments').$type<{ name: string; url: string; type: string }[]>().default([]),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),
  resultEntityType: varchar('result_entity_type', { length: 50 }),
  resultEntityId: uuid('result_entity_id'),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('forms_type_idx').on(table.type),
  statusIdx: index('forms_status_idx').on(table.status),
  submittedByIdx: index('forms_submitted_by_idx').on(table.submittedBy),
  typeStatusIdx: index('forms_type_status_idx').on(table.type, table.status),
}));

// Form Reviews - Audit trail for form reviews
export const formReviews = pgTable('form_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'approve', 'reject', 'request_changes', 'escalate'
  previousStatus: formStatusEnum('previous_status').notNull(),
  newStatus: formStatusEnum('new_status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  formIdx: index('form_reviews_form_idx').on(table.formId),
  reviewerIdx: index('form_reviews_reviewer_idx').on(table.reviewerId),
}));

// Feed Items - Denormalized feed entries
export const feedItems = pgTable('feed_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'startup', 'event', 'mentor', 'institution', 'program'
  sourceId: uuid('source_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  imageUrl: varchar('image_url', { length: 512 }),
  sectors: json('sectors').$type<string[]>().default([]),
  stages: json('stages').$type<string[]>().default([]),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  creatorType: varchar('creator_type', { length: 50 }),
  creatorId: uuid('creator_id'),
  creatorName: varchar('creator_name', { length: 255 }),
  creatorLogo: varchar('creator_logo', { length: 512 }),
  viewCount: integer('view_count').default(0).notNull(),
  appreciationCount: integer('appreciation_count').default(0).notNull(),
  mentorTipCount: integer('mentor_tip_count').default(0).notNull(),
  score: integer('score').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index('feed_source_idx').on(table.sourceType, table.sourceId),
  scoreIdx: index('feed_score_idx').on(table.score),
  createdAtIdx: index('feed_created_at_idx').on(table.createdAt),
  creatorIdx: index('feed_creator_idx').on(table.creatorType, table.creatorId),
}));

// Feed Interactions - User interactions with feed items
export const feedInteractions = pgTable('feed_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedItemId: uuid('feed_item_id').references(() => feedItems.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: interactionTypeEnum('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueInteraction: uniqueIndex('feed_interaction_unique_idx').on(table.feedItemId, table.userId, table.type),
  feedItemIdx: index('feed_interaction_item_idx').on(table.feedItemId),
  userIdx: index('feed_interaction_user_idx').on(table.userId),
}));

// Saved Items - User's saved feed items
export const savedItems = pgTable('saved_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  feedItemId: uuid('feed_item_id').references(() => feedItems.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userItemUnique: uniqueIndex('saved_item_unique_idx').on(table.userId, table.feedItemId),
  userIdx: index('saved_item_user_idx').on(table.userId),
}));

// Activity Logs - Comprehensive audit trail
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  context: userContextEnum('context'),
  contextEntityId: uuid('context_entity_id'),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  details: json('details').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('activity_user_idx').on(table.userId),
  contextIdx: index('activity_context_idx').on(table.context, table.contextEntityId),
  createdAtIdx: index('activity_created_at_idx').on(table.createdAt),
}));

// Notifications - User notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  actionUrl: varchar('action_url', { length: 512 }),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notification_user_idx').on(table.userId),
  userUnreadIdx: index('notification_user_unread_idx').on(table.userId, table.isRead),
  createdAtIdx: index('notification_created_at_idx').on(table.createdAt),
}));
