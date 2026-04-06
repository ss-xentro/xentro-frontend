'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface ActivityLog {
    id: string;
    action: string;
    details: any;
    createdAt: string;
    userName: string | null;
}

/* ── Friendly action mapping ───────────────────────────────────── */

type ActionMeta = {
    label: string;
    description: (who: string, details: any) => string;
    icon: React.ReactNode;
    color: string;          // tailwind ring/bg token
    category: string;
};

const ICONS = {
    rocket: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.84 2.58m0 0a6 6 0 01-7.38-5.84h4.8" />
        </svg>
    ),
    person: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    personMinus: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
    ),
    pencil: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    ),
    eye: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    presentation: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h16.5M3.75 3l2.664 11.943M20.25 3l-2.664 11.943m0 0l-1.23 5.525m-11.712 0l1.23-5.525m0 0h9.348" />
        </svg>
    ),
    heart: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    clipboard: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
    ),
};

function getActionMeta(action: string): ActionMeta {
    const map: Record<string, ActionMeta> = {
        created: {
            label: 'Startup Created',
            description: (who) => `${who} created the startup profile`,
            icon: ICONS.rocket,
            color: 'emerald',
            category: 'Profile',
        },
        updated: {
            label: 'Profile Updated',
            description: (who, d) => {
                const fields = d?.changed_fields;
                if (Array.isArray(fields) && fields.length)
                    return `${who} updated ${fields.join(', ')}`;
                return `${who} updated the startup profile`;
            },
            icon: ICONS.pencil,
            color: 'blue',
            category: 'Profile',
        },
        pitch_updated: {
            label: 'Pitch Deck Updated',
            description: (who) => `${who} updated the pitch deck`,
            icon: ICONS.presentation,
            color: 'violet',
            category: 'Profile',
        },
        team_member_added: {
            label: 'New Team Member',
            description: (who) => `${who} added a new team member`,
            icon: ICONS.person,
            color: 'sky',
            category: 'Team',
        },
        team_member_updated: {
            label: 'Team Member Updated',
            description: (who) => `${who} updated a team member's info`,
            icon: ICONS.pencil,
            color: 'sky',
            category: 'Team',
        },
        team_member_removed: {
            label: 'Team Member Removed',
            description: (who) => `${who} removed a team member`,
            icon: ICONS.personMinus,
            color: 'red',
            category: 'Team',
        },
        profile_viewed: {
            label: 'Profile Viewed',
            description: (_who, d) =>
                d?.viewer ? `${d.viewer} viewed your startup profile` : 'Someone viewed your startup profile',
            icon: ICONS.eye,
            color: 'amber',
            category: 'Engagement',
        },
        investor_interest_registered: {
            label: 'Investor Interest',
            description: (_who, d) =>
                d?.investor ? `${d.investor} showed interest in your startup` : 'An investor showed interest',
            icon: ICONS.heart,
            color: 'pink',
            category: 'Engagement',
        },
        search_appearance: {
            label: 'Search Appearance',
            description: () => 'Your startup appeared in search results',
            icon: ICONS.search,
            color: 'amber',
            category: 'Engagement',
        },
    };

    return map[action] ?? {
        label: action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: (who) => `${who} performed an action`,
        icon: ICONS.clipboard,
        color: 'gray',
        category: 'Other',
    };
}

/* ── Time helpers ──────────────────────────────────────────────── */

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function dateGroup(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
    const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 86_400_000);

    if (d >= startOfToday) return 'Today';
    if (d >= startOfYesterday) return 'Yesterday';
    if (d >= startOfWeek) return 'Earlier this week';
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/* ── Color utility ─────────────────────────────────────────────── */

type ColorTokens = { iconBg: string; iconText: string; badgeBg: string; badgeText: string };

const colorMap: Record<string, ColorTokens> = {
    emerald: { iconBg: 'rgba(16,185,129,0.12)', iconText: '#34d399', badgeBg: 'rgba(16,185,129,0.14)', badgeText: '#6ee7b7' },
    blue: { iconBg: 'rgba(59,130,246,0.12)', iconText: '#60a5fa', badgeBg: 'rgba(59,130,246,0.14)', badgeText: '#93bbfd' },
    violet: { iconBg: 'rgba(139,92,246,0.12)', iconText: '#a78bfa', badgeBg: 'rgba(139,92,246,0.14)', badgeText: '#c4b5fd' },
    sky: { iconBg: 'rgba(14,165,233,0.12)', iconText: '#38bdf8', badgeBg: 'rgba(14,165,233,0.14)', badgeText: '#7dd3fc' },
    red: { iconBg: 'rgba(239,68,68,0.12)', iconText: '#f87171', badgeBg: 'rgba(239,68,68,0.14)', badgeText: '#fca5a5' },
    amber: { iconBg: 'rgba(245,158,11,0.12)', iconText: '#fbbf24', badgeBg: 'rgba(245,158,11,0.14)', badgeText: '#fcd34d' },
    pink: { iconBg: 'rgba(236,72,153,0.12)', iconText: '#f472b6', badgeBg: 'rgba(236,72,153,0.14)', badgeText: '#f9a8d4' },
    gray: { iconBg: 'rgba(255,255,255,0.06)', iconText: '#9CA3AF', badgeBg: 'rgba(255,255,255,0.08)', badgeText: '#9CA3AF' },
};

