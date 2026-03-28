'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Input, Modal } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface EventItem {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	audienceTypes?: string[];
	startupStages?: string[];
	domain?: string | null;
	mode?: 'online' | 'offline' | 'hybrid' | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	pricingType?: string | null;
	organizerType?: string | null;
	benefits?: string[];
	difficultyLevel?: string | null;
	applicationRequirement?: string | null;
	availabilityStatus?: string | null;
	averageRating?: number | null;
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	availableSlots: number | null;
	remainingSlots: number | null;
	attendeeCount: number;
	institutionName: string | null;
	organizerName: string | null;
	currentUserRsvp?: 'going' | 'maybe' | 'not_going' | null;
	approved: boolean;
	createdAt: string;
}

function normalizeEventListResponse(payload: unknown): EventItem[] {
	if (Array.isArray(payload)) return payload as EventItem[];
	if (!payload || typeof payload !== 'object') return [];

	const record = payload as Record<string, unknown>;
	const candidates = [record.events, record.data, record.results];
	for (const candidate of candidates) {
		if (Array.isArray(candidate)) {
			return candidate as EventItem[];
		}
	}

	return [];
}

type FilterState = {
	eventType: string[];
	audienceType: string[];
	startupStage: string[];
	domain: string[];
	mode: string[];
	pricing: string[];
	organizerType: string[];
	benefit: string[];
	difficulty: string[];
	applicationRequirement: string[];
	availability: string[];
	popularity: string[];
	city: string;
	state: string;
	country: string;
	datePreset: string;
	startDate: string;
	endDate: string;
};

const FILTER_OPTIONS = {
	eventType: ['workshop', 'masterclass', 'hackathon', 'pitch_event', 'networking', 'competition', 'webinar', 'bootcamp'],
	audienceType: ['students_explorers', 'early_stage_startups', 'growth_stage_startups', 'mentors', 'investors', 'open_to_all'],
	startupStage: ['idea_stage', 'validation_stage', 'mvp_stage', 'early_traction', 'scaling_stage'],
	domain: ['tech_saas', 'ai_ml', 'fintech', 'healthtech', 'edtech', 'social_impact', 'ecommerce', 'deep_tech', 'open_multi_domain'],
	mode: ['online', 'offline', 'hybrid'],
	pricing: ['free', 'paid', 'freemium', 'sponsored'],
	organizerType: ['institution', 'incubator_accelerator', 'corporate', 'government', 'independent_mentor', 'xentro'],
	benefit: ['learn_a_skill', 'get_mentorship', 'pitch_to_investors', 'networking_opportunities', 'certification', 'funding_opportunity', 'internship_hiring'],
	difficulty: ['beginner', 'intermediate', 'advanced'],
	applicationRequirement: ['open_entry', 'application_required', 'invite_only'],
	availability: ['open', 'limited', 'waitlist'],
	popularity: ['most_registered', 'trending', 'highly_rated'],
} as const;

const EMPTY_FILTERS: FilterState = {
	eventType: [],
	audienceType: [],
	startupStage: [],
	domain: [],
	mode: [],
	pricing: [],
	organizerType: [],
	benefit: [],
	difficulty: [],
	applicationRequirement: [],
	availability: [],
	popularity: [],
	city: '',
	state: '',
	country: '',
	datePreset: '',
	startDate: '',
	endDate: '',
};

const labelize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());

function toggleFilterValue(current: string[], value: string) {
	if (current.includes(value)) {
		return current.filter((item) => item !== value);
	}
	return [...current, value];
}

