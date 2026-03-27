'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { PageSkeleton, EmptyState } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';
import { Startup, EndorsementRequest } from './_lib/constants';
import EndorsementPanel from './_components/EndorsementPanel';
import StartupCard from './_components/StartupCard';

export default function StartupsPage() {
    const router = useRouter();
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [endorsements, setEndorsements] = useState<EndorsementRequest[]>([]);
    const [endorsementsLoading, setEndorsementsLoading] = useState(true);
    const [showEndorsements, setShowEndorsements] = useState(false);

    useEffect(() => {
        loadStartups();
        loadEndorsements();
    }, []);

    const loadStartups = async () => {
        try {
            const token = getSessionToken('institution');
            if (!token) { router.push('/institution-login'); return; }
            const res = await fetch('/api/startups', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to load startups'));
            const data = await res.json();
            setStartups(data.data || []);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const loadEndorsements = async () => {
        try {
            const token = getSessionToken('institution');
            if (!token) return;
            const res = await fetch('/api/endorsements/?status=pending&entity_type=startup', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setEndorsements(data.data || data.endorsements || []);
            }
        } catch {
            // silently fail
        } finally {
            setEndorsementsLoading(false);
        }
    };

    const handleRespondEndorsement = async (id: string, action: 'accepted' | 'rejected', comment: string) => {
        try {
            const token = getSessionToken('institution');
            if (!token) throw new Error('Authentication required');
            const res = await fetch(`/api/endorsements/${id}/respond/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action, comment }),
            });
            if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to respond'));
            loadEndorsements();
            if (action === 'accepted') loadStartups();
        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this startup?')) return;
        setDeletingId(id);
        try {
            const token = getSessionToken('institution');
            if (!token) throw new Error('Authentication required. Please log in again.');
            const res = await fetch(`/api/startups/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                throw new Error(await readApiErrorMessage(res, 'Failed to delete startup'));
            }
            setStartups((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <DashboardSidebar><div className="p-8"><PageSkeleton /></div></DashboardSidebar>;
    }

    return (
        <DashboardSidebar>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Startups</h1>
                        <p className="text-gray-400 mt-1">Manage your portfolio startups</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEndorsements(!showEndorsements)}
                            className="relative px-4 py-2 bg-white/5 border border-white/10 text-gray-200 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Endorsement Requests
                            {endorsements.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {endorsements.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => router.push('/institution-dashboard/add-startup')}
                            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New
                        </button>
                    </div>
                </div>

                {showEndorsements && (
                    <EndorsementPanel
                        endorsements={endorsements}
                        loading={endorsementsLoading}
                        onRespond={handleRespondEndorsement}
                    />
                )}

                {startups.length === 0 ? (
                    <EmptyState
                        icon={
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        title="No startups yet"
                        description="Start adding startups to your portfolio to showcase your impact"
                        ctaLabel="Add Your First Startup"
                        onCtaClick={() => router.push('/institution-dashboard/add-startup')}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {startups.map((startup) => (
                            <StartupCard
                                key={startup.id}
                                startup={startup}
                                deleting={deletingId === startup.id}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardSidebar>
    );
}