/* ── Component ─────────────────────────────────────────────────── */

export default function ActivityPage() {
    const { data: rawData, isLoading: loading } = useApiQuery<{ data: ActivityLog[] }>(
        queryKeys.activity.all,
        '/api/founder/activity',
    );

    const logs = rawData?.data ?? [];
    const [filter, setFilter] = useState<string>('all');

    const categories = useMemo(() => {
        const cats = new Set<string>();
        logs.forEach(l => cats.add(getActionMeta(l.action).category));
        return Array.from(cats);
    }, [logs]);

    const filtered = useMemo(() => {
        if (filter === 'all') return logs;
        return logs.filter(l => getActionMeta(l.action).category === filter);
    }, [logs, filter]);

    const grouped = useMemo(() => {
        const groups: { label: string; logs: ActivityLog[] }[] = [];
        let current = '';
        for (const log of filtered) {
            const g = dateGroup(log.createdAt);
            if (g !== current) {
                groups.push({ label: g, logs: [] });
                current = g;
            }
            groups[groups.length - 1].logs.push(log);
        }
        return groups;
    }, [filtered]);

    /* Loading skeleton */
    if (loading) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div>
                    <div className="h-8 w-56 bg-(--surface-hover) rounded-lg animate-pulse" />
                    <div className="h-4 w-80 bg-(--surface-hover) rounded mt-2 animate-pulse" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-20 bg-(--surface-hover) rounded-full animate-pulse" />
                    ))}
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-(--surface-hover) animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-64 bg-(--surface-hover) rounded animate-pulse" />
                            <div className="h-3 w-40 bg-(--surface-hover) rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    /* Empty state */
    if (logs.length === 0) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">Recent Activity</h1>
                    <p className="text-(--secondary) mt-1">See what's been happening with your startup.</p>
                </div>
                <Card className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-(--surface-hover) flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-(--secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-(--primary) mb-1">No activity yet</h3>
                    <p className="text-(--secondary) max-w-sm">
                        Once you start editing your profile, adding team members, or updating your pitch deck, all changes will show up here.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-(--primary)">Recent Activity</h1>
                <p className="text-(--secondary) mt-1">See what's been happening with your startup.</p>
            </div>

            {/* Filter pills */}
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${filter === 'all'
                            ? 'bg-(--accent-light) text-(--primary) border-(--border-hover) font-medium'
                            : 'bg-transparent text-(--secondary) border-(--border) hover:border-(--secondary-light)'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${filter === cat
                                ? 'bg-(--accent-light) text-(--primary) border-(--border-hover) font-medium'
                                : 'bg-transparent text-(--secondary) border-(--border) hover:border-(--secondary-light)'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-8">
                {grouped.map((group) => (
                    <div key={group.label}>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-(--secondary) mb-4">
                            {group.label}
                        </h2>
                        <div className="space-y-1">
                            {group.logs.map((log) => {
                                const meta = getActionMeta(log.action);
                                const c = colorMap[meta.color] ?? colorMap.gray;
                                const who = log.userName || 'System';

                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-(--surface-hover)/50 transition-colors group"
                                    >
                                        {/* Icon */}
                                        <div
                                            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ background: c.iconBg, color: c.iconText }}
                                        >
                                            {meta.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                <p className="text-sm text-(--primary) font-medium leading-snug">
                                                    {meta.description(who, log.details)}
                                                </p>
                                                <span
                                                    className="text-[11px] font-medium px-2 py-0.5 rounded-full w-fit"
                                                    style={{ background: c.badgeBg, color: c.badgeText }}
                                                >
                                                    {meta.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-(--secondary) mt-1">
                                                {relativeTime(log.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtered empty */}
            {filtered.length === 0 && logs.length > 0 && (
                <Card className="py-10 text-center">
                    <p className="text-(--secondary)">No activity matching &quot;{filter}&quot;.</p>
                    <button
                        onClick={() => setFilter('all')}
                        className="mt-2 text-sm text-accent hover:underline"
                    >
                        Show all activity
                    </button>
                </Card>
            )}
        </div>
    );
}
