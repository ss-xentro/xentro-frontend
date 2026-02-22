'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('xentro_token');
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
    const token = localStorage.getItem('xentro_token');
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
    const token = localStorage.getItem('xentro_token');
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
      case 'form_submitted': return '📝';
      case 'form_approved': return '✅';
      case 'form_rejected': return '❌';
      case 'form_changes_requested': return '🔄';
      case 'context_unlocked': return '🔓';
      case 'team_invite': return '👋';
      case 'team_invite_accepted': return '🤝';
      case 'appreciation_received': return '❤️';
      case 'mentor_tip_received': return '💡';
      case 'mention': return '💬';
      default: return '🔔';
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
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      <header className="bg-(--surface) border-b border-(--border)">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-(--primary)">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-(--secondary)">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
              <Link href="/feed">
                <Button variant="secondary" size="sm">← Back</Button>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'text-sm px-3 py-1.5 rounded-lg transition-colors',
                filter === 'all'
                  ? 'bg-accent text-white'
                  : 'text-(--secondary) hover:bg-(--background)'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'text-sm px-3 py-1.5 rounded-lg transition-colors',
                filter === 'unread'
                  ? 'bg-accent text-white'
                  : 'text-(--secondary) hover:bg-(--background)'
              )}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-(--border) rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-(--border) rounded w-2/3" />
                    <div className="h-3 bg-(--border) rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchNotifications}>Try Again</Button>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">You&apos;re all caught up</h3>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-(--secondary)">
              {filter === 'unread'
                ? 'You\'re all caught up!'
                : 'When something happens, you\'ll see it here.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'p-4 transition-all cursor-pointer',
                  'hover:shadow-md',
                  !notification.isRead && 'bg-accent/5 border-accent/20'
                )}
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={cn(
                        'text-sm',
                        notification.isRead ? 'text-(--secondary)' : 'text-(--primary) font-medium'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-(--secondary) mt-1">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-(--secondary)/60 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
