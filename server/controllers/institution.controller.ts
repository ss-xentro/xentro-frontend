import { eventRepository } from '@/server/repositories/event.repository';
import { institutionRepository, NewInstitutionEntity } from '@/server/repositories/institution.repository';
import { institutionMemberRepository } from '@/server/repositories/institutionMember.repository';
import { programRepository } from '@/server/repositories/program.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import { startupRepository } from '@/server/repositories/startup.repository';
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

  async create(payload: Omit<NewInstitutionEntity, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) {
    return institutionRepository.create(payload as NewInstitutionEntity);
  }

  async getById(id: string, incrementViews: boolean = false) {
    // Support both UUID and slug lookups
    const institution = await institutionRepository.findByIdOrSlug(id);
    if (!institution) {
      throw new HttpError(404, 'Institution not found');
    }

    // Increment profile views for public access
    if (incrementViews) {
      await institutionRepository.incrementProfileViews(institution.id);
    }

    const hydratedInstitution = { ...institution, logo: resolveMediaUrl(institution.logo) };

    const [programs, events, startups, team, projects] = await Promise.all([
      programRepository.findByInstitution(institution.id),
      eventRepository.findByInstitution(institution.id),
      startupRepository.findByInstitution(institution.id),
      institutionMemberRepository.findByInstitution(institution.id),
      projectRepository.findByInstitution(institution.id),
    ]);

    console.log('[Institution Controller] Returning data:', {
      institutionId: institution.id,
      slug: institution.slug,
      programsCount: programs.length,
      eventsCount: events.length,
      startupsCount: startups.length,
      teamCount: team.length,
      projectsCount: projects.length,
    });
    return { institution: hydratedInstitution, programs, events, startups, team, projects };
  }

  async getBySlug(slug: string, incrementViews: boolean = false) {
    const institution = await institutionRepository.findBySlug(slug);
    if (!institution) {
      throw new HttpError(404, 'Institution not found');
    }

    if (incrementViews) {
      await institutionRepository.incrementProfileViews(institution.id);
    }

    const hydratedInstitution = { ...institution, logo: resolveMediaUrl(institution.logo) };

    const [programs, events, startups, team, projects] = await Promise.all([
      programRepository.findByInstitution(institution.id),
      eventRepository.findByInstitution(institution.id),
      startupRepository.findByInstitution(institution.id),
      institutionMemberRepository.findByInstitution(institution.id),
      projectRepository.findByInstitution(institution.id),
    ]);

    return { institution: hydratedInstitution, programs, events, startups, team, projects };
  }

  async update(id: string, payload: Partial<NewInstitutionEntity>) {
    const updated = await institutionRepository.updateById(id, payload as Partial<NewInstitutionEntity>);
    if (!updated) {
      throw new HttpError(404, 'Institution not found');
    }
    return { ...updated, logo: resolveMediaUrl(updated.logo) };
  }

  async delete(id: string) {
    const deleted = await institutionRepository.deleteById(id);
    if (!deleted) {
      throw new HttpError(404, 'Institution not found');
    }
    return { success: true };
  }
}

export const institutionController = new InstitutionController();