export default function PublicEventsPage() {
	const [events, setEvents] = useState<EventItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
	const [filtersModalOpen, setFiltersModalOpen] = useState(false);
	const [draftFilters, setDraftFilters] = useState<FilterState>(EMPTY_FILTERS);

	const openFiltersModal = useCallback(() => {
		setDraftFilters(filters);
		setFiltersModalOpen(true);
	}, [filters]);

	const closeFiltersModal = useCallback(() => {
		setFilters(draftFilters);
		setFiltersModalOpen(false);
	}, [draftFilters]);

	const fetchEvents = useCallback(async () => {
		setLoading(true);
		try {
			const token = getSessionToken();
			const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
			const params = new URLSearchParams();
			const appendMany = (key: string, values: string[]) => values.forEach((value) => params.append(key, value));

			appendMany('eventType', filters.eventType);
			appendMany('audienceType', filters.audienceType);
			appendMany('startupStage', filters.startupStage);
			appendMany('domain', filters.domain);
			appendMany('mode', filters.mode);
			appendMany('pricing', filters.pricing);
			appendMany('organizerType', filters.organizerType);
			appendMany('benefit', filters.benefit);
			appendMany('difficulty', filters.difficulty);
			appendMany('applicationRequirement', filters.applicationRequirement);
			appendMany('availability', filters.availability);
			appendMany('popularity', filters.popularity);

			if (filters.city.trim()) params.set('city', filters.city.trim());
			if (filters.state.trim()) params.set('state', filters.state.trim());
			if (filters.country.trim()) params.set('country', filters.country.trim());
			if (filters.datePreset) params.set('datePreset', filters.datePreset);
			if (filters.startDate) params.set('startDate', new Date(filters.startDate).toISOString());
			if (filters.endDate) params.set('endDate', new Date(filters.endDate).toISOString());

			const query = params.toString();
			const res = await fetch(`/api/events/${query ? `?${query}` : ''}`, { headers });
			if (!res.ok) throw new Error('Failed to fetch events');
			const data = await res.json();
			setEvents(normalizeEventListResponse(data));
		} catch {
			setEvents([]);
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		void fetchEvents();
	}, [fetchEvents]);

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return null;
		const d = new Date(dateStr);
		return {
			month: d.toLocaleDateString('en-US', { month: 'short' }),
			day: d.getDate(),
			time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
		};
	};

	const isUpcoming = (startTime: string | null) => {
		if (!startTime) return true;
		return new Date(startTime) > new Date();
	};

	const upcomingEvents = useMemo(() => events.filter((e) => isUpcoming(e.startTime)), [events]);
	const pastEvents = useMemo(() => events.filter((e) => !isUpcoming(e.startTime)), [events]);

	const activeFilterCount = useMemo(() => {
		let count = 0;
		for (const value of Object.values(filters)) {
			if (Array.isArray(value)) {
				count += value.length;
				continue;
			}
			if (typeof value === 'string' && value.trim().length > 0) {
				count += 1;
			}
		}
		return count;
	}, [filters]);

	const renderPillOptions = (
		filterKey: keyof FilterState,
		options: readonly string[],
		allowSingle = false,
	) => {
		const selected = draftFilters[filterKey] as string[];
		return (
			<div className="flex flex-wrap gap-2">
				{options.map((opt) => {
					const active = selected.includes(opt);
					return (
						<button
							key={opt}
							type="button"
							onClick={() => {
								setDraftFilters((prev) => ({
									...prev,
									[filterKey]: allowSingle
										? (active ? [] : [opt])
										: toggleFilterValue(prev[filterKey] as string[], opt),
								}));
							}}
							className={`rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 active:scale-[0.97] ${active
								? 'border-[#ef4444] bg-[#ef4444]/10 text-[#fecaca] shadow-[0_0_0_1px_rgba(239,68,68,0.15)]'
								: 'border-white/15 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/10'
								}`}
						>
							{labelize(opt)}
						</button>
					);
				})}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(239,68,68,0.2),transparent),radial-gradient(1000px_500px_at_80%_0%,rgba(251,191,36,0.16),transparent)]">
			<button
				type="button"
				onClick={openFiltersModal}
				className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white px-4 py-2.5 text-xs font-semibold text-[#0b1220] shadow-[0_14px_36px_rgba(2,6,23,0.45)] transition duration-200 hover:bg-white/90 active:scale-[0.97] sm:right-6 sm:text-sm"
			>
				<svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
				</svg>
				Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
			</button>

			<div className="mx-auto max-w-350 px-3 py-5 sm:px-4 sm:py-7 lg:px-6 lg:py-10 space-y-5 sm:space-y-7">
				<header className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#111827,#0f172a_45%,#3f1d2e)] p-4 sm:p-6 lg:p-9">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-[11px] uppercase tracking-[0.22em] text-[#fca5a5]">Startup Discovery</p>
							<h1 className="mt-1.5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Events That Match Your Startup Journey</h1>
							<p className="mt-2.5 max-w-3xl text-xs text-white/80 sm:text-sm lg:text-base">
								Scan high-signal events by stage, domain, audience, outcomes, and credibility signals. This board is tuned for founders who need relevance fast.
							</p>
						</div>
						<Link href="/events/my-bookings">
							<Button variant="ghost" className="border border-white/20 bg-white/10 text-white transition duration-200 hover:bg-white/20 active:scale-[0.98]">My Bookings</Button>
						</Link>
					</div>
				</header>

				<div>
					<main className="space-y-4 sm:space-y-6 pb-20">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg sm:text-xl font-semibold text-white">Matching Events</h2>
								<p className="text-xs sm:text-sm text-white/70">{events.length} opportunities discovered</p>
							</div>
						</div>

						{loading ? (
							<div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div key={i} className="h-56 sm:h-64 rounded-2xl bg-white/10 animate-pulse" />
								))}
							</div>
						) : events.length === 0 ? (
							<Card className="rounded-2xl border-white/10 bg-[#111827]/90 p-6 sm:p-10 text-center">
								<h3 className="text-lg sm:text-xl font-semibold text-white">No events match this filter stack</h3>
								<p className="mt-2 text-xs sm:text-sm text-white/70">Try widening stage, audience, or date controls to surface more opportunities.</p>
							</Card>
						) : (
							<>
								{upcomingEvents.length > 0 && (
									<section className="space-y-3 sm:space-y-4">
										<h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#fda4af]">Upcoming</h3>
										<div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
											{upcomingEvents.map((event) => {
												const start = formatDate(event.startTime);
												const organizer = event.organizerName || event.institutionName || 'Xentro';
												const isBooked = event.currentUserRsvp === 'going';
												const isOpenCapacity = event.remainingSlots == null;
												const capacityLabel = isOpenCapacity ? 'Open' : `${event.remainingSlots} seats left`;
												return (
													<Link key={event.id} href={`/events/${event.id}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]">
														<Card className="group h-full rounded-2xl border border-white/10 bg-[#0f172a]/95 p-3.5 sm:p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#ef4444]/45 hover:bg-[#111827] hover:shadow-[0_8px_24px_rgba(2,6,23,0.35)] active:scale-[0.99]">
															<div className="flex items-start justify-between gap-3">
																<div className="min-w-0">
																	<p className="text-[11px] font-medium uppercase tracking-wide text-[#fca5a5]">{labelize(event.type || 'event')}</p>
																	<h4 className="mt-1 line-clamp-2 text-sm sm:text-base font-semibold text-white">{event.name}</h4>
																</div>
																{isBooked && <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300">Booked</span>}
															</div>
															<div className="mt-3 flex items-center gap-2 text-xs text-white/70">
																<span>{start ? `${start.month} ${start.day}` : 'TBA'}</span>
																{start && <span>{start.time}</span>}
															</div>
															<p className="mt-2 line-clamp-2 text-xs sm:text-sm text-white/75">{event.description || 'No description available yet.'}</p>
															<div className="mt-3 flex flex-wrap gap-2 text-[11px]">
																<span className="rounded-full border border-white/15 px-2 py-1 text-white/70">{labelize(event.mode || (event.isVirtual ? 'online' : 'offline'))}</span>
																<span className="rounded-full border border-white/15 px-2 py-1 text-white/70">{labelize(event.pricingType || 'free')}</span>
																<span className="rounded-full border border-white/15 px-2 py-1 text-white/70">{labelize(event.difficultyLevel || 'beginner')}</span>
																<span className={`rounded-full px-2 py-1 ${isOpenCapacity ? 'border border-emerald-400/45 bg-emerald-400/15 text-emerald-200' : 'border border-white/15 text-white/70'}`}>
																	{capacityLabel}
																</span>
															</div>
															<div className="mt-3 sm:mt-4 border-t border-white/10 pt-3 text-xs text-white/70">
																<p>{organizer}</p>
																<p className="mt-1">{capacityLabel}</p>
															</div>
														</Card>
													</Link>
												);
											})}
										</div>
									</section>
								)}

								{pastEvents.length > 0 && (
									<section className="space-y-3">
										<h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">Past</h3>
										<div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
											{pastEvents.map((event) => (
												<Link key={event.id} href={`/events/${event.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]">
													<Card className="h-full rounded-xl border border-white/10 bg-white/5 p-3 opacity-80 transition duration-200 hover:opacity-100 active:scale-[0.99]">
														<p className="text-xs uppercase tracking-wide text-white/55">{labelize(event.type || 'event')}</p>
														<h4 className="mt-1 line-clamp-2 text-sm font-semibold text-white">{event.name}</h4>
													</Card>
												</Link>
											))}
										</div>
									</section>
								)}
							</>
						)}
					</main>
				</div>
			</div>

			{filtersModalOpen && (
				<Modal isOpen={filtersModalOpen} onClose={closeFiltersModal} variant="dark" className="max-w-4xl">
					<div className="mb-3 flex items-center justify-between gap-3 -mt-2">
						<div>
							<h2 className="text-sm font-semibold text-white sm:text-base">Filter Stack</h2>
							<p className="text-xs text-white/60">Closing this modal saves your filter choices automatically.</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setDraftFilters(EMPTY_FILTERS)}
								className="border border-white/20 bg-white/5 text-white/85 transition duration-200 hover:bg-white/10 active:scale-[0.98]"
							>
								Clear
							</Button>
							<Button
								type="button"
								onClick={closeFiltersModal}
								className="bg-[#ef4444] text-white transition duration-200 hover:bg-[#dc2626] active:scale-[0.98]"
							>
								Done
							</Button>
						</div>
					</div>

					<div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">1. Event Type</p>
							{renderPillOptions('eventType', FILTER_OPTIONS.eventType)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">2. Audience Type</p>
							{renderPillOptions('audienceType', FILTER_OPTIONS.audienceType)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">3. Startup Stage</p>
							{renderPillOptions('startupStage', FILTER_OPTIONS.startupStage)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">4. Domain / Industry</p>
							{renderPillOptions('domain', FILTER_OPTIONS.domain)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">5. Mode</p>
							{renderPillOptions('mode', FILTER_OPTIONS.mode)}
						</section>

						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">6. Location</p>
							<div className="grid grid-cols-1 gap-2">
								<Input placeholder="City" aria-label="City" value={draftFilters.city} onChange={(e) => setDraftFilters((p) => ({ ...p, city: e.target.value }))} className="bg-white/5 border-white/15 text-white" />
								<Input placeholder="State" aria-label="State" value={draftFilters.state} onChange={(e) => setDraftFilters((p) => ({ ...p, state: e.target.value }))} className="bg-white/5 border-white/15 text-white" />
								<Input placeholder="Country" aria-label="Country" value={draftFilters.country} onChange={(e) => setDraftFilters((p) => ({ ...p, country: e.target.value }))} className="bg-white/5 border-white/15 text-white" />
							</div>
						</section>

						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">7. Cost</p>
							{renderPillOptions('pricing', FILTER_OPTIONS.pricing)}
						</section>

						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">8. Date & Time</p>
							<div className="flex flex-wrap gap-2">
								{['today', 'this_week', 'this_month'].map((preset) => {
									const active = draftFilters.datePreset === preset;
									return (
										<button
											key={preset}
											type="button"
											onClick={() => setDraftFilters((p) => ({ ...p, datePreset: active ? '' : preset, startDate: '', endDate: '' }))}
											className={`rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 active:scale-[0.97] ${active
												? 'border-[#ef4444] bg-[#ef4444]/10 text-[#fecaca]'
												: 'border-white/15 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/10'
												}`}
										>
											{labelize(preset)}
										</button>
									);
								})}
							</div>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								<Input type="date" value={draftFilters.startDate} onChange={(e) => setDraftFilters((p) => ({ ...p, startDate: e.target.value, datePreset: '' }))} className="bg-white/5 border-white/15 text-white" />
								<Input type="date" value={draftFilters.endDate} onChange={(e) => setDraftFilters((p) => ({ ...p, endDate: e.target.value, datePreset: '' }))} className="bg-white/5 border-white/15 text-white" />
							</div>
						</section>

						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">9. Organizer Type</p>
							{renderPillOptions('organizerType', FILTER_OPTIONS.organizerType)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">10. Benefits / Outcomes</p>
							{renderPillOptions('benefit', FILTER_OPTIONS.benefit)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">11. Difficulty</p>
							{renderPillOptions('difficulty', FILTER_OPTIONS.difficulty)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">12. Application Requirement</p>
							{renderPillOptions('applicationRequirement', FILTER_OPTIONS.applicationRequirement)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">13. Availability</p>
							{renderPillOptions('availability', FILTER_OPTIONS.availability)}
						</section>
						<section className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/70">14. Popularity</p>
							{renderPillOptions('popularity', FILTER_OPTIONS.popularity, true)}
						</section>
					</div>
				</Modal>
			)}
		</div >
	);
}
