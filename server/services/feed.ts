/**
 * XENTRO Feed Service
 * 
 * Feed built from form submissions - No comments in Phase-1
 * Interactions: appreciation (❤️), viewed (👁️), mentor tip (💡)
 */

import { db } from '@/db/client';
import * as schema from '@/db/schemas';
import { eq, and, desc, sql, not, inArray, or, ilike } from 'drizzle-orm';
import { logActivity } from './activity';
import type { FeedItem, FeedInteraction, UserContext } from '@/lib/unified-types';

// ============================================
// FEED ITEM CRUD
// ============================================

export type CreateFeedItemParams = {
  sourceType: 'startup' | 'institution' | 'mentor' | 'event' | 'program' | 'content';
  sourceId: string;
  title: string;
  summary?: string;
  coverImage?: string;
  sectors: string[];
  stages: string[];
  createdBy: string;
  creatorType?: 'startup' | 'institution' | 'mentor' | 'user';
  creatorId?: string;
  creatorName?: string;
  creatorLogo?: string;
};

/**
 * Create a feed item (called after form approval)
 */
export async function createFeedItem(params: CreateFeedItemParams): Promise<FeedItem> {
  const [item] = await db
    .insert(schema.feedItems)
    .values({
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      title: params.title,
      summary: params.summary,
      imageUrl: params.coverImage,
      sectors: params.sectors,
      stages: params.stages,
      createdBy: params.createdBy,
      creatorType: params.creatorType,
      creatorId: params.creatorId,
      creatorName: params.creatorName,
      creatorLogo: params.creatorLogo,
      isPublic: true,
      score: 0,
      viewCount: 0,
      appreciationCount: 0,
      mentorTipCount: 0,
    })
    .returning();

  return item as FeedItem;
}

/**
 * Update feed item
 */
export async function updateFeedItem(
  feedItemId: string,
  updates: Partial<{
    title: string;
    summary: string;
    imageUrl: string;
    sectors: string[];
    stages: string[];
    isPublic: boolean;
  }>
): Promise<FeedItem | null> {
  const [updated] = await db
    .update(schema.feedItems)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(schema.feedItems.id, feedItemId))
    .returning();

  return updated as FeedItem | null;
}

/**
 * Delete feed item (hard delete since we don't have isActive)
 */
export async function deleteFeedItem(feedItemId: string): Promise<void> {
  await db
    .delete(schema.feedItems)
    .where(eq(schema.feedItems.id, feedItemId));
}

// ============================================
// FEED INTERACTIONS
// ============================================

type InteractionType = 'viewed' | 'appreciate' | 'mentor_tip';

/**
 * Record a feed interaction
 */
export async function recordInteraction(params: {
  feedItemId: string;
  userId: string;
  type: InteractionType;
  tipAmount?: number;
  tipNote?: string;
}): Promise<FeedInteraction | null> {
  // Check if interaction already exists (for appreciated - can only do once)
  if (params.type === 'appreciate') {
    const [existing] = await db
      .select()
      .from(schema.feedInteractions)
      .where(
        and(
          eq(schema.feedInteractions.feedItemId, params.feedItemId),
          eq(schema.feedInteractions.userId, params.userId),
          eq(schema.feedInteractions.type, 'appreciate')
        )
      )
      .limit(1);

    if (existing) {
      return null; // Already appreciated
    }
  }

  // For views, check if already viewed recently (within 24h)
  if (params.type === 'viewed') {
    const [recentView] = await db
      .select()
      .from(schema.feedInteractions)
      .where(
        and(
          eq(schema.feedInteractions.feedItemId, params.feedItemId),
          eq(schema.feedInteractions.userId, params.userId),
          eq(schema.feedInteractions.type, 'viewed'),
          sql`${schema.feedInteractions.createdAt} > NOW() - INTERVAL '24 hours'`
        )
      )
      .limit(1);

    if (recentView) {
      return recentView as FeedInteraction; // Don't double count views
    }
  }

  const [interaction] = await db
    .insert(schema.feedInteractions)
    .values({
      feedItemId: params.feedItemId,
      userId: params.userId,
      type: params.type,
    })
    .returning();

  // Update feed item counts
  await updateFeedItemCounts(params.feedItemId, params.type, 1);

  // Recalculate score
  await recalculateScore(params.feedItemId);

  return interaction as FeedInteraction;
}

