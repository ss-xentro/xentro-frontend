'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Mentor {
    id: string;
    name: string;
    occupation: string;
    expertise: string[];
    avatar?: string | null;
    verified: boolean;
    status: string;
    rate?: string | null;
    achievements: string[];
    packages: string[];
}

const EXPERTISE_OPTIONS = [
    'all',
    'Product',
    'Engineering',
    'Marketing',
    'Sales',
    'Finance',
    'Legal',
    'Design',
    'Growth',
    'Operations',
];

/* ── Verified / Approved badge icon ── */
function VerifiedBadge({ verified, status }: { verified: boolean; status: string }) {
    if (verified) {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
                Verified
            </span>
        );
    }
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                Approved
            </span>
        );
    }
    return null;
}

export default function ExploreMentorsPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [expertise, setExpertise] = useState('all');

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                setLoading(true);
                const res = await fetch('/api/mentors', { signal: controller.signal });
                if (!res.ok) return;
                const json = await res.json();
                const raw = json.mentors ?? json.data ?? (Array.isArray(json) ? json : []);

                const mapped: Mentor[] = raw.map((m: Record<string, unknown>) => {
                    let exp: string[] = [];
                    if (typeof m.expertise === 'string') {
                        exp = m.expertise.split(',').map((s: string) => s.trim()).filter(Boolean);
                    } else if (Array.isArray(m.expertise)) {
                        exp = m.expertise as string[];
                    }
                    let ach: string[] = [];
                    if (typeof m.achievements === 'string') {
                        ach = m.achievements.split('\n').map((s: string) => s.trim()).filter(Boolean);
                    } else if (Array.isArray(m.achievements)) {
                        ach = m.achievements as string[];
                    }
                    let pkgs: string[] = [];
                    if (typeof m.packages === 'string') {
                        pkgs = m.packages.split('\n').map((s: string) => s.trim()).filter(Boolean);
                    } else if (Array.isArray(m.packages)) {
                        pkgs = m.packages as string[];
                    }

                    return {
                        id: m.id as string,
                        name: (m.user_name as string) || (m.name as string) || 'Mentor',
                        occupation: (m.occupation as string) || '',
                        expertise: exp,
                        avatar: (m.avatar as string) || null,
                        verified: !!m.verified,
                        status: (m.status as string) || 'approved',
                        rate: m.rate as string || m.pricing_per_hour as string || null,
                        achievements: ach,
                        packages: pkgs,
                    };
                });

                setMentors(mapped);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
        return () => controller.abort();
    }, []);

    const filtered = mentors.filter((m) => {
        return expertise === 'all' || (m.expertise ?? []).some((e) => e.toLowerCase() === expertise.toLowerCase());
    });

    const displayMentors = filtered.length > 0 ? filtered : !loading ? [] : [];

    return (
        <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {EXPERTISE_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setExpertise(opt)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${expertise === opt
                            ? 'bg-white text-gray-900 border-white/80 shadow-sm'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-200'
                            }`}
                    >
                        {opt === 'all' ? 'All' : opt}
                    </button>
                ))}
            </div>

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-2xl bg-white/3 border border-white/6 overflow-hidden">
                            <div className="flex flex-col items-center pt-8 pb-4 px-5">
                                <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse mb-4" />
                                <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-2" />
                                <div className="h-3 w-24 bg-white/5 rounded animate-pulse mb-4" />
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse" />
                                    <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="px-5 pb-5">
                                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid */}
            {!loading && displayMentors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayMentors.map((mentor) => (
                        <Link
                            key={mentor.id}
                            href={`/explore/mentors/${mentor.id}`}
                            className="group relative bg-white/3 hover:bg-white/6 border border-white/6 hover:border-white/12 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
                        >
                            {/* Card body */}
                            <div className="flex flex-col items-center pt-7 pb-2 px-5">
                                {/* Avatar + verified indicator */}
                                <div className="relative mb-4">
                                    <div className="w-19 h-19 rounded-full bg-linear-to-br from-violet-500/20 to-indigo-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                        {mentor.avatar ? (
                                            <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-400">
                                                {mentor.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {mentor.verified && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0B0D10] flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Name + badge */}
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-[15px] font-semibold text-white truncate max-w-45">
                                        {mentor.name}
                                    </h3>
                                    <VerifiedBadge verified={mentor.verified} status={mentor.status} />
                                </div>

                                {/* Occupation */}
                                {mentor.occupation && (
                                    <p className="text-xs text-gray-500 mb-3 text-center line-clamp-1">
                                        {mentor.occupation}
                                    </p>
                                )}

                                {/* Expertise tags */}
                                {mentor.expertise.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                                        {mentor.expertise.slice(0, 4).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/6 text-gray-300 border border-white/8"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {mentor.expertise.length > 4 && (
                                            <span className="text-[11px] text-gray-600 px-1.5 py-0.5">
                                                +{mentor.expertise.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Achievements */}
                                {mentor.achievements.length > 0 && (
                                    <div className="w-full mt-1 mb-2">
                                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                                            <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
                                            </svg>
                                            <p className="text-[11px] text-gray-400 line-clamp-1">
                                                {mentor.achievements[0]}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Rate */}
                                {mentor.rate && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>${Number(mentor.rate).toLocaleString()}/hr</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-auto px-5 pb-5 pt-3">
                                <div className="text-center text-sm font-medium py-2.5 rounded-xl border border-white/10 text-gray-300 group-hover:text-white group-hover:border-white/20 transition-colors">
                                    View Profile
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && displayMentors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4">🧠</div>
                    <h3 className="text-lg font-semibold text-white mb-1">No mentors found</h3>
                    <p className="text-sm text-gray-500">Mentors will appear here once they join the platform.</p>
                </div>
            )}
        </div>
    );
}
