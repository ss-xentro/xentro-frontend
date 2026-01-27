import { eventRepository } from '@/server/repositories/event.repository';
import { institutionRepository, NewInstitutionEntity } from '@/server/repositories/institution.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { resolveMediaUrl } from '@/server/services/storage';
import { HttpError } from './http-error';

class InstitutionController {
  async listPublished() {
    const records = await institutionRepository.listPublished();
    return records.map((institution) => ({
      ...institution,
      logo: resolveMediaUrl(institution.logo),
    }));
  }

  async listAll() {
    const records = await institutionRepository.listAll();
    return records.map((institution) => ({
      ...institution,
      logo: resolveMediaUrl(institution.logo),
    }));
  }

  async create(payload: Omit<NewInstitutionEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    return institutionRepository.create(payload as NewInstitutionEntity);
  }

  async getById(id: string) {
    const institution = await institutionRepository.findById(id);
    if (!institution) {
      throw new HttpError(404, 'Institution not found');
    }

    const hydratedInstitution = { ...institution, logo: resolveMediaUrl(institution.logo) };

    const [programs, events] = await Promise.all([
      programRepository.findByInstitution(id),
      eventRepository.findByInstitution(id),
    ]);

    return { institution: hydratedInstitution, programs, events };
  }

  async update(id: string, payload: Partial<NewInstitutionEntity>) {
    const updated = await institutionRepository.updateById(id, payload as Partial<NewInstitutionEntity>);
    if (!updated) {
      throw new HttpError(404, 'Institution not found');
    }
    return { ...updated, logo: resolveMediaUrl(updated.logo) };
  }
}

export const institutionController = new InstitutionController();
