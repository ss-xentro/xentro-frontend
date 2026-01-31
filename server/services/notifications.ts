/**
 * XENTRO Notifications Service
 */

import { db } from '@/db/client';
import * as schema from '@/db/schemas';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import type { Notification } from '@/lib/unified-types';

export type NotificationType = 
  | 'form_submitted'
  | 'form_approved'
  | 'form_rejected'
  | 'form_changes_requested'
  | 'context_unlocked'
  | 'team_invite'
  | 'team_invite_accepted'
  | 'mentor_tip_received'
  | 'appreciation_received'
  | 'system';

export type SendNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
};

/**
 * Send a notification to a user
 */
export async function sendNotification(params: SendNotificationParams): Promise<Notification> {
  const [notification] = await db
    .insert(schema.notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      entityType: params.entityType,
      entityId: params.entityId,
      actionUrl: params.actionUrl,
      isRead: false,
    })
    .returning();

  // TODO: Send push notification / email based on user preferences

  return notification as Notification;
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotifications(
  userIds: string[],
  params: Omit<SendNotificationParams, 'userId'>
): Promise<number> {
  if (userIds.length === 0) return 0;

  const values = userIds.map(userId => ({
    userId,
    type: params.type,
    title: params.title,
    message: params.message,
    entityType: params.entityType,
    entityId: params.entityId,
    actionUrl: params.actionUrl,
    isRead: false,
  }));

  const result = await db
    .insert(schema.notifications)
    .values(values)
    .returning();

  return result.length;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const conditions = [eq(schema.notifications.userId, userId)];

  if (options?.unreadOnly) {
    conditions.push(eq(schema.notifications.isRead, false));
  }

  const [notifications, unreadResult] = await Promise.all([
    db
      .select()
      .from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, false)
        )
      ),
  ]);

  return {
    notifications: notifications as Notification[],
    unreadCount: Number(unreadResult[0]?.count || 0),
  };
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .update(schema.notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.id, notificationId),
        eq(schema.notifications.userId, userId)
      )
    )
    .returning();

  return result.length > 0;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await db
    .update(schema.notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false)
      )
    )
    .returning();

  return result.length;
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(schema.notifications)
    .where(
      and(
        eq(schema.notifications.id, notificationId),
        eq(schema.notifications.userId, userId)
      )
    )
    .returning();

  return result.length > 0;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false)
      )
    );

  return Number(result?.count || 0);
}

/**
 * Clean up old notifications (run periodically)
 */
export async function cleanupOldNotifications(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(schema.notifications)
    .where(
      and(
        eq(schema.notifications.isRead, true),
        sql`${schema.notifications.createdAt} < ${cutoffDate}`
      )
    )
    .returning();

  return result.length;
}
