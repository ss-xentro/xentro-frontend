import { db } from '@/db/client';
import { approvers } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type ApproverEntity = InferSelectModel<typeof approvers>;
export type NewApproverEntity = InferInsertModel<typeof approvers>;

function randomEmployeeId() {
  return `XEN-${Math.floor(100000 + Math.random() * 900000)}`;
}

class ApproverRepository {
  async create(params: { name: string; email: string; mobile?: string | null }) {
    const email = params.email.toLowerCase();
    const employeeId = randomEmployeeId();
    const [record] = await db
      .insert(approvers)
      .values({ name: params.name, email, mobile: params.mobile ?? null, employeeId })
      .returning();
    return record;
  }

  async findByEmail(email: string) {
    const rows = await db.select().from(approvers).where(eq(approvers.email, email.toLowerCase())).limit(1);
    return rows[0] ?? null;
  }
}

export const approverRepository = new ApproverRepository();
