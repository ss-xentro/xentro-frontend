'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { PageSkeleton, EmptyState } from '@/components/ui';
import { Startup, EndorsementRequest } from './_lib/constants';
import EndorsementPanel from './_components/EndorsementPanel';
import StartupCard from './_components/StartupCard';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

export default function StartupsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showEndorsements, setShowEndorsements] = useState(false);

    const { data: startupsRaw, isLoading: loading } = useApiQuery<{ data: Startup[] }>(
        queryKeys.institution.startups(),
        '/api/startups',
        { requestOptions: { role: 'institution' } },
    );
    const startups = startupsRaw?.data || [];

    const { data: endorsementsRaw, isLoading: endorsementsLoading } = useApiQuery<{ data?: EndorsementRequest[]; endorsements?: EndorsementRequest[] }>(
        queryKeys.institution.endorsements({ status: 'pending', entity_type: 'startup' }),
        '/api/endorsements/?status=pending&entity_type=startup',
        { requestOptions: { role: 'institution' } },
    );
    const endorsements = endorsementsRaw?.data || endorsementsRaw?.endorsements || [];

    const deleteMutation = useApiMutation<unknown, { _id: string }>({
        method: 'delete',
        path: (v) => `/api/startups/${v._id}`,
        invalidateKeys: [queryKeys.institution.startups()],
        requestOptions: { role: 'institution' },
        mutationOptions: {
            onError: (err) => toast.error(err.message),
        },
    });
    const deletingId = deleteMutation.isPending ? deleteMutation.variables?._id ?? null : null;

    const handleRespondEndorsement = async (id: string, action: 'accepted' | 'rejected', comment: string) => {
        try {
            await api.post(`/api/endorsements/${id}/respond/`, { role: 'institution', json: { action, comment } });
            queryClient.invalidateQueries({ queryKey: queryKeys.institution.endorsements({ status: 'pending', entity_type: 'startup' }) });
            if (action === 'accepted') queryClient.invalidateQueries({ queryKey: queryKeys.institution.startups() });
        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this startup?')) return;
        deleteMutation.mutate({ _id: id });
    };

    if (loading) {
        return <DashboardSidebar><div className="p-8"><PageSkeleton /></div></DashboardSidebar>;
    }

    return (
        <DashboardSidebar>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-(--primary)">Startups</h1>
                        <p className="text-(--secondary) mt-1">Manage your portfolio startups</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEndorsements(!showEndorsements)}
                            className="relative px-4 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary-light) rounded-lg hover:bg-(--accent-light) transition-colors"
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
                            <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