/**
 * Remove appreciation (unlike)
 */
export async function removeAppreciation(params: {
  feedItemId: string;
  userId: string;
}): Promise<boolean> {
  const result = await db
    .delete(schema.feedInteractions)
    .where(
      and(
        eq(schema.feedInteractions.feedItemId, params.feedItemId),
        eq(schema.feedInteractions.userId, params.userId),
        eq(schema.feedInteractions.type, 'appreciate')
      )
    )
    .returning();

  if (result.length > 0) {
    await updateFeedItemCounts(params.feedItemId, 'appreciate', -1);
    await recalculateScore(params.feedItemId);
    return true;
  }

  return false;
}

/**
 * Update feed item interaction counts
 */
async function updateFeedItemCounts(
  feedItemId: string,
  type: InteractionType,
  delta: number
): Promise<void> {
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  switch (type) {
    case 'viewed':
      updates.viewCount = sql`COALESCE(view_count, 0) + ${delta}`;
      break;
    case 'appreciate':
      updates.appreciationCount = sql`COALESCE(appreciation_count, 0) + ${delta}`;
      break;
    case 'mentor_tip':
      updates.mentorTipCount = sql`COALESCE(mentor_tip_count, 0) + ${delta}`;
      break;
  }

  await db
    .update(schema.feedItems)
    .set(updates)
    .where(eq(schema.feedItems.id, feedItemId));
}

// ============================================
// RANKING
// ============================================

/**
 * Recalculate score for a feed item
 * Formula: appreciations * 3 + mentor_tips * 5 + views * 0.1 + recency_bonus
 */
async function recalculateScore(feedItemId: string): Promise<void> {
  const [item] = await db
    .select()
    .from(schema.feedItems)
    .where(eq(schema.feedItems.id, feedItemId))
    .limit(1);

  if (!item) return;

  const appreciationScore = (item.appreciationCount || 0) * 3;
  const mentorTipScore = (item.mentorTipCount || 0) * 5;
  const viewScore = (item.viewCount || 0) * 0.1;
  
  // Recency bonus: decays over time (max 10 points for items < 1 day old)
  const ageInHours = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
  const recencyBonus = Math.max(0, 10 - (ageInHours / 24) * 2);

  const score = Math.round(appreciationScore + mentorTipScore + viewScore + recencyBonus);

  await db
    .update(schema.feedItems)
    .set({ score })
    .where(eq(schema.feedItems.id, feedItemId));
}

/**
 * Batch recalculate all scores (run periodically)
 */
export async function recalculateAllScores(): Promise<void> {
  const items = await db
    .select({ id: schema.feedItems.id })
    .from(schema.feedItems)
    .where(eq(schema.feedItems.isPublic, true));

  for (const item of items) {
    await recalculateScore(item.id);
  }
}

// ============================================
// FEED QUERIES
// ============================================

export type FeedQueryParams = {
  userId?: string;
  context?: UserContext;
  sectors?: string[];
  stages?: string[];
  sourceTypes?: string[];
  search?: string;
  cursor?: string;
  limit?: number;
  sort?: 'rank' | 'recent' | 'trending';
};

/**
 * Get personalized feed
 */
