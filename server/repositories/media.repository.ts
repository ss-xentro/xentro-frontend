import { db } from '@/db/client';
import { mediaAssets } from '@/db/schemas';
import { InferInsertModel, InferSelectModel, eq } from 'drizzle-orm';

export type MediaAssetEntity = InferSelectModel<typeof mediaAssets>;
export type NewMediaAssetEntity = InferInsertModel<typeof mediaAssets>;

class MediaRepository {
  async create(payload: NewMediaAssetEntity) {
    const [record] = await db.insert(mediaAssets).values(payload).returning();
    return record;
  }

  async findById(id: string) {
    const results = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
    return results[0] ?? null;
  }
}

export const mediaRepository = new MediaRepository();
