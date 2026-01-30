import { db } from '@/db/client';
import { institutions } from '@/db/schemas';
import { desc, eq, sql } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type InstitutionEntity = InferSelectModel<typeof institutions>;
export type NewInstitutionEntity = InferInsertModel<typeof institutions>;

// Generate URL-friendly slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Generate unique slug by appending number if needed
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.slug, slug))
      .limit(1);

    if (existing.length === 0 || (excludeId && existing[0]?.id === excludeId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

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

  async findBySlug(slug: string) {
    const results = await db.select().from(institutions).where(eq(institutions.slug, slug)).limit(1);
    return results[0] ?? null;
  }

  async findByIdOrSlug(identifier: string) {
    // Try UUID first, then slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    if (isUUID) {
      return this.findById(identifier);
    }
    
    return this.findBySlug(identifier);
  }

  async findByEmail(email: string) {
    const results = await db.select().from(institutions).where(eq(institutions.email, email)).limit(1);
    return results[0] ?? null;
  }

  async create(payload: Omit<NewInstitutionEntity, 'slug'> & { slug?: string }) {
    // Generate unique slug from name if not provided
    const slug = payload.slug || await generateUniqueSlug(payload.name);
    
    const [record] = await db.insert(institutions).values({ ...payload, slug }).returning();
    return record;
  }

  async updateById(id: string, updates: Partial<NewInstitutionEntity>) {
    // If name is being updated, consider updating slug too
    if (updates.name && !updates.slug) {
      updates.slug = await generateUniqueSlug(updates.name, id);
    }
    
    const [record] = await db
      .update(institutions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    return record ?? null;
  }

  async deleteById(id: string) {
    const [deleted] = await db
      .delete(institutions)
      .where(eq(institutions.id, id))
      .returning();
    return deleted ?? null;
  }

  async incrementProfileViews(id: string) {
    await db
      .update(institutions)
      .set({ 
        profileViews: sql`${institutions.profileViews} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(institutions.id, id));
  }
}

export const institutionRepository = new InstitutionRepository();
