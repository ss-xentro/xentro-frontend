'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRoleFromSession, getSessionToken } from '@/lib/auth-utils';

interface MissingField {
    label: string;
    key: string;
    icon: string;
}

const PROFILE_FIELDS: { key: string; label: string; icon: string; check: (p: Record<string, unknown>) => boolean }[] = [
    { key: 'expertise', label: 'Expertise', icon: '🎯', check: (p) => !!(p.expertise && String(p.expertise).trim()) },
    { key: 'occupation', label: 'Role', icon: '💼', check: (p) => !!(p.occupation && String(p.occupation).trim()) },
    {
        key: 'pricing_per_hour', label: 'Pricing', icon: '💰',
        check: (p) => {
            const rate = String(p.pricing_per_hour || p.rate || '').trim();
            return !!(rate && rate !== '0' && rate !== '0.00');
        },
    },
    {
        key: 'achievements', label: 'Achievements', icon: '🏆',
        check: (p) => {
            if (Array.isArray(p.achievements)) return p.achievements.length > 0;
            return !!(p.achievements && String(p.achievements).trim());
        },
    },
    { key: 'availability', label: 'Availability', icon: '📅', check: (p) => !!(p.availability && String(p.availability).trim()) },
];

export default function ProfileCompletionBanner() {
    const [missing, setMissing] = useState<MissingField[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const role = getRoleFromSession();
        if (role !== 'mentor') { setLoading(false); return; }

        const token = getSessionToken('mentor') || localStorage.getItem('mentor_token');
        if (!token) { setLoading(false); return; }

        async function checkProfile() {
            try {
                let authToken = token;
                try {
                    const raw = localStorage.getItem('xentro_session');
                    if (raw) {
                        const session = JSON.parse(raw);
                        if (session?.token) authToken = session.token;
                    }
                } catch { /* */ }

                const res = await fetch('/api/auth/mentor-profile/', {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                if (!res.ok) { setLoading(false); return; }
                const profile = await res.json();

                // If backend already flagged profile as completed, hide banner
                if (profile.profile_completed) {
                    setMissing([]);
                    setCompleted(PROFILE_FIELDS.map((f) => f.key));
                    return;
                }

                const miss: MissingField[] = [];
                const done: string[] = [];
                for (const f of PROFILE_FIELDS) {
                    if (f.check(profile)) {
                        done.push(f.key);
                    } else {
                        miss.push({ label: f.label, key: f.key, icon: f.icon });
                    }
                }
                setMissing(miss);
                setCompleted(done);
            } catch { /* */ } finally { setLoading(false); }
        }
        checkProfile();
    }, []);

    if (loading || dismissed || missing.length === 0) return null;

    const total = PROFILE_FIELDS.length;
    const completedCount = completed.length;
    const pct = Math.round((completedCount / total) * 100);

    return (
        <div className="mb-6 rounded-2xl border border-amber-200/60 bg-linear-to-br from-amber-50 via-orange-50/50 to-white overflow-hidden shadow-sm">
            {/* Top accent line */}
            <div className="h-0.5 bg-linear-to-r from-amber-400 via-orange-400 to-amber-400" />

            <div className="p-4 sm:p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                            <span className="text-lg">⚡</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[13px] sm:text-sm font-semibold text-gray-900 leading-tight">
                                Complete your profile
                            </h3>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
                                {pct}% done · {missing.length} section{missing.length !== 1 ? 's' : ''} remaining
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1.5 -m-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                        aria-label="Dismiss"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200/60 rounded-full h-1.5 mb-4">
                    <div
                        className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400 transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                </div>

                {/* Steps — horizontal on desktop */}
                <div className="hidden sm:flex items-center gap-2 flex-wrap mb-4">
                    {PROFILE_FIELDS.map((f) => {
                        const isDone = completed.includes(f.key);
                        return (
                            <div
                                key={f.key}
                                className={`
                                    inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors
                                    ${isDone
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-white border-gray-200 text-gray-500'
                                    }
                                `}
                            >
                                {isDone ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="w-3 h-3 rounded-full border border-gray-300" />
                                )}
                                {f.label}
                            </div>
                        );
                    })}
                </div>

                {/* Mobile: compact tags */}
                <div className="sm:hidden flex flex-wrap gap-1.5 mb-4">
                    {PROFILE_FIELDS.map((f) => {
                        const isDone = completed.includes(f.key);
                        return (
                            <span
                                key={f.key}
                                className={`
                                    inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border
                                    ${isDone
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-white border-gray-200 text-gray-500'
                                    }
                                `}
                            >
                                {isDone ? '✓' : '○'} {f.label}
                            </span>
                        );
                    })}
                </div>

                {/* CTA */}
                <Link
                    href="/mentor-dashboard?tab=profile"
                    className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all duration-200"
                >
                    Complete Profile
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