export async function getFeed(params: FeedQueryParams): Promise<{
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const limit = params.limit || 20;
  
  // Build base query conditions
  const conditions = [eq(schema.feedItems.isPublic, true)];

  // Filter by sectors if specified
  if (params.sectors && params.sectors.length > 0) {
    conditions.push(
      sql`${schema.feedItems.sectors} && ARRAY[${sql.join(params.sectors.map(s => sql`${s}`), sql`, `)}]::text[]`
    );
  }

  // Filter by stages if specified
  if (params.stages && params.stages.length > 0) {
    conditions.push(
      sql`${schema.feedItems.stages} && ARRAY[${sql.join(params.stages.map(s => sql`${s}`), sql`, `)}]::text[]`
    );
  }

  // Filter by source types
  if (params.sourceTypes && params.sourceTypes.length > 0) {
    conditions.push(inArray(schema.feedItems.sourceType, params.sourceTypes));
  }

  // Search
  if (params.search) {
    conditions.push(
      or(
        ilike(schema.feedItems.title, `%${params.search}%`),
        ilike(schema.feedItems.summary, `%${params.search}%`)
      )!
    );
  }

  // Cursor-based pagination
  if (params.cursor) {
    const cursorData = decodeCursor(params.cursor);
    if (cursorData) {
      if (params.sort === 'rank') {
        conditions.push(
          sql`(${schema.feedItems.score}, ${schema.feedItems.id}) < (${cursorData.score}, ${cursorData.id})`
        );
      } else {
        conditions.push(
          sql`(${schema.feedItems.createdAt}, ${schema.feedItems.id}) < (${cursorData.date}, ${cursorData.id})`
        );
      }
    }
  }

  // Build order by
  let orderBy;
  switch (params.sort) {
    case 'rank':
      orderBy = [desc(schema.feedItems.score), desc(schema.feedItems.id)];
      break;
    case 'trending':
      // Trending = high recent engagement
      orderBy = [
        sql`(${schema.feedItems.appreciationCount} + ${schema.feedItems.viewCount} * 0.1) / EXTRACT(EPOCH FROM (NOW() - ${schema.feedItems.createdAt})) DESC`,
        desc(schema.feedItems.id)
      ];
      break;
    case 'recent':
    default:
      orderBy = [desc(schema.feedItems.createdAt), desc(schema.feedItems.id)];
  }

  const items = await db
    .select()
    .from(schema.feedItems)
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(limit + 1); // Fetch one extra to check for more

  const hasMore = items.length > limit;
  const resultItems = hasMore ? items.slice(0, limit) : items;

  // Generate next cursor
  let nextCursor: string | undefined;
  if (hasMore && resultItems.length > 0) {
    const lastItem = resultItems[resultItems.length - 1];
    nextCursor = encodeCursor({
      id: lastItem.id,
      score: lastItem.score || 0,
      date: lastItem.createdAt.toISOString(),
    });
  }

  // If user is logged in, mark interactions
  if (params.userId) {
    const itemIds = resultItems.map(i => i.id);
    const interactions = await db
      .select()
      .from(schema.feedInteractions)
      .where(
        and(
          inArray(schema.feedInteractions.feedItemId, itemIds),
          eq(schema.feedInteractions.userId, params.userId)
        )
      );

    // Attach interaction info to items
    const interactionMap = new Map<string, Set<string>>();
    for (const i of interactions) {
      if (!interactionMap.has(i.feedItemId)) {
        interactionMap.set(i.feedItemId, new Set());
      }
      interactionMap.get(i.feedItemId)!.add(i.type);
    }

    for (const item of resultItems) {
      const itemInteractions = interactionMap.get(item.id);
      (item as FeedItem & { userInteractions?: string[] }).userInteractions = 
        itemInteractions ? Array.from(itemInteractions) : [];
    }
  }

  return {
    items: resultItems as FeedItem[],
    nextCursor,
    hasMore,
  };
}

/**
 * Get feed item by ID
 */
export async function getFeedItemById(feedItemId: string): Promise<FeedItem | null> {
  const [item] = await db
    .select()
    .from(schema.feedItems)
    .where(eq(schema.feedItems.id, feedItemId))
    .limit(1);

  return item as FeedItem | null;
}

/**
 * Get user's appreciations
 */
export async function getUserAppreciations(userId: string): Promise<FeedItem[]> {
  const interactions = await db
    .select({ feedItemId: schema.feedInteractions.feedItemId })
    .from(schema.feedInteractions)
    .where(
      and(
        eq(schema.feedInteractions.userId, userId),
        eq(schema.feedInteractions.type, 'appreciate')
      )
    );

  if (interactions.length === 0) return [];

  const items = await db
    .select()
    .from(schema.feedItems)
    .where(inArray(schema.feedItems.id, interactions.map(i => i.feedItemId)));

  return items as FeedItem[];
}

// ============================================
// CURSOR HELPERS
// ============================================

type CursorData = {
  id: string;
  score: number;
  date: string;
};

function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

function decodeCursor(cursor: string): CursorData | null {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}
