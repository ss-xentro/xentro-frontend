'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getSessionToken } from '@/lib/auth-utils';
import { useNotifications, WsNotification } from '@/lib/useNotifications';
import { AppIcon } from '@/components/ui/AppIcon';
import { EmptyState } from '@/components/ui/EmptyState';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Real-time WebSocket notifications
  const handleWsNotification = useCallback((n: WsNotification) => {
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
    setNotifications((prev) => [mapped, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const { connected } = useNotifications({ onNotification: handleWsNotification });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    const token = getSessionToken();
    if (!token) {
      setError('Please login to view notifications');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (filter === 'unread') params.set('unreadOnly', 'true');

      const res = await fetch(`/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const token = getSessionToken();
    if (!token) return;

    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const token = getSessionToken();
    if (!token) return;

    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
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
              onClick={fetchNotifications}
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
