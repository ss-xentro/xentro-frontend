import { db } from '@/db/client';
import { startups, institutionApplications } from '@/db/schemas';
import { eq, inArray } from 'drizzle-orm';

class StartupRepository {
  async findByInstitution(institutionId: string) {
    console.log('[Startup Repository] Fetching startups for institution:', institutionId);

    // Also consider legacy records that may have been saved with applicationId
    const linkedApplications = await db
      .select({ id: institutionApplications.id })
      .from(institutionApplications)
      .where(eq(institutionApplications.institutionId, institutionId));

    const candidateIds = [institutionId, ...linkedApplications.map((a) => a.id)];

    const results = await db.query.startups.findMany({
      where: inArray(startups.institutionId, candidateIds),
      orderBy: (startups, { desc }) => [desc(startups.id)],
    });
    console.log('[Startup Repository] Found', results.length, 'startups (candidateIds:', candidateIds, ')');
    return results;
  }

  async findById(id: string) {
    return db.query.startups.findFirst({
      where: eq(startups.id, id),
    });
  }
}

export const startupRepository = new StartupRepository();
