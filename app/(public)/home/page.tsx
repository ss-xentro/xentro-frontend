'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import ProfileCompletionBanner from '@/components/ui/ProfileCompletionBanner';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { type DetectedRole, type StatCard, type ActivityItem, detectRole, ROLE_META, defaultCards } from './_lib/constants';
import { fetchAdminData, fetchFounderData, fetchInstitutionData } from './_lib/fetchers';

export default function HomePage() {
  const [role, setRole] = useState<DetectedRole>('guest');
  const [token, setToken] = useState<string | null>(null);
  const [cards, setCards] = useState<StatCard[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { role: r, token: t } = detectRole();
    setRole(r);
    setToken(t);
  }, []);

  const fetchData = useCallback(async () => {
    if (role === 'guest') {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let result: { cards: StatCard[]; activity: ActivityItem[]; name?: string };

      switch (role) {
        case 'admin':
          result = await fetchAdminData(token!);
          break;
        case 'founder':
          result = await fetchFounderData(token!);
          break;
        case 'institution':
          result = await fetchInstitutionData(token!);
          break;
        case 'mentor':
          result = { cards: defaultCards('mentor'), activity: [] };
          break;
        case 'investor':
          result = { cards: defaultCards('investor'), activity: [] };
          break;
        default:
          result = { cards: [], activity: [] };
      }

      setCards(result.cards);
      setActivity(result.activity);
      if (result.name) setUserName(result.name);
    } catch {
      setCards(defaultCards(role));
    } finally {
      setLoading(false);
    }
  }, [role, token]);

  useEffect(() => {
    if (role !== 'guest' || token === null) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [role, token, fetchData]);

  const meta = ROLE_META[role];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {userName ? `${meta.greeting.split(',')[0]}, ${userName}` : meta.greeting}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">{meta.subtitle}</p>
          </div>
          {role !== 'guest' && (
            <Link
              href={meta.dashboardHref}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
            >
              Full Dashboard →
            </Link>
          )}
        </div>

        <ProfileCompletionBanner />

        {/* Stat Cards */}
        {(cards.length > 0 || loading) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
                  <div className="w-8 h-8 bg-white/10 rounded-lg mb-3" />
                  <div className="h-7 bg-white/10 rounded w-12 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-20" />
                </div>
              ))
              : cards.map((card) => {
                const inner = (
                  <div
                    className={cn(
                      'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-200',
                      card.href && 'hover:bg-white/[0.07] hover:border-white/20 cursor-pointer',
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <AppIcon name={card.icon} className="w-6 h-6 text-gray-300" />
                      {card.href && (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                  </div>
                );
                return card.href ? (
                  <Link key={card.label} href={card.href}>{inner}</Link>
                ) : (
                  <div key={card.label}>{inner}</div>
                );
              })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {meta.quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 group"
              >
                <AppIcon name={action.icon} className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {activity.length > 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <AppIcon name={item.icon} className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <AppIcon name="bar-chart" className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {role === 'guest'
                  ? 'Sign in to see your personalized dashboard.'
                  : 'Your recent activity will appear here.'}
              </p>
              <Link
                href={role === 'guest' ? '/join' : '/feed'}
                className="inline-block mt-4 px-4 py-2 bg-white/10 rounded-xl text-sm text-white hover:bg-white/15 transition-colors"
              >
                {role === 'guest' ? 'Get Started' : 'Go to Feed'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
