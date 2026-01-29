import { randomUUID } from 'crypto';
import { institutionApplicationRepository, NewInstitutionApplication } from '@/server/repositories/institution.application.repository';
import { institutionRepository, NewInstitutionEntity } from '@/server/repositories/institution.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { sendInstitutionMagicLink } from '@/server/services/email';
import { HttpError } from './http-error';

class InstitutionApplicationController {
  async submit(payload: {
    name: string;
    email: string;
    type: string;
    tagline?: string | null;
    city?: string | null;
    country?: string | null;
    website?: string | null;
    description?: string | null;
  }) {
    if (!payload.name || !payload.email) {
      throw new HttpError(400, 'Name and email are required');
    }

    // Check if email already exists in applications or institutions
    const existingApplication = await institutionApplicationRepository.findByEmail(payload.email.toLowerCase());
    if (existingApplication) {
      throw new HttpError(400, 'An account with this email already exists. Please use a different email or log in with your existing account.');
    }

    const existingInstitution = await institutionRepository.findByEmail(payload.email.toLowerCase());
    if (existingInstitution) {
      throw new HttpError(400, 'An account with this email already exists. Please use a different email or log in with your existing account.');
    }

    const verificationToken = randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const record = await institutionApplicationRepository.create({
      ...payload,
      type: payload.type || 'incubator',
      status: 'pending',
      verified: false,
      verificationToken,
    } as NewInstitutionApplication);

    const redirectPath = encodeURIComponent('/institution-dashboard');
    const magicLink = `${baseUrl}/api/institution-applications/verify?token=${verificationToken}&next=${redirectPath}`;
    await sendInstitutionMagicLink({ email: payload.email, name: payload.name, magicLink });
    return { application: record, magicLink };
  }

  async verify(token: string) {
    if (!token) throw new HttpError(400, 'Token is required');
    const exists = await institutionApplicationRepository.findByToken(token);
    if (!exists) throw new HttpError(404, 'Invalid or expired link');
    const updated = await institutionApplicationRepository.markVerified(token);
    if (!updated) throw new HttpError(404, 'Invalid or expired link');

    // Create institution user if not exists and store on application
    const existingUser = await userRepository.findByEmail(updated.email.toLowerCase());
    const user = existingUser ?? (await userRepository.createInstitutionUser({ name: updated.name, email: updated.email }));
    await institutionApplicationRepository.updateApplicant(updated.id, user.id);

    return { ...updated, applicantUserId: user.id };
  }

  async listAll() {
    return institutionApplicationRepository.listAll();
  }

  async updateDetails(id: string, payload: Partial<NewInstitutionApplication>) {
    const application = await institutionApplicationRepository.findById(id);
    if (!application) throw new HttpError(404, 'Application not found');
    const updated = await institutionApplicationRepository.updateDetails(id, payload);
    return updated;
  }

  async submitForApproval(id: string, payload: Partial<NewInstitutionApplication>) {
    const application = await institutionApplicationRepository.findById(id);
    if (!application) throw new HttpError(404, 'Application not found');
    if (!application.verified) throw new HttpError(400, 'Email must be verified before submission');
    
    // Validate all required Phase 2 fields are filled
    const errors: string[] = [];
    if (!payload.type) errors.push('Institution type is required');
    if (!payload.name || !payload.name.trim()) errors.push('Institution name is required');
    if (!payload.tagline || !payload.tagline.trim()) errors.push('Tagline is required');
    if (!payload.city || !payload.city.trim()) errors.push('City is required');
    if (!payload.country || !payload.country.trim()) errors.push('Country is required');
    if (!payload.description || !payload.description.trim()) errors.push('Description is required');
    
    if (errors.length > 0) {
      throw new HttpError(400, `Please complete all required fields: ${errors.join(', ')}`);
    }

    // Mark as submitted for approval (status remains pending but now visible to admins)
    const updated = await institutionApplicationRepository.updateDetails(id, {
      ...payload,
      status: 'pending', // Ensure it's marked as pending for admin review
    });
    return updated;
  }

  async updateStatus(id: string, status: 'approved' | 'rejected', remark?: string | null) {
    const application = await institutionApplicationRepository.findById(id);
    if (!application) throw new HttpError(404, 'Application not found');
    if (!application.verified && status === 'approved') {
      throw new HttpError(400, 'Applicant must verify email before approval');
    }

    let institutionId = application.institutionId ?? null;
    if (status === 'approved' && !institutionId) {
      // Check if email already exists in institutions table
      const existingInstitution = await institutionRepository.findByEmail(application.email.toLowerCase());
      if (existingInstitution) {
        throw new HttpError(400, 'An institution with this email already exists. Cannot approve duplicate email.');
      }

      // Create published institution when approved
      const created = await institutionRepository.create({
        name: application.name,
        type: application.type,
        email: application.email, // Email is required and already validated
        tagline: application.tagline ?? null,
        city: application.city ?? null,
        country: application.country ?? null,
        countryCode: application.countryCode ?? null,
        operatingMode: application.operatingMode ?? null,
        logo: application.logo ?? null,
        website: application.website ?? null,
        linkedin: application.linkedin ?? null,
        phone: application.phone ?? null,
        description: application.description ?? null,
        sdgFocus: application.sdgFocus ?? null,
        sectorFocus: application.sectorFocus ?? null,
        legalDocuments: application.legalDocuments ?? null,
        location: null,
        startupsSupported: application.startupsSupported ?? 0,
        studentsMentored: application.studentsMentored ?? 0,
        fundingFacilitated: application.fundingFacilitated ?? '0',
        fundingCurrency: application.fundingCurrency ?? 'USD',
        status: 'published', // Set to published on approval
        verified: true, // Mark as verified
      } as NewInstitutionEntity);
      institutionId = created.id;
    }

    // Mark application as approved (this archives it from pending list)
    const updated = await institutionApplicationRepository.updateStatus(id, status, remark, institutionId);
    return { updated, institutionId };
  }
}

export const institutionApplicationController = new InstitutionApplicationController();
