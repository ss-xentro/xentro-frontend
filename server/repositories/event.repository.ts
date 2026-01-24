import { db } from '@/db/client';
import { events } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type EventEntity = InferSelectModel<typeof events>;
export type NewEventEntity = InferInsertModel<typeof events>;

class EventRepository {
  async findByInstitution(institutionId: string) {
    return db.select().from(events).where(eq(events.institutionId, institutionId));
  }

  async create(payload: NewEventEntity) {
    const [record] = await db.insert(events).values(payload).returning();
    return record;
  }
}

export const eventRepository = new EventRepository();
