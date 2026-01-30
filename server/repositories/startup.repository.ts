import { db } from '@/db/client';
import { startups, institutionApplications, users, teamMembers } from '@/db/schemas';
import { eq, inArray, desc, sql } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type StartupEntity = InferSelectModel<typeof startups>;
export type NewStartupEntity = InferInsertModel<typeof startups>;

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

  async findByIdWithDetails(id: string) {
    const startup = await db.query.startups.findFirst({
      where: eq(startups.id, id),
    });

    if (!startup) return null;

    // Get team members with user details
    const members = await db
      .select({
        id: teamMembers.id,
        role: teamMembers.role,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.startupId, id));

    // Get owner details
    let owner = null;
    if (startup.ownerId) {
      owner = await db.query.users.findFirst({
        where: eq(users.id, startup.ownerId),
        columns: { id: true, name: true, email: true },
      });
    }

    return { ...startup, teamMembers: members, owner };
  }

  async create(payload: NewStartupEntity) {
    const [record] = await db.insert(startups).values(payload).returning();
    return record;
  }

  async updateById(id: string, updates: Partial<NewStartupEntity>) {
    const [record] = await db
      .update(startups)
      .set(updates)
      .where(eq(startups.id, id))
      .returning();
    return record ?? null;
  }

  async deleteById(id: string) {
    // Delete team members first (cascade should handle this but be explicit)
    await db.delete(teamMembers).where(eq(teamMembers.startupId, id));
    
    const [deleted] = await db
      .delete(startups)
      .where(eq(startups.id, id))
      .returning();
    return deleted ?? null;
  }

  async countByInstitution(institutionId: string) {
    const results = await this.findByInstitution(institutionId);
    return results.length;
  }

  async findBySlug(slug: string) {
    return db.query.startups.findFirst({
      where: eq(startups.slug, slug),
    });
  }

  async findBySlugOrId(identifier: string) {
    // First try to find by slug
    let startup = await db.query.startups.findFirst({
      where: eq(startups.slug, identifier),
    });
    
    // If not found, try by ID (UUID format check)
    if (!startup && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)) {
      startup = await db.query.startups.findFirst({
        where: eq(startups.id, identifier),
      });
    }
    
    return startup;
  }

  async findBySlugOrIdWithDetails(identifier: string) {
    const startup = await this.findBySlugOrId(identifier);
    if (!startup) return null;

    // Get team members with user details
    const members = await db
      .select({
        id: teamMembers.id,
        role: teamMembers.role,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.startupId, startup.id));

    // Get owner details
    let owner = null;
    if (startup.ownerId) {
      owner = await db.query.users.findFirst({
        where: eq(users.id, startup.ownerId),
        columns: { id: true, name: true, email: true },
      });
    }

    return { ...startup, teamMembers: members, owner };
  }

  async incrementProfileViews(id: string) {
    const [updated] = await db
      .update(startups)
      .set({ 
        profileViews: sql`COALESCE(${startups.profileViews}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(startups.id, id))
      .returning();
    return updated ?? null;
  }

  async listPublished(limit = 50) {
    return db.query.startups.findMany({
      where: eq(startups.status, 'active'),
      orderBy: [desc(startups.createdAt)],
      limit,
    });
  }

  // Team member methods
  async addTeamMember(startupId: string, userId: string, role: string) {
    const [record] = await db
      .insert(teamMembers)
      .values({ startupId, userId, role })
      .returning();
    return record;
  }

  async removeTeamMember(memberId: string) {
    const [deleted] = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .returning();
    return deleted ?? null;
  }
}

export const startupRepository = new StartupRepository();
