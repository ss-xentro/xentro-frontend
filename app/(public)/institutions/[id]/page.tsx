import { institutionTypeLabels, operatingModeLabels, sdgLabels, sectorLabels } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Card, Button, Badge, VerifiedBadge, SDGBadge } from '@/components/ui';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { institutionController } from '@/server/controllers/institution.controller';
import { HttpError } from '@/server/controllers/http-error';

export const dynamic = 'force-dynamic';

export default async function InstitutionProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let payload: Awaited<ReturnType<typeof institutionController.getById>>;
    try {
        payload = await institutionController.getById(id);
    } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
            notFound();
        }
        throw error;
    }

    const { institution, programs, events } = payload;
    const typeInfo = institutionTypeLabels[institution.type] ?? { label: institution.type, emoji: '🏢', description: '' };
    const modeInfo = institution.operatingMode ? operatingModeLabels[institution.operatingMode] : undefined;

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header Banner */}
            <div className="bg-[var(--surface)] border-b border-[var(--border)]">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[var(--radius-xl)] bg-white border border-[var(--border)] p-4 shadow-sm flex items-center justify-center shrink-0">
                            {institution.logo ? (
                                <img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-sm text-[var(--secondary)]">No logo</span>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-[var(--primary)]">{institution.name}</h1>
                                {institution.verified && <VerifiedBadge />}
                                <Badge variant="outline" className="ml-2">{typeInfo.label}</Badge>
                            </div>

                            <p className="text-xl text-[var(--secondary)] mb-6 max-w-2xl">
                                {institution.tagline ?? 'No tagline provided yet.'}
                            </p>

                            <div className="flex flex-wrap gap-4 md:gap-8">
                                <div className="flex items-center gap-2 text-[var(--secondary)]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{institution.city ?? 'Unknown'}, {institution.country ?? ''}</span>
                                </div>

                                {modeInfo && (
                                    <div className="flex items-center gap-2 text-[var(--secondary)]">
                                        <span className="text-lg">{modeInfo.emoji}</span>
                                        <span>{modeInfo.label}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-[var(--secondary)]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    {institution.website ? (
                                        <a href={institution.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] hover:underline">
                                            Website
                                        </a>
                                    ) : (
                                        <span className="text-[var(--secondary)]">No website yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 shrink-0">
                            <Button>Connect</Button>
                            <Button variant="secondary">Share</Button>
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
                            <h2 className="text-xl font-bold text-[var(--primary)] mb-4">About</h2>
                            <div className="prose prose-lg text-[var(--secondary)] max-w-none">
                                <p>{institution.description ?? 'No description available yet.'}</p>
                            </div>
                        </section>

                        {/* Impact Stats */}
                        <section>
                            <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Impact</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="text-center p-6 bg-[var(--surface-hover)] border-none">
                                    <p className="text-3xl font-bold text-[var(--primary)] mb-1">{formatNumber(institution.startupsSupported ?? 0)}</p>
                                    <p className="text-sm text-[var(--secondary)]">Startups Supported</p>
                                </Card>
                                <Card className="text-center p-6 bg-[var(--surface-hover)] border-none">
                                    <p className="text-3xl font-bold text-[var(--primary)] mb-1">{formatNumber(institution.studentsMentored ?? 0)}</p>
                                    <p className="text-sm text-[var(--secondary)]">People Mentored</p>
                                </Card>
                                <Card className="text-center p-6 bg-[var(--surface-hover)] border-none">
                                    <p className="text-xl font-bold text-[var(--primary)] mb-1 truncate" title={formatCurrency(institution.fundingFacilitated ?? 0, institution.fundingCurrency ?? 'USD')}>
                                        {formatCurrency(institution.fundingFacilitated ?? 0, institution.fundingCurrency ?? 'USD')}
                                    </p>
                                    <p className="text-sm text-[var(--secondary)]">Funding Facilitated</p>
                                </Card>
                            </div>
                        </section>

                        {/* Programs */}
                        <section>
                            <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Active Programs</h2>
                            {programs.length > 0 ? (
                                <div className="space-y-4">
                                    {programs.map((program) => (
                                        <Card key={program.id} className="flex gap-4 p-6" hoverable>
                                            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--primary)] text-lg">{program.name}</h3>
                                                <p className="text-[var(--secondary)] mt-1 mb-3">{program.description ?? 'No description provided.'}</p>
                                                <div className="flex gap-3">
                                                    <Badge variant="outline">{program.type}</Badge>
                                                    {program.duration && <Badge variant="info">{program.duration}</Badge>}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[var(--secondary)] italic">No active programs listed.</p>
                            )}
                        </section>

                        {/* Events */}
                        <section>
                            <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Upcoming Events</h2>
                            {events.length > 0 ? (
                                <div className="space-y-4">
                                    {events.map((event) => (
                                        <Card key={event.id} className="flex gap-4 p-6" hoverable>
                                            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--warning-light)] flex items-center justify-center text-[#B45309] shrink-0 font-bold text-center leading-none">
                                                <div>
                                                    <span className="block text-xs uppercase">{event.startTime ? new Date(event.startTime).toLocaleString('default', { month: 'short' }) : '--'}</span>
                                                    <span className="block text-xl">{event.startTime ? new Date(event.startTime).getDate() : '--'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--primary)] text-lg">{event.name}</h3>
                                                <p className="text-[var(--secondary)] mt-1 mb-2">{event.description ?? 'No description provided.'}</p>
                                                <p className="text-sm text-[var(--secondary)] flex items-center gap-1">
                                                    📍 {event.location ?? 'TBC'}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[var(--secondary)] italic">No upcoming events listed.</p>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="font-semibold text-[var(--primary)] mb-4">Focus Areas</h3>

                            <div className="mb-6">
                                <p className="text-sm text-[var(--secondary)] mb-2 uppercase tracking-wider font-semibold">SDGs</p>
                                <div className="flex flex-wrap gap-2">
                                    {(institution.sdgFocus ?? []).map((sdg) => (
                                        <SDGBadge key={sdg} sdg={sdgLabels[sdg].label} color={sdgLabels[sdg].color} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-[var(--secondary)] mb-2 uppercase tracking-wider font-semibold">Sectors</p>
                                <div className="flex flex-wrap gap-2">
                                    {(institution.sectorFocus ?? []).map((sector) => (
                                        <Badge key={sector} variant="secondary" className="bg-[var(--surface-hover)]">
                                            {sectorLabels[sector].emoji} {sectorLabels[sector].label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="font-semibold text-[var(--primary)] mb-4">Contact</h3>
                            <div className="space-y-4">
                                {institution.website && (
                                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--secondary)] hover:text-[var(--accent)] transition-colors">
                                        <span className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </span>
                                        Visit Website
                                    </a>
                                )}
                                {institution.linkedin && (
                                    <a href={institution.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--secondary)] hover:text-[var(--accent)] transition-colors">
                                        <span className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </span>
                                        LinkedIn Profile
                                    </a>
                                )}
                            </div>
                        </Card>

                        <div className="bg-[#10B981]/10 rounded-[var(--radius-xl)] p-6">
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
