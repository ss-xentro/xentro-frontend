'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import ProfileCompletionBanner from '@/components/ui/ProfileCompletionBanner';
import { cn } from '@/lib/utils';

/* ─── Types ─── */
type DetectedRole = 'admin' | 'founder' | 'mentor' | 'investor' | 'institution' | 'guest';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  href?: string;
}

interface QuickAction {
  label: string;
  href: string;
  icon: string;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  icon: string;
}

/* ─── Token / role detection ─── */
function detectRole(): { role: DetectedRole; token: string | null } {
  if (typeof window === 'undefined') return { role: 'guest', token: null };

  // 1. Check the unified xentro_session first (set by the new login flow)
  try {
    const raw = localStorage.getItem('xentro_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.expiresAt > Date.now()) {
        const accountType = parsed.user?.role || parsed.user?.account_type || parsed.user?.accountType || 'explorer';
        const roleMap: Record<string, DetectedRole> = {
          admin: 'admin',
          mentor: 'mentor',
          institution: 'institution',
          investor: 'investor',
          startup: 'founder',
          founder: 'founder',
          explorer: 'guest',
        };
        const role = roleMap[accountType] || 'guest';
        return { role, token: parsed.token };
      }
    }
  } catch { /* ignore */ }

  // 2. Fallback: check role-specific tokens
  const mentorToken = localStorage.getItem('mentor_token');
  if (mentorToken) return { role: 'mentor', token: mentorToken };

  const founderToken = localStorage.getItem('founder_token');
  if (founderToken) return { role: 'founder', token: founderToken };

  const institutionToken = localStorage.getItem('institution_token');
  if (institutionToken) return { role: 'institution', token: institutionToken };

  const investorToken = localStorage.getItem('investor_token');
  if (investorToken) return { role: 'investor', token: investorToken };

  return { role: 'guest', token: null };
}

/* ─── Role configs ─── */
const ROLE_META: Record<DetectedRole, {
  greeting: string;
  subtitle: string;
  dashboardHref: string;
  loginHref: string;
  quickActions: QuickAction[];
}> = {
  admin: {
    greeting: 'Welcome back, Admin',
    subtitle: 'Platform Overview',
    dashboardHref: '/admin/dashboard',
    loginHref: '/admin/login',
    quickActions: [
      { label: 'Review Approvals', href: '/admin/dashboard/institution-approvals', icon: '📋' },
      { label: 'Manage Institutions', href: '/admin/dashboard', icon: '🏛️' },
      { label: 'Browse Feed', href: '/feed', icon: '📰' },
      { label: 'Explore', href: '/explore/institute', icon: '🔍' },
    ],
  },
  founder: {
    greeting: 'Welcome back, Founder',
    subtitle: 'Startup Dashboard',
    dashboardHref: '/dashboard',
    loginHref: '/login',
    quickActions: [
      { label: 'Edit Startup', href: '/dashboard', icon: '✏️' },
      { label: 'Find Mentors', href: '/explore/mentors', icon: '🧑‍🏫' },
      { label: 'Browse Programs', href: '/explore/institute', icon: '🏛️' },
      { label: 'View Feed', href: '/feed', icon: '📰' },
    ],
  },
  mentor: {
    greeting: 'Welcome back, Mentor',
    subtitle: 'Mentorship Dashboard',
    dashboardHref: '/mentor-dashboard',
    loginHref: '/mentor-login',
    quickActions: [
      { label: 'Manage Slots', href: '/mentor-dashboard', icon: '📅' },
      { label: 'View Sessions', href: '/mentor-dashboard/sessions', icon: '📋' },
      { label: 'Explore Startups', href: '/explore/startups', icon: '🚀' },
      { label: 'View Feed', href: '/feed', icon: '📰' },
    ],
  },
  investor: {
    greeting: 'Welcome back, Investor',
    subtitle: 'Investment Dashboard',
    dashboardHref: '/investor-dashboard',
    loginHref: '/investor-login',
    quickActions: [
      { label: 'Browse Startups', href: '/explore/startups', icon: '🚀' },
      { label: 'Deal Flow', href: '/investor-dashboard', icon: '📈' },
      { label: 'Explore Institutions', href: '/explore/institute', icon: '🏛️' },
      { label: 'View Feed', href: '/feed', icon: '📰' },
    ],
  },
  institution: {
    greeting: 'Welcome back',
    subtitle: 'Institution Dashboard',
    dashboardHref: '/institution-dashboard',
    loginHref: '/institution-login',
    quickActions: [
      { label: 'Manage Programs', href: '/institution-dashboard', icon: '📋' },
      { label: 'View Team', href: '/institution-dashboard/team', icon: '👥' },
      { label: 'Edit Profile', href: '/institution-edit', icon: '✏️' },
      { label: 'View Feed', href: '/feed', icon: '📰' },
    ],
  },
  guest: {
    greeting: 'Welcome to Xentro',
    subtitle: 'Get started by joining the ecosystem',
    dashboardHref: '/feed',
    loginHref: '/join',
    quickActions: [
      { label: 'Sign Up', href: '/join', icon: '🚀' },
      { label: 'Explore Institutions', href: '/explore/institute', icon: '🏛️' },
      { label: 'Browse Startups', href: '/explore/startups', icon: '💡' },
      { label: 'View Feed', href: '/feed', icon: '📰' },
    ],
  },
};

