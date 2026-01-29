'use client';

import { useState, useEffect } from 'react';
import { institutionTypeLabels, operatingModeLabels, sdgLabels, sectorLabels } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Card, Button, Badge, VerifiedBadge, SDGBadge } from '@/components/ui';
import { InstitutionTabs } from '@/components/institution/InstitutionTabs';
import { useRouter } from 'next/navigation';

type Institution = any; // Will be typed properly
type Program = any;
type Event = any;
type Startup = any;

export default function InstitutionProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(p => {
            setId(p.id);
            fetch(`/api/institutions/${p.id}`)
                .then(res => res.json())
                .then(data => {
                    console.log('[Institution Page] Received data:', {
                        institution: data.institution?.name,
                        programsCount: data.programs?.length || 0,
                        eventsCount: data.events?.length || 0,
                        startupsCount: data.startups?.length || 0,
                        startups: data.startups,
                    });
                    setInstitution(data.institution);
                    setPrograms(data.programs || []);
                    setEvents(data.events || []);
                    setStartups(data.startups || []);
                })
                .catch(() => router.push('/404'))
                .finally(() => setLoading(false));
        });
    }, [params, router]);

    if (loading || !institution) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>;
    }
    const typeInfo = institutionTypeLabels[institution.type] ?? { label: institution.type, emoji: '🏢', description: '' };
    const modeInfo = institution.operatingMode ? operatingModeLabels[institution.operatingMode as keyof typeof operatingModeLabels] : undefined;

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header Banner */}
            <div className="bg-(--surface) border-b border-(--border)">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white border border-(--border) p-4 shadow-sm flex items-center justify-center shrink-0">
                            {institution.logo ? (
                                <img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-sm text-(--secondary)">No logo</span>
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

                        <div className="flex gap-3 shrink-0">
                            <Button 
                                variant="secondary"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: institution.name,
                                            text: institution.tagline || `Check out ${institution.name} on Xentro`,
                                            url: window.location.href
                                        }).catch(() => {});
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </Button>
                            <a href="/">
                                <Button variant="ghost">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Home
                                </Button>
                            </a>
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
                                    <p className="text-xl font-bold text-(--primary) mb-1 truncate" title={formatCurrency(Number(institution.fundingFacilitated ?? 0), institution.fundingCurrency ?? 'USD')}>
                                        {formatCurrency(Number(institution.fundingFacilitated ?? 0), institution.fundingCurrency ?? 'USD')}
                                    </p>
                                    <p className="text-sm text-(--secondary)">Funding Facilitated</p>
                                </Card>
                            </div>
                        </section>

                        {/* Tabs for Programs, Startups, Projects, Team */}
                        <InstitutionTabs programs={programs} events={events} startups={startups} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="font-semibold text-(--primary) mb-4">Focus Areas</h3>

                            <div className="mb-6">
                                <p className="text-sm text-(--secondary) mb-2 uppercase tracking-wider font-semibold">SDGs</p>
                                <div className="flex flex-wrap gap-2">
                                    {(institution.sdgFocus ?? []).map((sdg) => {
                                        const sdgInfo = sdgLabels[sdg as keyof typeof sdgLabels];
                                        return sdgInfo ? <SDGBadge key={sdg} sdg={sdgInfo.label} color={sdgInfo.color} /> : null;
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-(--secondary) mb-2 uppercase tracking-wider font-semibold">Sectors</p>
                                <div className="flex flex-wrap gap-2">
                                    {(institution.sectorFocus ?? []).map((sector) => {
                                        const sectorInfo = sectorLabels[sector as keyof typeof sectorLabels];
                                        return sectorInfo ? (
                                            <Badge key={sector} variant="secondary" className="bg-(--surface-hover)">
                                                {sectorInfo.label}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="font-semibold text-(--primary) mb-4">Contact</h3>
                            <div className="space-y-4">
                                {institution.email && (
                                    <a href={`mailto:${institution.email}`} className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors">
                                        <span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="text-xs text-(--secondary) uppercase">Email</p>
                                            <p className="text-sm font-medium">{institution.email}</p>
                                        </div>
                                    </a>
                                )}
                                {institution.phone && (
                                    <a href={`tel:${institution.phone}`} className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors">
                                        <span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="text-xs text-(--secondary) uppercase">Phone</p>
                                            <p className="text-sm font-medium">{institution.phone}</p>
                                        </div>
                                    </a>
                                )}
                                {institution.website && (
                                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors">
                                        <span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </span>
                                        Visit Website
                                    </a>
                                )}
                                {institution.linkedin && (
                                    <a href={institution.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors">
                                        <span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </span>
                                        LinkedIn Profile
                                    </a>
                                )}
                            </div>
                        </Card>

                        <div className="bg-[#10B981]/10 rounded-xl p-6">
                            <h3 className="font-bold text-[#065F46] mb-2">Claim this profile?</h3>
                            <p className="text-sm text-[#065F46]/80 mb-4">
                                If you represent this institution, you can claim this profile to manage updates.
                            </p>
                            <Button size="sm" className="w-full bg-[#10B981] hover:bg-[#059669] border-none text-white">
                                Verification Request
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
