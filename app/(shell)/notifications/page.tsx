'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications, WsNotification } from '@/lib/useNotifications';
import { AppIcon } from '@/components/ui/AppIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { useApiQuery, useApiMutation, queryKeys } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  // ── Fetch notifications via TanStack Query ──
  const { data, isLoading: loading, error: queryError } = useApiQuery<NotificationsResponse>(
    queryKeys.notifications.list(filter),
    `/api/notifications`,
    {
      requestOptions: {
        params: {
          limit: 50,
          ...(filter === 'unread' ? { unreadOnly: 'true' } : {}),
        },
      },
    },
  );

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const error = queryError?.message ?? null;

  // ── Real-time WebSocket notifications ──
  const handleWsNotification = useCallback((n: WsNotification) => {
    // Optimistically prepend the new notification to cache
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        const mapped: Notification = {
          id: n.id || crypto.randomUUID(),
          type: n.type,
          title: n.title,
          message: n.body,
          entityType: n.entityType,
          entityId: n.entityId,
          actionUrl: n.actionUrl,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        return {
          notifications: [mapped, ...old.notifications],
          unreadCount: old.unreadCount + 1,
        };
      },
    );
  }, [queryClient]);

  const { connected } = useNotifications({ onNotification: handleWsNotification });

  // ── Mutations ──
  const markAsReadMutation = useApiMutation<unknown, string>({
    method: 'put',
    path: (id) => `/api/notifications/${id}`,
    invalidateKeys: [queryKeys.notifications.all],
  });

  const markAllAsReadMutation = useApiMutation<unknown, void>({
    method: 'post',
    path: '/api/notifications/read-all',
    invalidateKeys: [queryKeys.notifications.all],
  });

  const markAsRead = (id: string) => {
    // Optimistic update
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        return {
          notifications: old.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unreadCount: Math.max(0, old.unreadCount - 1),
        };
      },
    );
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    // Optimistic update
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        return {
          notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      },
    );
    markAllAsReadMutation.mutate(undefined as void);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'form_submitted': return 'pen-square';
      case 'form_approved': return 'check-circle';
      case 'form_rejected': return 'x-circle';
      case 'form_changes_requested': return 'refresh-cw';
      case 'context_unlocked': return 'unlock';
      case 'team_invite': return 'hand';
      case 'team_invite_accepted': return 'handshake';
      case 'appreciation_received': return 'heart';
      case 'mentor_tip_received': return 'lightbulb';
      case 'mention': return 'message-circle';
      default: return 'bell';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background border-b border-(--border) px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-(--primary) tracking-tight">Notifications</h1>
              {connected && (
                <span className="flex items-center gap-1 text-xs text-green-400" title="Real-time updates active">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-(--secondary) mt-0.5">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-(--surface) hover:bg-(--surface-hover) text-(--primary) text-sm font-medium rounded-xl transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'text-sm px-4 py-2 rounded-xl font-medium transition-colors',
              filter === 'all'
                ? 'bg-(--surface) text-(--primary)'
                : 'text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover)',
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'text-sm px-4 py-2 rounded-xl font-medium transition-colors',
              filter === 'unread'
                ? 'bg-(--surface) text-(--primary)'
                : 'text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover)',
            )}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-(--surface) border border-(--border) rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-(--surface-hover) rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-(--surface-hover) rounded w-2/3" />
                    <div className="h-3 bg-(--surface-hover) rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-(--surface) border border-(--border) rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })}
              className="px-4 py-2 bg-(--surface-hover) hover:bg-(--surface) text-(--primary) text-sm rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<AppIcon name="bell" className="w-8 h-8 text-(--secondary)" />}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description={filter === 'unread' ? "You're all caught up!" : 'When something happens, you\'ll see it here.'}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  'w-full text-left bg-(--surface) border border-(--border) rounded-2xl p-4 transition-all duration-200 hover:bg-(--surface-hover)',
                  !notification.isRead && 'bg-blue-500/5 border-blue-500/20',
                )}
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex gap-4">
                  <span className="text-2xl shrink-0">
                    <AppIcon name={getNotificationIcon(notification.type)} className="w-6 h-6" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p
                        className={cn(
                          'text-sm',
                          notification.isRead ? 'text-(--secondary)' : 'text-(--primary) font-medium',
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-(--secondary) mt-1">{notification.message}</p>
                    )}
                    <p className="text-xs text-(--secondary) mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div >
  );
}
