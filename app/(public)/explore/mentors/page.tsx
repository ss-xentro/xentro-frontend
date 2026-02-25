'use client';

import { useEffect, useState } from 'react';

interface Mentor {
    id: string;
    name: string;
    title: string;
    company: string;
    expertise: string[];
    avatar?: string | null;
    bio?: string;
    location?: string;
    status: string;
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
                setMentors(json.mentors ?? json.data ?? (Array.isArray(json) ? json : []));
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
        if (m.status !== 'approved' && m.status !== 'active' && m.status !== undefined) {
            // Show all if status isn't set (mock/new data)
        }
        const matchExpertise =
            expertise === 'all' || (m.expertise ?? []).some((e) => e.toLowerCase() === expertise.toLowerCase());
        return matchExpertise;
    });

    // Mock data fallback for empty state demonstration
    const displayMentors = filtered.length > 0 ? filtered : !loading ? [] : [];

    return (
        <div className="p-6">
            {/* Filters */}
            <div className="flex gap-3 mb-8">
                <select
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-white/30"
                >
                    {EXPERTISE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#0B0D10]">
                            {opt === 'all' ? 'All Expertise' : opt}
                        </option>
                    ))}
                </select>
            </div>

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Grid */}
            {!loading && displayMentors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayMentors.map((mentor, index) => (
                        <div
                            key={mentor.id}
                            className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 flex flex-col"
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                    {mentor.avatar ? (
                                        <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-base font-bold text-gray-300">{mentor.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-semibold text-white truncate">{mentor.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">
                                        {mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            {mentor.bio && (
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{mentor.bio}</p>
                            )}

                            {/* Expertise tags */}
                            {(mentor.expertise ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {mentor.expertise.slice(0, 4).map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                {mentor.location && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {mentor.location}
                                    </span>
                                )}
                                <button className="ml-auto text-xs font-medium px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    Connect
                                </button>
                            </div>
                        </div>
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
