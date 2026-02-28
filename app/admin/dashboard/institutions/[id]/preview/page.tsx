'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { institutionTypeLabels, operatingModeLabels, sdgLabels, sectorLabels, SDGFocus, SectorFocus } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Card, Button, Badge, VerifiedBadge, SDGBadge, StatusBadge } from '@/components/ui';
import { InstitutionTabs } from '@/components/institution/InstitutionTabs';
import { useAuth } from '@/contexts/AuthContext';

type Institution = any;
type Program = any;
type Event = any;
type Startup = any;
type TeamMember = any;

export default function AdminInstitutionPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { token } = useAuth();
    const [institutionId, setInstitutionId] = useState<string>('');
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [startups, setStartups] = useState<Startup[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthToken = () => {
        if (token) return token;
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('xentro_session');
            if (!raw) return null;
            const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number };
            if (parsed?.expiresAt && parsed.expiresAt <= Date.now()) return null;
            return parsed?.token || null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        // Verify admin auth
        const authToken = getAuthToken();
        if (!authToken) {
            router.push('/admin/login');
            setLoading(false);
            return;
        }

        params.then(p => {
            setInstitutionId(p.id);
            fetch(`/api/institutions/${p.id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Not found');
                    return res.json();
                })
                .then(data => {
                    setInstitution(data.institution);
                    setPrograms(data.programs || []);
                    setEvents(data.events || []);
                    setStartups(data.startups || []);
                    setTeam(data.team || []);
                })
                .catch(() => setError('Institution not found'))
                .finally(() => setLoading(false));
        });
    }, [params, router, token]);

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to publish this institution?')) return;

        setUpdating(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) throw new Error('Admin session expired. Please log in again.');

            const res = await fetch(`/api/institutions/${institutionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ status: 'published' }),
            });

            if (!res.ok) throw new Error('Failed to publish institution');

            setInstitution({ ...institution, status: 'published' });
            alert('Institution has been published successfully!');
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Please provide a reason for rejection (optional):');
        if (reason === null) return; // User cancelled

        setUpdating(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) throw new Error('Admin session expired. Please log in again.');

            const res = await fetch(`/api/institutions/${institutionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ status: 'archived' }),
            });

            if (!res.ok) throw new Error('Failed to reject institution');

            setInstitution({ ...institution, status: 'archived' });
            alert('Institution has been rejected.');
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--background)">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error || !institution) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--background)">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold text-(--primary) mb-2">Institution Not Found</h2>
                    <p className="text-(--secondary) mb-4">{error || 'Unable to load institution data.'}</p>
                    <Button onClick={() => router.push('/admin/dashboard/institutions')}>
                        Back to Institutions
                    </Button>
                </Card>
            </div>
        );
    }

    const typeInfo = institutionTypeLabels[institution.type] ?? { label: institution.type, emoji: '🏢', description: '' };
    const modeInfo = institution.operatingMode ? operatingModeLabels[institution.operatingMode as keyof typeof operatingModeLabels] : undefined;

    return (
        <div className="min-h-screen bg-(--background)">
            {/* Admin Action Bar */}
            <div className="bg-gray-900 text-white sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin/dashboard/institutions')}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <span className="text-gray-500">|</span>
                        <span className="text-sm text-gray-300">Admin Preview Mode</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={institution.status} />
                        {institution.status !== 'published' && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReject}
                                    disabled={updating}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleApprove}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {updating ? 'Publishing...' : 'Approve & Publish'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Institution Preview - Same as public page */}
            <div className="animate-fadeIn pb-20">
                {/* Header Banner */}
                <div className="bg-(--surface) border-b border-(--border)">
                    <div className="container mx-auto px-4 py-8 md:py-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white border border-(--border) p-4 shadow-sm flex items-center justify-center shrink-0">
                                {institution.logo ? (
                                    <img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl">{typeInfo.emoji}</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-(--primary)">{institution.name}</h1>
                                    {institution.verified && <VerifiedBadge />}
                                    <Badge variant="outline" className="ml-2">{typeInfo.label}</Badge>
                                </div>

                                <p className="text-xl text-(--secondary) mb-6 max-w-2xl">
                                    {institution.tagline ?? 'No tagline provided yet.'}
                                </p>

                                <div className="flex flex-wrap gap-4 md:gap-8">
                                    <div className="flex items-center gap-2 text-(--secondary)">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{institution.city ?? 'Unknown'}, {institution.country ?? ''}</span>
                                    </div>

                                    {modeInfo && (
                                        <div className="flex items-center gap-2 text-(--secondary)">
                                            <span className="text-lg">{modeInfo.emoji}</span>
                                            <span>{modeInfo.label}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-(--secondary)">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        {institution.website ? (
                                            <a href={institution.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
                                                Website
                                            </a>
                                        ) : (
                                            <span className="text-(--secondary)">No website yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About */}
                            <section>
                                <h2 className="text-xl font-bold text-(--primary) mb-4">About</h2>
                                <div className="prose prose-lg text-(--secondary) max-w-none">
                                    <p>{institution.description ?? 'No description available yet.'}</p>
                                </div>
                            </section>

                            {/* Impact Stats */}
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

                            {/* Tabs for Programs, Startups, Projects, Team */}
                            <InstitutionTabs programs={programs} events={events} startups={startups} team={team} />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <h3 className="font-semibold text-(--primary) mb-4">Focus Areas</h3>

                                <div className="mb-6">
                                    <p className="text-sm text-(--secondary) mb-2 uppercase tracking-wider font-semibold">SDGs</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(institution.sdgFocus ?? []).map((sdg: SDGFocus) => {
                                            const sdgInfo = sdgLabels[sdg as keyof typeof sdgLabels];
                                            return sdgInfo ? <SDGBadge key={sdg} sdg={sdgInfo.label} color={sdgInfo.color} /> : null;
                                        })}
                                        {(!institution.sdgFocus || institution.sdgFocus.length === 0) && (
                                            <span className="text-sm text-(--secondary) italic">No SDGs specified</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-(--secondary) mb-2 uppercase tracking-wider font-semibold">Sectors</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(institution.sectorFocus ?? []).map((sector: SectorFocus) => {
                                            const sectorInfo = sectorLabels[sector as keyof typeof sectorLabels];
                                            return sectorInfo ? (
                                                <Badge key={sector} variant="secondary" className="bg-(--surface-hover)">
                                                    {sectorInfo.label}
                                                </Badge>
                                            ) : null;
                                        })}
                                        {(!institution.sectorFocus || institution.sectorFocus.length === 0) && (
                                            <span className="text-sm text-(--secondary) italic">No sectors specified</span>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="font-semibold text-(--primary) mb-4">Contact</h3>
                                <div className="space-y-4">
                                    {institution.email ? (
                                        <div className="flex items-center gap-3 text-(--secondary)">
                                            <span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-xs text-(--secondary) uppercase">Email</p>
                                                <p className="text-sm font-medium">{institution.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-(--secondary) italic">No email provided</p>
                                    )}
                                    {institution.phone && (
                                        <div className="flex items-center gap-3 text-(--secondary)">
                                            <span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-xs text-(--secondary) uppercase">Phone</p>
                                                <p className="text-sm font-medium">{institution.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
