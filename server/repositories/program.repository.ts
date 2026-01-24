import { db } from '@/db/client';
import { programs } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type ProgramEntity = InferSelectModel<typeof programs>;
export type NewProgramEntity = InferInsertModel<typeof programs>;

class ProgramRepository {
  async findByInstitution(institutionId: string) {
    return db.select().from(programs).where(eq(programs.institutionId, institutionId));
  }

  async create(payload: NewProgramEntity) {
    const [record] = await db.insert(programs).values(payload).returning();
    return record;
  }
}

export const programRepository = new ProgramRepository();
