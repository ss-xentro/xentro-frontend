import { db } from '@/db/client';
import { institutionMembers, users } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type InstitutionMemberEntity = InferSelectModel<typeof institutionMembers>;
export type NewInstitutionMemberEntity = InferInsertModel<typeof institutionMembers>;

class InstitutionMemberRepository {
  async findByInstitution(institutionId: string) {
    return db
      .select({
        id: institutionMembers.id,
        institutionId: institutionMembers.institutionId,
        userId: institutionMembers.userId,
        role: institutionMembers.role,
        invitedAt: institutionMembers.invitedAt,
        acceptedAt: institutionMembers.acceptedAt,
        isActive: institutionMembers.isActive,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(institutionMembers)
      .leftJoin(users, eq(institutionMembers.userId, users.id))
      .where(and(
        eq(institutionMembers.institutionId, institutionId),
        eq(institutionMembers.isActive, true)
      ));
  }

  async findById(id: string) {
    return db.query.institutionMembers.findFirst({
      where: eq(institutionMembers.id, id),
    });
  }

  async findByUserAndInstitution(userId: string, institutionId: string) {
    return db.query.institutionMembers.findFirst({
      where: and(
        eq(institutionMembers.userId, userId),
        eq(institutionMembers.institutionId, institutionId)
      ),
    });
  }

  async create(payload: NewInstitutionMemberEntity) {
    const [record] = await db
      .insert(institutionMembers)
      .values(payload)
      .returning();
    return record;
  }

  async updateById(id: string, updates: Partial<NewInstitutionMemberEntity>) {
    const [record] = await db
      .update(institutionMembers)
      .set(updates)
      .where(eq(institutionMembers.id, id))
      .returning();
    return record ?? null;
  }

  async deactivate(id: string) {
    const [record] = await db
      .update(institutionMembers)
      .set({ isActive: false })
      .where(eq(institutionMembers.id, id))
      .returning();
    return record ?? null;
  }

  async deleteById(id: string) {
    const [deleted] = await db
      .delete(institutionMembers)
      .where(eq(institutionMembers.id, id))
      .returning();
    return deleted ?? null;
  }

  async countByInstitution(institutionId: string) {
    const result = await db
      .select()
      .from(institutionMembers)
      .where(and(
        eq(institutionMembers.institutionId, institutionId),
        eq(institutionMembers.isActive, true)
      ));
    return result.length;
  }
}

export const institutionMemberRepository = new InstitutionMemberRepository();
