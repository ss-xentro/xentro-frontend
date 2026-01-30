import { startupRepository } from '@/server/repositories/startup.repository';
import { resolveMediaUrl } from '@/server/services/storage';
import { HttpError } from './http-error';

function normalizeStartup(startup: any) {
  return {
    ...startup,
    logo: resolveMediaUrl(startup.logo),
    coverImage: resolveMediaUrl(startup.coverImage),
  };
}

class StartupController {
  async listPublished(limit = 50) {
    const startups = await startupRepository.listPublished(limit);
    return startups.map(normalizeStartup);
  }

  async getBySlugOrId(identifier: string, trackView = false) {
    const result = await startupRepository.findBySlugOrIdWithDetails(identifier);
    if (!result) {
      throw new HttpError(404, 'Startup not found');
    }

    // Track profile view for public requests
    if (trackView) {
      await startupRepository.incrementProfileViews(result.id);
    }

    return {
      ...normalizeStartup(result),
      teamMembers: result.teamMembers,
      owner: result.owner,
    };
  }

  async getById(id: string) {
    const result = await startupRepository.findByIdWithDetails(id);
    if (!result) {
      throw new HttpError(404, 'Startup not found');
    }
    return normalizeStartup(result);
  }
}

export const startupController = new StartupController();
