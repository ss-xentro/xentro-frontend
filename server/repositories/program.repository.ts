import { db } from '@/db/client';
import { programs } from '@/db/schemas';
import { eq, desc, and } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type ProgramEntity = InferSelectModel<typeof programs>;
export type NewProgramEntity = InferInsertModel<typeof programs>;

class ProgramRepository {
  async findByInstitution(institutionId: string) {
    return db
      .select()
      .from(programs)
      .where(eq(programs.institutionId, institutionId))
      .orderBy(desc(programs.startDate));
  }

  async findActiveByInstitution(institutionId: string) {
    return db
      .select()
      .from(programs)
      .where(and(
        eq(programs.institutionId, institutionId),
        eq(programs.isActive, true)
      ))
      .orderBy(desc(programs.startDate));
  }

  async findById(id: string) {
    const results = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    return results[0] ?? null;
  }

  async create(payload: NewProgramEntity) {
    const [record] = await db.insert(programs).values(payload).returning();
    return record;
  }

  async updateById(id: string, updates: Partial<NewProgramEntity>) {
    const [record] = await db
      .update(programs)
      .set(updates)
      .where(eq(programs.id, id))
      .returning();
    return record ?? null;
  }

  async deleteById(id: string) {
    const [deleted] = await db
      .delete(programs)
      .where(eq(programs.id, id))
      .returning();
    return deleted ?? null;
  }

  async countByInstitution(institutionId: string) {
    const result = await db
      .select()
      .from(programs)
      .where(eq(programs.institutionId, institutionId));
    return result.length;
  }
}

export const programRepository = new ProgramRepository();
