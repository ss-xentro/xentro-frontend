import { eventRepository } from '@/server/repositories/event.repository';
import { institutionRepository, NewInstitutionEntity } from '@/server/repositories/institution.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { HttpError } from './http-error';

class InstitutionController {
  async listPublished() {
    return institutionRepository.listPublished();
  }

  async create(payload: Omit<NewInstitutionEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    return institutionRepository.create(payload as NewInstitutionEntity);
  }

  async getById(id: string) {
    const institution = await institutionRepository.findById(id);
    if (!institution) {
      throw new HttpError(404, 'Institution not found');
    }

    const [programs, events] = await Promise.all([
      programRepository.findByInstitution(id),
      eventRepository.findByInstitution(id),
    ]);

    return { institution, programs, events };
  }
}

export const institutionController = new InstitutionController();
