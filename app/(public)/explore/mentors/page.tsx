'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';

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

interface ConnectionRequest {
    id: string;
    mentor: string;
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

    // Connection state
    const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [connectMessage, setConnectMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                setLoading(true);
                const res = await fetch('/api/mentors', { signal: controller.signal });
                if (!res.ok) return;
                const json = await res.json();
                const raw = json.mentors ?? json.data ?? (Array.isArray(json) ? json : []);

                // Map API fields → UI fields
                const mapped: Mentor[] = raw.map((m: Record<string, unknown>) => ({
                    id: m.id as string,
                    name: (m.user_name as string) || (m.name as string) || 'Mentor',
                    title: (m.occupation as string) || (m.role_title as string) || '',
                    company: (m.company as string) || '',
                    expertise: typeof m.expertise === 'string'
                        ? m.expertise.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : Array.isArray(m.expertise) ? m.expertise : [],
                    avatar: m.avatar as string || null,
                    bio: (m.bio as string) || (m.achievements as string) || '',
                    location: m.location as string || '',
                    status: (m.status as string) || 'approved',
                }));

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

    // Load existing connection requests
    useEffect(() => {
        async function loadConnections() {
            const token = getSessionToken();
            if (!token) return;
            try {
                const res = await fetch('/api/mentor-connections/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const json = await res.json();
                const requests: ConnectionRequest[] = json.data ?? [];
                const statusMap: Record<string, string> = {};
                for (const r of requests) {
                    statusMap[r.mentor] = r.status;
                }
                setConnectionStatuses(statusMap);
            } catch {
                // Not logged in or error — ignore
            }
        }
        loadConnections();
    }, []);

    const filtered = mentors.filter((m) => {
        const matchExpertise =
            expertise === 'all' || (m.expertise ?? []).some((e) => e.toLowerCase() === expertise.toLowerCase());
        return matchExpertise;
    });

    const displayMentors = filtered.length > 0 ? filtered : !loading ? [] : [];

    const handleConnectClick = (mentor: Mentor) => {
        const token = getSessionToken();
        if (!token) {
            // Redirect to login
            window.location.href = '/login';
            return;
        }
        setSelectedMentor(mentor);
        setConnectMessage('');
        setShowConnectModal(true);
    };

    const handleSubmitConnection = async () => {
        if (!selectedMentor) return;
        const token = getSessionToken();
        if (!token) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/mentor-connections/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mentorId: selectedMentor.id,
                    message: connectMessage,
                }),
            });

            if (res.ok || res.status === 409) {
                setConnectionStatuses((prev) => ({
                    ...prev,
                    [selectedMentor.id]: 'pending',
                }));
                setShowConnectModal(false);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to send connection request');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to send connection request');
        } finally {
            setSubmitting(false);
        }
    };

    const getConnectionLabel = (mentorId: string) => {
        const status = connectionStatuses[mentorId];
        if (status === 'pending') return 'Pending';
        if (status === 'accepted') return 'Connected';
        if (status === 'rejected') return 'Rejected';
        return 'Connect';
    };

    const getConnectionStyle = (mentorId: string) => {
        const status = connectionStatuses[mentorId];
        if (status === 'pending') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-default';
        if (status === 'accepted') return 'bg-green-500/20 text-green-300 border border-green-500/30 cursor-default';
        if (status === 'rejected') return 'bg-red-500/20 text-red-300 border border-red-500/30 cursor-default';
        return 'bg-white/10 hover:bg-white/20 text-white';
    };

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
                                <div className="ml-auto flex items-center gap-2">
                                    <Link
                                        href={`/explore/mentors/${mentor.id}`}
                                        className="text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-colors"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => {
                                            const status = connectionStatuses[mentor.id];
                                            if (!status || status === 'rejected') {
                                                handleConnectClick(mentor);
                                            }
                                        }}
                                        disabled={['pending', 'accepted'].includes(connectionStatuses[mentor.id])}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${getConnectionStyle(mentor.id)}`}
                                    >
                                        {getConnectionLabel(mentor.id)}
                                    </button>
                                </div>
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

            {/* Connection Request Modal */}
            {showConnectModal && selectedMentor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !submitting && setShowConnectModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-[#12141a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => !submitting && setShowConnectModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
                                {selectedMentor.avatar ? (
                                    <img src={selectedMentor.avatar} alt={selectedMentor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-base font-bold text-gray-300">
                                        {selectedMentor.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Connect with {selectedMentor.name}</h3>
                                <p className="text-xs text-gray-500">
                                    {selectedMentor.title}{selectedMentor.company ? ` · ${selectedMentor.company}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Message input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Introduce yourself
                            </label>
                            <textarea
                                value={connectMessage}
                                onChange={(e) => setConnectMessage(e.target.value)}
                                placeholder="Share why you'd like to connect, what you're working on, and how they can help..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-600 mt-1.5 text-right">
                                {connectMessage.length}/1000
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => !submitting && setShowConnectModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitConnection}
                                disabled={submitting || !connectMessage.trim()}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
