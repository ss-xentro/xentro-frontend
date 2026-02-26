'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';

interface MentorDetail {
	id: string;
	name: string;
	occupation: string;
	expertise: string[];
	avatar?: string | null;
	verified: boolean;
	status: string;
	rate?: number | null;
	pricingPerHour?: number | null;
	achievements: string[];
	packages: string[];
	availability?: Record<string, string[]> | null;
	documents?: Array<{ name?: string; url?: string; type?: string }>;
}

/* ── Helper: format day label ── */
const DAY_LABELS: Record<string, string> = {
	monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
	thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
const FULL_DAY: Record<string, string> = {
	monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
	thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
const ORDERED_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function formatTimeSlot(slot: string) {
	// "10:00-12:00" → "10:00 AM – 12:00 PM"
	const parts = slot.split('-');
	if (parts.length !== 2) return slot;
	return `${formatTime(parts[0])} – ${formatTime(parts[1])}`;
}

function formatTime(t: string) {
	const [hStr, mStr] = t.split(':');
	let h = parseInt(hStr, 10);
	const m = mStr || '00';
	const ampm = h >= 12 ? 'PM' : 'AM';
	if (h > 12) h -= 12;
	if (h === 0) h = 12;
	return `${h}:${m} ${ampm}`;
}

/* ── Badge component ── */
function VerifiedBadge({ verified, status }: { verified: boolean; status: string }) {
	if (verified) {
		return (
			<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
				<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" />
				</svg>
				Verified
			</span>
		);
	}
	if (status === 'approved') {
		return (
			<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
				<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
				</svg>
				Approved
			</span>
		);
	}
	return null;
}

/* ── Stat card ── */
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
	return (
		<div className="bg-white/3 border border-white/6 rounded-xl px-4 py-3">
			<div className="flex items-center gap-2 text-gray-500 mb-1">
				{icon}
				<span className="text-xs">{label}</span>
			</div>
			<p className="text-xl font-bold text-white">{value}</p>
		</div>
	);
}

/* ── Section wrapper ── */
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="bg-white/3 border border-white/6 rounded-xl p-6">
			<div className="flex items-center gap-2 mb-4">
				{icon}
				<h2 className="text-base font-semibold text-white">{title}</h2>
			</div>
			{children}
		</div>
	);
}

interface MentorSlot {
	id: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	isActive: boolean;
}

