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

  async updateStatus(id: string, status: 'approved' | 'rejected', remark?: string | null) {
    const application = await institutionApplicationRepository.findById(id);
    if (!application) throw new HttpError(404, 'Application not found');
    if (!application.verified && status === 'approved') {
      throw new HttpError(400, 'Applicant must verify email before approval');
    }

    let institutionId = application.institutionId ?? null;
    if (status === 'approved' && !institutionId) {
      const created = await institutionRepository.create({
        name: application.name,
        type: application.type,
        tagline: application.tagline ?? null,
        city: application.city ?? null,
        country: application.country ?? null,
        logo: application.logo ?? null,
        website: application.website ?? null,
        description: application.description ?? null,
        status: 'draft',
        verified: false,
        countryCode: null,
        operatingMode: null,
        location: null,
        startupsSupported: 0,
        studentsMentored: 0,
        fundingFacilitated: 0,
        fundingCurrency: 'USD',
        logo: null,
        linkedin: null,
      } as NewInstitutionEntity);
      institutionId = created.id;
    }

    const updated = await institutionApplicationRepository.updateStatus(id, status, remark, institutionId);
    return { updated, institutionId };
  }
}

export const institutionApplicationController = new InstitutionApplicationController();
