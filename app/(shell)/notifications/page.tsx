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
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const NOTIFICATION_TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'form_approved', label: 'Approved' },
  { value: 'form_rejected', label: 'Rejected' },
  { value: 'form_changes_requested', label: 'Changes Requested' },
  { value: 'context_unlocked', label: 'Context Unlocked' },
  { value: 'team_invite', label: 'Team Invite' },
  { value: 'team_invite_accepted', label: 'Invite Accepted' },
  { value: 'mentor_tip_received', label: 'Mentor Tip' },
  { value: 'appreciation_received', label: 'Appreciation' },
  { value: 'mention', label: 'Mentions' },
  { value: 'chat_message', label: 'Chat' },
  { value: 'system', label: 'System' },
] as const;

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const queryParams = {
    page,
    pageSize: PAGE_SIZE,
    ...(readFilter === 'unread' ? { unreadOnly: 'true' } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
  };

  // ── Fetch notifications via TanStack Query ──
  const { data, isLoading: loading, error: queryError } = useApiQuery<NotificationsResponse>(
    queryKeys.notifications.list(queryParams),
    `/api/notifications`,
    {
      requestOptions: {
        params: queryParams,
      },
    },
  );

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const currentPage = data?.currentPage ?? 1;
  const error = queryError?.message ?? null;

  // ── Real-time WebSocket notifications ──
  const handleWsNotification = useCallback((n: WsNotification) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
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

  const deleteMutation = useApiMutation<unknown, string>({
    method: 'delete',
    path: (id) => `/api/notifications/${id}`,
    invalidateKeys: [queryKeys.notifications.all],
  });

  const deleteAllMutation = useApiMutation<unknown, void>({
    method: 'delete',
    path: '/api/notifications/delete-all',
    invalidateKeys: [queryKeys.notifications.all],
  });

  const markAsRead = (id: string) => {
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unreadCount: Math.max(0, old.unreadCount - 1),
        };
      },
    );
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      },
    );
    markAllAsReadMutation.mutate(undefined as void);
  };

  const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        const target = old.notifications.find((n) => n.id === id);
        return {
          ...old,
          notifications: old.notifications.filter((n) => n.id !== id),
          unreadCount: target && !target.isRead ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
          totalCount: Math.max(0, old.totalCount - 1),
        };
      },
    );
    deleteMutation.mutate(id);
  };

  const deleteAll = () => {
    queryClient.setQueriesData<NotificationsResponse>(
      { queryKey: queryKeys.notifications.all },
      (old) => {
        if (!old) return old;
        return { ...old, notifications: [], unreadCount: 0, totalCount: 0, totalPages: 1 };
      },
    );
    deleteAllMutation.mutate(undefined as void);
    setPage(1);
  };

  const handleFilterChange = (newReadFilter?: 'all' | 'unread', newTypeFilter?: string) => {
    if (newReadFilter !== undefined) setReadFilter(newReadFilter);
    if (newTypeFilter !== undefined) setTypeFilter(newTypeFilter);
    setPage(1);
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
      case 'chat_message': return 'message-circle';
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
                <span className="flex items-center gap-1 text-xs text-(--success)" title="Real-time updates active">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--success) animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {totalCount > 0 && (
              <p className="text-sm text-(--secondary) mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread · ` : ''}{totalCount} total
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-(--surface) hover:bg-(--surface-hover) text-(--primary) text-sm font-medium rounded-xl transition-colors"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                className="px-4 py-2 bg-(--surface) hover:bg-red-500/10 text-(--secondary) hover:text-red-500 text-sm font-medium rounded-xl transition-colors"
                title="Delete all notifications"
              >
                <AppIcon name="trash" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 mt-4">
          {/* Read/Unread filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={cn(
                'text-sm px-4 py-2 rounded-xl font-medium transition-colors',
                readFilter === 'all'
                  ? 'bg-(--surface) text-(--primary)'
                  : 'text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover)',
              )}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={cn(
                'text-sm px-4 py-2 rounded-xl font-medium transition-colors',
                readFilter === 'unread'
                  ? 'bg-(--surface) text-(--primary)'
                  : 'text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover)',
              )}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Type filter dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => handleFilterChange(undefined, e.target.value)}
            className="text-sm px-3 py-2 rounded-xl bg-(--surface) border border-(--border) text-(--primary) outline-none cursor-pointer"
          >
            {NOTIFICATION_TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
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
            <p className="text-(--error) mb-4">{error}</p>
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
            title={readFilter === 'unread' ? 'No unread notifications' : typeFilter ? 'No notifications of this type' : 'No notifications yet'}
            description={readFilter === 'unread' ? "You're all caught up!" : 'When something happens, you\'ll see it here.'}
          />
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'group relative w-full text-left bg-(--surface) border border-(--border) rounded-2xl p-4 transition-all duration-200 hover:bg-(--surface-hover)',
                    !notification.isRead && 'bg-blue-500/5 border-blue-500/20',
                  )}
                >
                  <button
                    className="w-full text-left"
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
                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteNotification(e, notification.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-(--secondary) hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="Delete notification"
                  >
                    <AppIcon name="x" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pb-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    currentPage <= 1
                      ? 'text-(--secondary)/40 cursor-not-allowed'
                      : 'text-(--primary) bg-(--surface) hover:bg-(--surface-hover)',
                  )}
                >
                  <AppIcon name="chevron-left" className="w-4 h-4" />
                </button>
                <span className="text-sm text-(--secondary) px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    currentPage >= totalPages
                      ? 'text-(--secondary)/40 cursor-not-allowed'
                      : 'text-(--primary) bg-(--surface) hover:bg-(--surface-hover)',
                  )}
                >
                  <AppIcon name="chevron-right" className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