export default function MentorDetailPage() {
	const params = useParams();
	const router = useRouter();
	const mentorId = params.id as string;

	const [mentor, setMentor] = useState<MentorDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [connectMessage, setConnectMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);

	// Booking flow state
	const [slots, setSlots] = useState<MentorSlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
	const [selectedDate, setSelectedDate] = useState('');
	const [bookingNotes, setBookingNotes] = useState('');
	const [bookingSubmitting, setBookingSubmitting] = useState(false);
	const [bookingError, setBookingError] = useState('');
	const [bookingSuccess, setBookingSuccess] = useState(false);

	useEffect(() => {
		async function load() {
			try {
				setLoading(true);
				const res = await fetch('/api/mentors');
				if (!res.ok) return;
				const json = await res.json();
				const raw = json.mentors ?? json.data ?? [];
				const found = raw.find((m: Record<string, unknown>) => m.id === mentorId);
				if (!found) return;

				// Parse arrays robustly
				const parseArr = (v: unknown): string[] => {
					if (typeof v === 'string') return v.split('\n').map((s: string) => s.trim()).filter(Boolean);
					if (Array.isArray(v)) return v as string[];
					return [];
				};
				const parseExpertise = (v: unknown): string[] => {
					if (typeof v === 'string') return v.split(',').map((s: string) => s.trim()).filter(Boolean);
					if (Array.isArray(v)) return v as string[];
					return [];
				};

				setMentor({
					id: found.id,
					name: found.user_name || found.name || 'Mentor',
					occupation: found.occupation || found.role_title || '',
					expertise: parseExpertise(found.expertise),
					avatar: found.avatar || null,
					verified: !!found.verified,
					status: found.status || 'approved',
					rate: found.rate ? Number(found.rate) : null,
					pricingPerHour: found.pricing_per_hour ? Number(found.pricing_per_hour) : null,
					achievements: parseArr(found.achievements),
					packages: parseArr(found.packages),
					availability: found.availability || null,
					documents: Array.isArray(found.documents) ? found.documents : [],
				});
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [mentorId]);

	// Load connection status + slots when connected
	useEffect(() => {
		async function loadConnection() {
			const token = getSessionToken();
			if (!token) return;
			try {
				const res = await fetch('/api/mentor-connections/', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) return;
				const json = await res.json();
				const match = (json.data ?? []).find(
					(r: { mentor: string }) => r.mentor === mentorId
				);
				if (match) {
					setConnectionStatus(match.status);
					if (match.status === 'accepted') loadSlots();
				}
			} catch { /* ignore */ }
		}
		loadConnection();
	}, [mentorId]);

	const handleConnect = () => {
		const token = getSessionToken();
		if (!token) {
			window.location.href = '/login';
			return;
		}
		setConnectMessage('');
		setShowConnectModal(true);
	};

	const handleSubmitConnection = async () => {
		const token = getSessionToken();
		if (!token || !mentor) return;
		setSubmitting(true);
		try {
			const res = await fetch('/api/mentor-connections/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					mentorId: mentor.id,
					message: connectMessage,
				}),
			});
			if (res.ok || res.status === 409) {
				setConnectionStatus('pending');
				setShowConnectModal(false);
			} else {
				const data = await res.json();
				alert(data.error || 'Failed to send connection request');
			}
		} catch {
			alert('Failed to send connection request');
		} finally {
			setSubmitting(false);
		}
	};

	// ── Load mentor's available slots ──
	const loadSlots = async () => {
		const token = getSessionToken();
		if (!token) return;
		setSlotsLoading(true);
		try {
			const res = await fetch(`/api/mentor-slots/?mentorId=${mentorId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				const json = await res.json();
				setSlots((json.data ?? []).filter((s: MentorSlot) => s.isActive));
			}
		} catch (err) {
			console.error(err);
		} finally {
			setSlotsLoading(false);
		}
	};

	const handleBookSession = async () => {
		const token = getSessionToken();
		if (!token || !selectedSlot || !selectedDate) return;
		setBookingSubmitting(true);
		setBookingError('');
		try {
			const res = await fetch('/api/mentor-bookings/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					slotId: selectedSlot.id,
					scheduledDate: selectedDate,
					notes: bookingNotes,
					mentorUserId: mentorId,
				}),
			});
			if (res.ok) {
				setBookingSuccess(true);
			} else {
				const data = await res.json();
				setBookingError(data.error || 'Failed to book session');
			}
		} catch {
			setBookingError('Failed to book session');
		} finally {
			setBookingSubmitting(false);
		}
	};

	// Compute next date that lands on selected slot's day
	const getNextDateForDay = (dayName: string): string => {
		const dayIndex: Record<string, number> = {
			monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
			friday: 5, saturday: 6, sunday: 0,
		};
		const target = dayIndex[dayName.toLowerCase()];
		if (target === undefined) return '';
		const now = new Date();
		const current = now.getDay();
		let diff = target - current;
		if (diff <= 0) diff += 7;
		const next = new Date(now);
		next.setDate(now.getDate() + diff);
		return next.toISOString().split('T')[0];
	};

	const connectBtnLabel = connectionStatus === 'pending' ? 'Request Pending'
		: connectionStatus === 'accepted' ? 'Book a Session'
			: connectionStatus === 'rejected' ? 'Rejected'
				: 'Connect & Book';

	const connectBtnDisabled = ['pending', 'rejected'].includes(connectionStatus || '');

	const connectBtnClass = connectionStatus === 'pending'
		? 'bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-default'
		: connectionStatus === 'accepted'
			? 'bg-white text-gray-900 hover:bg-gray-100 border-white/20'
			: connectionStatus === 'rejected'
				? 'bg-red-500/20 text-red-300 border-red-500/30 cursor-default'
				: 'bg-white text-gray-900 hover:bg-gray-100';

	// ── Loading skeleton ──
	if (loading) {
		return (
			<div className="p-6 max-w-5xl mx-auto animate-pulse space-y-5">
				<div className="h-5 w-36 bg-white/5 rounded-lg" />
				<div className="h-48 bg-white/3 border border-white/6 rounded-xl" />
				<div className="grid grid-cols-4 gap-3">
					{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/3 border border-white/6 rounded-xl" />)}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
					<div className="lg:col-span-2 space-y-5">
						<div className="h-40 bg-white/3 border border-white/6 rounded-xl" />
						<div className="h-28 bg-white/3 border border-white/6 rounded-xl" />
					</div>
					<div className="h-64 bg-white/3 border border-white/6 rounded-xl" />
				</div>
			</div>
		);
	}

	// ── Not found ──
	if (!mentor) {
		return (
			<div className="p-6 flex flex-col items-center justify-center py-24 text-center">
				<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4">🧠</div>
				<h3 className="text-lg font-semibold text-white mb-1">Mentor not found</h3>
				<p className="text-sm text-gray-500 mb-4">This mentor profile doesn&apos;t exist or has been removed.</p>
				<button onClick={() => router.back()} className="text-sm text-violet-400 hover:text-violet-300">
					&larr; Go back
				</button>
			</div>
		);
	}

	const hourlyRate = mentor.pricingPerHour || mentor.rate;

	return (
		<div className="p-6 max-w-5xl mx-auto">
			{/* ── Back link ── */}
			<Link href="/explore/mentors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Back to Mentors
			</Link>

			{/* ═══════════════════════════════════════════════
			    HERO SECTION
			═══════════════════════════════════════════════ */}
			<div className="bg-white/3 border border-white/6 rounded-xl p-6 sm:p-8 mb-5">
				<div className="flex flex-col sm:flex-row items-start gap-6">
					{/* Avatar */}
					<div className="relative shrink-0">
						<div className="w-24 h-24 rounded-full bg-linear-to-br from-violet-500/20 to-indigo-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden">
							{mentor.avatar ? (
								<img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
							) : (
								<span className="text-3xl font-bold text-gray-400">{mentor.name.charAt(0).toUpperCase()}</span>
							)}
						</div>
						{mentor.verified && (
							<div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 border-[3px] border-[#0B0D10] flex items-center justify-center">
								<svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z" clipRule="evenodd" />
								</svg>
							</div>
						)}
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-3 flex-wrap mb-1">
									<h1 className="text-2xl font-bold text-white">{mentor.name}</h1>
									<VerifiedBadge verified={mentor.verified} status={mentor.status} />
								</div>
								{mentor.occupation && (
									<p className="text-sm text-gray-400 mt-1">{mentor.occupation}</p>
								)}
							</div>

							{/* Action buttons */}
							<div className="flex gap-2 shrink-0">
								{connectionStatus === 'accepted' && (
									<span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
										<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
										</svg>
										Connected
									</span>
								)}
								<button
									onClick={() => {
										if (connectionStatus === 'accepted') {
											document.getElementById('availability-booking')?.scrollIntoView({ behavior: 'smooth' });
										} else if (!connectBtnDisabled) {
											handleConnect();
										}
									}}
									disabled={connectBtnDisabled}
									className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${connectBtnClass}`}
								>
									{connectBtnLabel}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════
			    STATS ROW (placeholder values — real data can be wired later)
			═══════════════════════════════════════════════ */}
			{hourlyRate && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<StatCard
						icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
						label="Hourly Rate"
						value={`$${Number(hourlyRate).toLocaleString()}`}
					/>
					<StatCard
						icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
						label="Status"
						value={mentor.verified ? 'Verified' : mentor.status === 'approved' ? 'Approved' : 'Pending'}
					/>
					<StatCard
						icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
						label="Expertise Areas"
						value={String(mentor.expertise.length)}
					/>
					<StatCard
						icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
						label="Achievements"
						value={String(mentor.achievements.length)}
					/>
				</div>
			)}

			{/* ═══════════════════════════════════════════════
			    TWO-COLUMN LAYOUT
			═══════════════════════════════════════════════ */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* ── LEFT COLUMN (2/3) ── */}
				<div className="lg:col-span-2 space-y-5">

					{/* Areas of Expertise */}
					{mentor.expertise.length > 0 && (
						<Section title="Areas of Expertise">
							<div className="flex flex-wrap gap-2">
								{mentor.expertise.map((tag) => (
									<span
										key={tag}
										className="text-sm px-4 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10"
									>
										{tag}
									</span>
								))}
							</div>
						</Section>
					)}

					{/* Achievements */}
					{mentor.achievements.length > 0 && (
						<Section
							title="Achievements"
							icon={<svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" /></svg>}
						>
							<ul className="space-y-3">
								{mentor.achievements.map((a, i) => (
									<li key={i} className="flex items-start gap-3 text-sm text-gray-400">
										<div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
											<svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" /></svg>
										</div>
										{a}
									</li>
								))}
							</ul>
						</Section>
					)}

					{/* Availability & Booking — interactive when connected */}
					<div id="availability-booking">
						<Section
							title="Availability & Booking"
							icon={<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
						>
							{/* Real slots from API (shown when connected) */}
							{connectionStatus === 'accepted' && (
								<>
									{slotsLoading ? (
										<div className="space-y-3">
											{[1, 2, 3].map((i) => (
												<div key={i} className="h-20 bg-white/3 border border-white/5 rounded-lg animate-pulse" />
											))}
										</div>
									) : slots.length === 0 ? (
										<p className="text-sm text-gray-500 py-6 text-center">
											This mentor hasn&apos;t set up any bookable slots yet.
										</p>
									) : (
										<div className="space-y-3">
											{/* Group slots by dayOfWeek */}
											{ORDERED_DAYS.map((day) => {
												const daySlots = slots.filter((s) => s.dayOfWeek.toLowerCase() === day);
												if (daySlots.length === 0) return null;
												return (
													<div key={day} className="bg-white/3 border border-white/5 rounded-lg p-4">
														<div className="flex items-center justify-between mb-3">
															<div>
																<p className="text-sm font-semibold text-white">{DAY_LABELS[day] || day}</p>
																<p className="text-xs text-gray-600">{FULL_DAY[day] || day}</p>
															</div>
															<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
																<rect x="3" y="4" width="18" height="18" rx="2" />
																<path d="M16 2v4M8 2v4M3 10h18" />
															</svg>
														</div>
														<div className="flex flex-wrap gap-2">
															{daySlots.map((slot) => (
																<button
																	key={slot.id}
																	onClick={() => {
																		setSelectedSlot(slot);
																		setSelectedDate(getNextDateForDay(slot.dayOfWeek));
																		setBookingError('');
																		setBookingSuccess(false);
																		setBookingNotes('');
																	}}
																	className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${selectedSlot?.id === slot.id
																		? 'border-violet-500/50 bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30'
																		: 'border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-violet-300 hover:bg-violet-500/5'
																		}`}
																>
																	{formatTime(slot.startTime)} – {formatTime(slot.endTime)}
																</button>
															))}
														</div>
													</div>
												);
											})}

											{/* Inline booking form — shown when a slot is selected */}
											{selectedSlot && !bookingSuccess && (
												<div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
													<div className="flex items-center gap-2 mb-3">
														<svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														<p className="text-sm font-medium text-violet-300">
															{FULL_DAY[selectedSlot.dayOfWeek.toLowerCase()] || selectedSlot.dayOfWeek} · {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
														</p>
														<button
															onClick={() => setSelectedSlot(null)}
															className="ml-auto text-gray-500 hover:text-white transition-colors"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>

													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
														<div>
															<label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
															<input
																type="date"
																value={selectedDate}
																onChange={(e) => setSelectedDate(e.target.value)}
																min={new Date().toISOString().split('T')[0]}
																className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors scheme-dark"
															/>
														</div>
														<div>
															<label className="block text-xs font-medium text-gray-400 mb-1">Notes (optional)</label>
															<input
																type="text"
																value={bookingNotes}
																onChange={(e) => setBookingNotes(e.target.value)}
																placeholder="Topic to discuss..."
																className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
																maxLength={500}
															/>
														</div>
													</div>

													{bookingError && (
														<div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
															{bookingError}
														</div>
													)}

													<button
														onClick={handleBookSession}
														disabled={bookingSubmitting || !selectedDate}
														className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
													>
														{bookingSubmitting ? (
															<>
																<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
																	<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
																	<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
																</svg>
																Booking...
															</>
														) : (
															<>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
																	<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
																</svg>
																Confirm Booking
															</>
														)}
													</button>
												</div>
											)}

											{/* Booking success */}
											{bookingSuccess && (
												<div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-1 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
													<div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
														<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
														</svg>
													</div>
													<div className="flex-1">
														<p className="text-sm font-semibold text-emerald-400">Session Booked!</p>
														<p className="text-xs text-emerald-400/70 mt-0.5">
															{mentor?.name} will be notified. You&apos;ll see this session in your dashboard.
														</p>
													</div>
													<button
														onClick={() => { setBookingSuccess(false); setSelectedSlot(null); }}
														className="text-xs text-emerald-400 hover:text-emerald-300 shrink-0"
													>
														Book another
													</button>
												</div>
											)}
										</div>
									)}
								</>
							)}

							{/* Static availability display (not connected yet) */}
							{connectionStatus !== 'accepted' && mentor.availability && Object.keys(mentor.availability).length > 0 && (
								<div className="space-y-3">
									{ORDERED_DAYS.map((day) => {
										const avSlots = (mentor.availability as Record<string, string[]>)?.[day];
										if (!avSlots || avSlots.length === 0) return null;
										return (
											<div key={day} className="bg-white/3 border border-white/5 rounded-lg p-4">
												<div className="flex items-center justify-between mb-2">
													<div>
														<p className="text-sm font-semibold text-white">{DAY_LABELS[day] || day}</p>
														<p className="text-xs text-gray-600">{FULL_DAY[day] || day}</p>
													</div>
													<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
														<rect x="3" y="4" width="18" height="18" rx="2" />
														<path d="M16 2v4M8 2v4M3 10h18" />
													</svg>
												</div>
												<div className="flex flex-wrap gap-2">
													{avSlots.map((slot, i) => (
														<span key={i} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400">
															{formatTimeSlot(slot)}
														</span>
													))}
												</div>
											</div>
										);
									})}
									{!connectionStatus && (
										<p className="text-xs text-gray-500 text-center pt-1">
											Connect with this mentor to book a session
										</p>
									)}
								</div>
							)}

							{/* No availability at all */}
							{connectionStatus !== 'accepted' && (!mentor.availability || Object.keys(mentor.availability).length === 0) && (
								<p className="text-sm text-gray-500 py-4 text-center">
									Availability not set yet.
								</p>
							)}
						</Section>
					</div>

					{/* Documents / Certifications */}
					{mentor.documents && mentor.documents.length > 0 && (
						<Section
							title="Certifications & Verification"
							icon={<svg className="w-4 h-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z" clipRule="evenodd" /></svg>}
						>
							<div className="space-y-3">
								{mentor.documents.map((doc, i) => (
									<div key={i} className="flex items-start gap-3 bg-white/3 border border-white/5 rounded-lg p-4">
										<div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
											<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-white">{doc.name || `Document ${i + 1}`}</p>
											{doc.type && <p className="text-xs text-gray-500 mt-0.5">{doc.type}</p>}
											{doc.url && (
												<a
													href={doc.url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors"
												>
													View Document
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
														<path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
													</svg>
												</a>
											)}
										</div>
									</div>
								))}
							</div>

							{/* Identity Verified banner */}
							{mentor.verified && (
								<div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
									<svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" />
									</svg>
									<div>
										<p className="text-sm font-semibold text-emerald-400">Identity Verified</p>
										<p className="text-xs text-emerald-400/70 mt-0.5">
											This mentor&apos;s identity has been verified through document review and credential checks.
										</p>
									</div>
								</div>
							)}
						</Section>
					)}

					{/* If no documents but verified, still show the verified banner */}
					{mentor.verified && (!mentor.documents || mentor.documents.length === 0) && (
						<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-3">
							<svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" />
							</svg>
							<div>
								<p className="text-sm font-semibold text-emerald-400">Identity Verified</p>
								<p className="text-xs text-emerald-400/70 mt-0.5">
									This mentor&apos;s identity has been verified through document review and credential checks.
								</p>
							</div>
						</div>
					)}
				</div>

				{/* ── RIGHT COLUMN (1/3) — Packages / Offerings ── */}
				<div className="space-y-5">

					{/* Free session offering (always show) */}
					<div className="bg-white/3 border border-white/6 rounded-xl p-5">
						<h3 className="text-sm font-semibold text-white mb-1">One-Time Session (30 min)</h3>
						<p className="text-2xl font-bold text-white mb-4">Free</p>
						<ul className="space-y-2 mb-5">
							{['Quick consultation', 'Q&A session', 'General advice'].map((item) => (
								<li key={item} className="flex items-center gap-2 text-sm text-gray-400">
									<svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
									{item}
								</li>
							))}
						</ul>
						<button
							onClick={() => { if (connectionStatus === 'accepted') document.getElementById('availability-booking')?.scrollIntoView({ behavior: 'smooth' }); else if (!connectBtnDisabled) handleConnect(); }}
							disabled={connectBtnDisabled}
							className="w-full py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-default"
						>
							{connectionStatus === 'accepted' ? 'Book Free Session' : 'Schedule Free Call'}
						</button>
					</div>

					{/* Paid session (if rate exists) */}
					{hourlyRate && (
						<div className="bg-white/3 border border-white/6 rounded-xl p-5">
							<h3 className="text-sm font-semibold text-white mb-1">One-Time Session (60 min)</h3>
							<p className="text-2xl font-bold text-white mb-1">${Number(hourlyRate).toLocaleString()}</p>
							<ul className="space-y-2 mb-5 mt-4">
								{['Deep dive session', 'Detailed feedback', 'Action plan'].map((item) => (
									<li key={item} className="flex items-center gap-2 text-sm text-gray-400">
										<svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
										</svg>
										{item}
									</li>
								))}
							</ul>
							<button
								onClick={() => { if (connectionStatus === 'accepted') document.getElementById('availability-booking')?.scrollIntoView({ behavior: 'smooth' }); else if (!connectBtnDisabled) handleConnect(); }}
								disabled={connectBtnDisabled}
								className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-default"
							>
								{connectionStatus === 'accepted' ? 'Book Paid Session' : 'Book Now'}
							</button>
						</div>
					)}

					{/* Custom packages from mentor data */}
					{mentor.packages.length > 0 && (
						<div className="bg-white/3 border border-white/6 rounded-xl p-5">
							<h3 className="text-sm font-semibold text-white mb-3">Mentorship Packages</h3>
							<ul className="space-y-2.5">
								{mentor.packages.map((pkg, i) => (
									<li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
										<div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
											<span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
										</div>
										{pkg}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>

			{/* ═══════════════════════════════════════════════
			    CONNECTION REQUEST MODAL
			═══════════════════════════════════════════════ */}
			{showConnectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => !submitting && setShowConnectModal(false)}
					/>
					<div className="relative bg-[#12141a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
						<button
							onClick={() => !submitting && setShowConnectModal(false)}
							className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
								{mentor.avatar ? (
									<img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
								) : (
									<span className="text-base font-bold text-gray-300">
										{mentor.name.charAt(0).toUpperCase()}
									</span>
								)}
							</div>
							<div>
								<h3 className="text-lg font-semibold text-white">Connect with {mentor.name}</h3>
								{mentor.occupation && (
									<p className="text-xs text-gray-500">{mentor.occupation}</p>
								)}
							</div>
						</div>

						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-300 mb-2">Introduce yourself</label>
							<textarea
								value={connectMessage}
								onChange={(e) => setConnectMessage(e.target.value)}
								placeholder="Share why you'd like to connect, what you're working on, and how they can help..."
								rows={4}
								className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
								maxLength={1000}
							/>
							<p className="text-xs text-gray-600 mt-1.5 text-right">{connectMessage.length}/1000</p>
						</div>

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
