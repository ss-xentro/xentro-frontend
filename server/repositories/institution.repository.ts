import { db } from '@/db/client';
import { institutions } from '@/db/schemas';
import { desc, eq } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type InstitutionEntity = InferSelectModel<typeof institutions>;
export type NewInstitutionEntity = InferInsertModel<typeof institutions>;

class InstitutionRepository {
  async listPublished() {
    return db
      .select()
      .from(institutions)
      .where(eq(institutions.status, 'published'))
      .orderBy(desc(institutions.createdAt));
  }

  async listAll() {
    return db.select().from(institutions).orderBy(desc(institutions.createdAt));
  }

  async findById(id: string) {
    const results = await db.select().from(institutions).where(eq(institutions.id, id)).limit(1);
    return results[0] ?? null;
  }

  async create(payload: NewInstitutionEntity) {
    const [record] = await db.insert(institutions).values(payload).returning();
    return record;
  }

  async updateById(id: string, updates: Partial<NewInstitutionEntity>) {
    const [record] = await db
      .update(institutions)
      .set(updates)
      .where(eq(institutions.id, id))
      .returning();
    return record ?? null;
  }
}

export const institutionRepository = new InstitutionRepository();
