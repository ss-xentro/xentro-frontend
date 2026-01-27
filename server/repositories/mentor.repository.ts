import { db } from '@/db/client';
import { mentorProfiles, users } from '@/db/schemas';
import { and, eq } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type MentorProfileEntity = InferSelectModel<typeof mentorProfiles>;
export type NewMentorProfileEntity = InferInsertModel<typeof mentorProfiles>;

class MentorRepository {
  async findProfileByUserId(userId: string) {
    const rows = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, userId)).limit(1);
    return rows[0] ?? null;
  }

  async createMentorUser(params: { name: string; email: string }) {
    const email = params.email.toLowerCase();
    const [user] = await db
      .insert(users)
      .values({ name: params.name, email, accountType: 'mentor' })
      .returning();
    return user;
  }

  async upsertProfile(payload: Partial<NewMentorProfileEntity> & { userId: string }) {
    const existing = await this.findProfileByUserId(payload.userId);
    if (existing) {
      const [updated] = await db
        .update(mentorProfiles)
        .set({
          expertise: payload.expertise ?? existing.expertise,
          rate: payload.rate ?? existing.rate,
          occupation: payload.occupation ?? existing.occupation,
          packages: payload.packages ?? existing.packages,
          achievements: payload.achievements ?? existing.achievements,
          availability: payload.availability ?? existing.availability,
          status: payload.status ?? existing.status,
          approvedAt: payload.approvedAt ?? existing.approvedAt,
          rejectedReason: payload.rejectedReason ?? existing.rejectedReason,
          verified: payload.verified ?? existing.verified,
        })
        .where(eq(mentorProfiles.userId, payload.userId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(mentorProfiles)
      .values({
        userId: payload.userId,
        expertise: payload.expertise ?? null,
        rate: payload.rate ?? null,
        occupation: payload.occupation ?? null,
        packages: payload.packages ?? null,
        achievements: payload.achievements ?? null,
        availability: payload.availability ?? null,
        status: payload.status ?? 'pending',
        verified: payload.verified ?? false,
      })
      .returning();
    return created;
  }

  async listPending(limit = 50) {
    return db
      .select({
        userId: mentorProfiles.userId,
        status: mentorProfiles.status,
        expertise: mentorProfiles.expertise,
        occupation: mentorProfiles.occupation,
        rate: mentorProfiles.rate,
        achievements: mentorProfiles.achievements,
        packages: mentorProfiles.packages,
        availability: mentorProfiles.availability,
        name: users.name,
        email: users.email,
      })
      .from(mentorProfiles)
      .leftJoin(users, eq(users.id, mentorProfiles.userId))
      .where(and(eq(mentorProfiles.status, 'pending')))
      .limit(limit);
  }
}

export const mentorRepository = new MentorRepository();
