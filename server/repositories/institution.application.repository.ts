import { db } from '@/db/client';
import { institutionApplications } from '@/db/schemas';
import { InferInsertModel, InferSelectModel, eq } from 'drizzle-orm';

export type InstitutionApplicationEntity = InferSelectModel<typeof institutionApplications>;
export type NewInstitutionApplication = InferInsertModel<typeof institutionApplications>;

class InstitutionApplicationRepository {
  async create(payload: NewInstitutionApplication) {
    const [record] = await db.insert(institutionApplications).values(payload).returning();
    return record;
  }

  async listAll() {
    return db.select().from(institutionApplications).orderBy(institutionApplications.createdAt);
  }

  async findById(id: string) {
    const [record] = await db.select().from(institutionApplications).where(eq(institutionApplications.id, id)).limit(1);
    return record ?? null;
  }

  async findByToken(token: string) {
    const [record] = await db
      .select()
      .from(institutionApplications)
      .where(eq(institutionApplications.verificationToken, token))
      .limit(1);
    return record ?? null;
  }

  async findByEmail(email: string) {
    const [record] = await db
      .select()
      .from(institutionApplications)
      .where(eq(institutionApplications.email, email))
      .limit(1);
    return record ?? null;
  }

  async markVerified(token: string) {
    const [record] = await db
      .update(institutionApplications)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(institutionApplications.verificationToken, token))
      .returning();
    return record ?? null;
  }

  async updateApplicant(id: string, applicantUserId: string | null) {
    const [record] = await db
      .update(institutionApplications)
      .set({ applicantUserId, updatedAt: new Date() })
      .where(eq(institutionApplications.id, id))
      .returning();
    return record ?? null;
  }

  async updateDetails(id: string, updates: Partial<NewInstitutionApplication>) {
    const [record] = await db
      .update(institutionApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(institutionApplications.id, id))
      .returning();
    return record ?? null;
  }

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected', remark?: string | null, institutionId?: string | null) {
    const [record] = await db
      .update(institutionApplications)
      .set({ status, remark: remark ?? null, institutionId: institutionId ?? null, updatedAt: new Date() })
      .where(eq(institutionApplications.id, id))
      .returning();
    return record ?? null;
  }
}

export const institutionApplicationRepository = new InstitutionApplicationRepository();
