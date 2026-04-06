'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui';
import { InstitutionTabs } from '@/components/institution/InstitutionTabs';
import { AdminActionBar } from './_components/AdminActionBar';
import { HeaderBanner } from './_components/HeaderBanner';
import { Sidebar } from './_components/Sidebar';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

type Institution = any;
type Program = any;
type Event = any;
type Startup = any;
type TeamMember = any;

export default function AdminInstitutionPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: institutionId } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [updating, setUpdating] = useState(false);

    const { data: instData, isLoading: loading, error: queryError } = useApiQuery<{
        institution: Institution;
        programs?: Program[];
        events?: Event[];
        startups?: Startup[];
        team?: TeamMember[];
    }>(
        queryKeys.admin.institutionDetail(institutionId),
        `/api/institutions/${institutionId}`,
        { requestOptions: { role: 'admin' }, enabled: !!institutionId },
    );
    const institution = instData?.institution ?? null;
    const programs = instData?.programs ?? [];
    const events = instData?.events ?? [];
    const startups = instData?.startups ?? [];
    const team = instData?.team ?? [];
    const error = queryError?.message ?? null;

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to publish this institution?')) return;
        setUpdating(true);
        try {
            await api.put(`/api/institutions/${institutionId}`, { role: 'admin', json: { status: 'published' } });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.institutionDetail(institutionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.institutions() });
            alert('Institution has been published successfully!');
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Please provide a reason for rejection (optional):');
        if (reason === null) return;
        setUpdating(true);
        try {
            await api.put(`/api/institutions/${institutionId}`, { role: 'admin', json: { status: 'archived' } });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.institutionDetail(institutionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.institutions() });
            alert('Institution has been rejected.');
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error || !institution) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold text-(--primary) mb-2">Institution Not Found</h2>
                    <p className="text-(--secondary) mb-4">{error || 'Unable to load institution data.'}</p>
                    <button onClick={() => router.push('/admin/dashboard/institutions')} className="text-sm text-accent hover:underline">
                        Back to Institutions
                    </button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminActionBar status={institution.status} updating={updating} onApprove={handleApprove} onReject={handleReject} />

            <div className="animate-fadeIn pb-20">
                <HeaderBanner institution={institution} />

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-xl font-bold text-(--primary) mb-4">About</h2>
                                <div className="prose prose-lg text-(--secondary) max-w-none">
                                    <p>{institution.description ?? 'No description available yet.'}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-(--primary) mb-4">Impact</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Card className="text-center p-6 bg-(--surface-hover) border-none">
                                        <p className="text-3xl font-bold text-(--primary) mb-1">{formatNumber(institution.startupsSupported ?? 0)}</p>
                                        <p className="text-sm text-(--secondary)">Startups Supported</p>
                                    </Card>
                                    <Card className="text-center p-6 bg-(--surface-hover) border-none">
                                        <p className="text-3xl font-bold text-(--primary) mb-1">{formatNumber(institution.studentsMentored ?? 0)}</p>
                                        <p className="text-sm text-(--secondary)">People Mentored</p>
                                    </Card>
                                    <Card className="text-center p-6 bg-(--surface-hover) border-none">
                                        <p className="text-xl font-bold text-(--primary) mb-1 truncate">
                                            {formatCurrency(Number(institution.fundingFacilitated ?? 0), institution.fundingCurrency ?? 'USD')}
                                        </p>
                                        <p className="text-sm text-(--secondary)">Funding Facilitated</p>
                                    </Card>
                                </div>
                            </section>

                            <InstitutionTabs programs={programs} events={events} startups={startups} team={team} />
                        </div>

                        <Sidebar institution={institution} />
                    </div>
                </div>
            </div>
        </div>
    );
}