/* ── Fetchers per role ── */
async function fetchAdminData(token: string): Promise<{ cards: StatCard[]; activity: ActivityItem[] }> {
  try {
    const res = await fetch('/api/institutions');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const institutions = data.institutions ?? data ?? [];
    const count = institutions.length;
    const startups = institutions.reduce((s: number, i: { startupsSupported?: number }) => s + (i.startupsSupported || 0), 0);
    const students = institutions.reduce((s: number, i: { studentsMentored?: number }) => s + (i.studentsMentored || 0), 0);
    const funding = institutions.reduce((s: number, i: { fundingFacilitated?: number }) => s + (i.fundingFacilitated || 0), 0);
    return {
      cards: [
        { label: 'Total Institutions', value: count, icon: '🏛️', href: '/admin/dashboard' },
        { label: 'Startups Supported', value: startups, icon: '🚀' },
        { label: 'Students Mentored', value: students, icon: '🎓' },
        { label: 'Funding Facilitated', value: funding > 0 ? `$${(funding / 1e6).toFixed(1)}M` : '$0', icon: '💰' },
      ],
      activity: [],
    };
  } catch {
    return { cards: defaultCards('admin'), activity: [] };
  }
}

async function fetchFounderData(token: string): Promise<{ cards: StatCard[]; activity: ActivityItem[]; name?: string }> {
  try {
    const res = await fetch('/api/founder/my-startup', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const startup = data.startup;
    const activity = (data.recentActivity ?? []).slice(0, 5).map((a: { id?: string; action?: string; createdAt?: string }, i: number) => ({
      id: a.id ?? String(i),
      text: a.action ?? 'Activity',
      time: a.createdAt ? timeAgo(a.createdAt) : '',
      icon: '📝',
    }));
    return {
      cards: [
        { label: 'Status', value: startup?.status ?? '—', icon: '🚀', href: '/dashboard' },
        { label: 'Stage', value: startup?.stage ?? '—', icon: '📈' },
        { label: 'Team Size', value: startup?.teamMembers?.length ?? 0, icon: '👥' },
        { label: 'Funds Raised', value: startup?.fundsRaised ? `$${Number(startup.fundsRaised).toLocaleString()}` : '$0', icon: '💰' },
      ],
      activity,
      name: startup?.name,
    };
  } catch {
    return { cards: defaultCards('founder'), activity: [] };
  }
}

async function fetchInstitutionData(token: string): Promise<{ cards: StatCard[]; activity: ActivityItem[]; name?: string }> {
  try {
    const [profileRes, startupsRes, teamRes, programsRes] = await Promise.all([
      fetch('/api/auth/me/', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/startups', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      fetch('/api/institution-team', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      fetch('/api/programs', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
    ]);

    const profile = profileRes.ok ? await profileRes.json() : null;
    const startups = startupsRes?.ok ? await startupsRes.json() : null;
    const team = teamRes?.ok ? await teamRes.json() : null;
    const programs = programsRes?.ok ? await programsRes.json() : null;

    const startupsCount = Array.isArray(startups) ? startups.length : (startups?.startups?.length ?? 0);
    const teamCount = Array.isArray(team) ? team.length : (team?.members?.length ?? 0);
    const programsCount = Array.isArray(programs) ? programs.length : (programs?.programs?.length ?? 0);

    return {
      cards: [
        { label: 'Active Programs', value: programsCount, icon: '📋', href: '/institution-dashboard' },
        { label: 'Team Members', value: teamCount, icon: '👥', href: '/institution-dashboard/team' },
        { label: 'Portfolio Startups', value: startupsCount, icon: '🚀', href: '/institution-dashboard/startups' },
        { label: 'Profile Views', value: profile?.profileViews ?? 0, icon: '👁️' },
      ],
      activity: [],
      name: profile?.name ?? profile?.institution?.name,
    };
  } catch {
    return { cards: defaultCards('institution'), activity: [] };
  }
}

function defaultCards(role: DetectedRole): StatCard[] {
  const configs: Record<string, StatCard[]> = {
    admin: [
      { label: 'Institutions', value: 0, icon: '🏛️' },
      { label: 'Startups', value: 0, icon: '🚀' },
      { label: 'Mentors', value: 0, icon: '🧑‍🏫' },
      { label: 'Investors', value: 0, icon: '💼' },
    ],
    founder: [
      { label: 'Status', value: '—', icon: '🚀', href: '/dashboard' },
      { label: 'Stage', value: '—', icon: '📈' },
      { label: 'Team', value: 0, icon: '👥' },
      { label: 'Funds Raised', value: '$0', icon: '💰' },
    ],
    mentor: [
      { label: 'Active Mentees', value: 0, icon: '🧑‍🎓' },
      { label: 'Sessions This Month', value: 0, icon: '📅' },
      { label: 'Rating', value: '—', icon: '⭐' },
      { label: 'Earnings', value: '$0', icon: '💰' },
    ],
    investor: [
      { label: 'Active Deals', value: 0, icon: '📈' },
      { label: 'Portfolio Companies', value: 0, icon: '💼' },
      { label: 'Total Invested', value: '$0', icon: '💰' },
      { label: 'Pipeline', value: 0, icon: '📊' },
    ],
    institution: [
      { label: 'Programs', value: 0, icon: '📋', href: '/institution-dashboard' },
      { label: 'Team', value: 0, icon: '👥' },
      { label: 'Startups', value: 0, icon: '🚀' },
      { label: 'Views', value: 0, icon: '👁️' },
    ],
    guest: [],
  };
  return configs[role] ?? [];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ─── Component ─── */
export default function HomePage() {
  const [role, setRole] = useState<DetectedRole>('guest');
  const [token, setToken] = useState<string | null>(null);
  const [cards, setCards] = useState<StatCard[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Detect role from tokens
  useEffect(() => {
    const { role: r, token: t } = detectRole();
    setRole(r);
    setToken(t);
  }, []);

  // Fetch data once role is detected
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
          // Mentor APIs are not yet implemented — show defaults
          result = { cards: defaultCards('mentor'), activity: [] };
          break;
        case 'investor':
          // Investor APIs are not yet implemented — show defaults
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
        {/* ── Header ── */}
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

        {/* Profile Completion Banner (for mentors) */}
        <ProfileCompletionBanner />

        {/* ── Stat Cards ── */}
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
                      <span className="text-2xl">{card.icon}</span>
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

        {/* ── Quick Actions ── */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {meta.quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 group"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {activity.length > 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">📊</div>
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
