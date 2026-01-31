/**
 * XENTRO Activity Logging Service
 * 
 * Audit trail for all actions in the system
 */

import { db } from '@/db/client';
import * as schema from '@/db/schemas';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import type { ActivityLog } from '@/lib/unified-types';

export type ActivityAction = 
  // Form actions
  | 'form_created'
  | 'form_submitted'
  | 'form_approved'
  | 'form_rejected'
  | 'form_request_changes'
  // Auth actions
  | 'user_signup'
  | 'user_login'
  | 'context_switched'
  | 'context_unlocked'
  // Entity actions
  | 'startup_created'
  | 'startup_updated'
  | 'startup_member_added'
  | 'startup_member_removed'
  | 'institution_created'
  | 'institution_updated'
  | 'institution_member_added'
  | 'institution_member_removed'
  | 'mentor_approved'
  | 'mentor_updated'
  | 'event_created'
  | 'program_created'
  // Feed actions
  | 'feed_appreciated'
  | 'feed_viewed'
  | 'mentor_tip_sent'
  // Admin actions
  | 'admin_granted'
  | 'admin_revoked'
  | 'admin_permission_changed';

export type LogActivityParams = {
  userId?: string;
  action: ActivityAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Log an activity
 */
export async function logActivity(params: LogActivityParams): Promise<ActivityLog> {
  const [log] = await db
    .insert(schema.activityLogs)
    .values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
    .returning();

  return log as ActivityLog;
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    actions?: ActivityAction[];
    since?: Date;
  }
): Promise<ActivityLog[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const conditions = [eq(schema.activityLogs.userId, userId)];

  if (options?.since) {
    conditions.push(gte(schema.activityLogs.createdAt, options.since));
  }

  let logs = await db
    .select()
    .from(schema.activityLogs)
    .where(and(...conditions))
    .orderBy(desc(schema.activityLogs.createdAt))
    .limit(limit)
    .offset(offset);

  // Filter by actions in JS if specified (Drizzle doesn't have easy array filtering)
  if (options?.actions && options.actions.length > 0) {
    logs = logs.filter(log => options.actions!.includes(log.action as ActivityAction));
  }

  return logs as ActivityLog[];
}

/**
 * Get activity logs for an entity
 */
export async function getEntityActivityLogs(
  entityType: string,
  entityId: string,
  options?: {
    limit?: number;
    offset?: number;
    since?: Date;
  }
): Promise<ActivityLog[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const conditions = [
    eq(schema.activityLogs.entityType, entityType),
    eq(schema.activityLogs.entityId, entityId),
  ];

  if (options?.since) {
    conditions.push(gte(schema.activityLogs.createdAt, options.since));
  }

  const logs = await db
    .select()
    .from(schema.activityLogs)
    .where(and(...conditions))
    .orderBy(desc(schema.activityLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return logs as ActivityLog[];
}

/**
 * Get all activity logs (admin)
 */
export async function getAllActivityLogs(
  options?: {
    limit?: number;
    offset?: number;
    actions?: ActivityAction[];
    entityType?: string;
    since?: Date;
    userId?: string;
  }
): Promise<{ logs: ActivityLog[]; total: number }> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  const conditions = [];

  if (options?.userId) {
    conditions.push(eq(schema.activityLogs.userId, options.userId));
  }

  if (options?.entityType) {
    conditions.push(eq(schema.activityLogs.entityType, options.entityType));
  }

  if (options?.since) {
    conditions.push(gte(schema.activityLogs.createdAt, options.since));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, countResult] = await Promise.all([
    db
      .select()
      .from(schema.activityLogs)
      .where(whereClause)
      .orderBy(desc(schema.activityLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.activityLogs)
      .where(whereClause),
  ]);

  let filteredLogs = logs;
  if (options?.actions && options.actions.length > 0) {
    filteredLogs = logs.filter(log => options.actions!.includes(log.action as ActivityAction));
  }

  return {
    logs: filteredLogs as ActivityLog[],
    total: Number(countResult[0]?.count || 0),
  };
}

/**
 * Get activity summary for a user
 */
export async function getUserActivitySummary(
  userId: string,
  days: number = 30
): Promise<{
  totalActions: number;
  byAction: Record<string, number>;
  byDay: { date: string; count: number }[];
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await db
    .select()
    .from(schema.activityLogs)
    .where(
      and(
        eq(schema.activityLogs.userId, userId),
        gte(schema.activityLogs.createdAt, since)
      )
    );

  // Count by action
  const byAction: Record<string, number> = {};
  for (const log of logs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
  }

  // Count by day
  const byDayMap: Record<string, number> = {};
  for (const log of logs) {
    const date = log.createdAt.toISOString().split('T')[0];
    byDayMap[date] = (byDayMap[date] || 0) + 1;
  }

  const byDay = Object.entries(byDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalActions: logs.length,
    byAction,
    byDay,
  };
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(
  options: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
  }
): Promise<ActivityLog[]> {
  const limit = options.limit || 10;
  const conditions = [];

  if (options.userId) {
    conditions.push(eq(schema.activityLogs.userId, options.userId));
  }

  if (options.entityType) {
    conditions.push(eq(schema.activityLogs.entityType, options.entityType));
  }

  if (options.entityId) {
    conditions.push(eq(schema.activityLogs.entityId, options.entityId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const logs = await db
    .select()
    .from(schema.activityLogs)
    .where(whereClause)
    .orderBy(desc(schema.activityLogs.createdAt))
    .limit(limit);

  return logs as ActivityLog[];
}
