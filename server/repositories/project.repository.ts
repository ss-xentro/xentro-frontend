import { db } from '@/db/client';
import { projects } from '@/db/schemas';
import { eq, desc } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type ProjectEntity = InferSelectModel<typeof projects>;
export type NewProjectEntity = InferInsertModel<typeof projects>;

class ProjectRepository {
    async findByInstitution(institutionId: string) {
        return db
            .select()
            .from(projects)
            .where(eq(projects.institutionId, institutionId))
            .orderBy(desc(projects.createdAt));
    }

    async findById(id: string) {
        const results = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);
        return results[0] ?? null;
    }

    async create(payload: NewProjectEntity) {
        const [record] = await db.insert(projects).values(payload).returning();
        return record;
    }

    async updateById(id: string, updates: Partial<NewProjectEntity>) {
        const [record] = await db
            .update(projects)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();
        return record ?? null;
    }

    async deleteById(id: string) {
        const [deleted] = await db
            .delete(projects)
            .where(eq(projects.id, id))
            .returning();
        return deleted ?? null;
    }

    async countByInstitution(institutionId: string) {
        const result = await db
            .select()
            .from(projects)
            .where(eq(projects.institutionId, institutionId));
        return result.length;
    }
}

export const projectRepository = new ProjectRepository();
