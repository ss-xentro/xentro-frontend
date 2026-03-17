'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { StartupProfileNavbar } from '@/components/public/StartupProfileNavbar';
import { StatCard, Section } from './_components/MentorProfileHelpers';
import AvailabilityBookingSection from './_components/AvailabilityBookingSection';
import ConnectModal from './_components/ConnectModal';
import MentorPackages from './_components/MentorPackages';
import { HeroSection } from './_components/HeroSection';
import { DocumentsSection } from './_components/DocumentsSection';
import { parseMentorData, getConnectBtnConfig } from './_lib/constants';
import type { MentorDetail, MentorSlot } from './_lib/constants';

export default function MentorDetailPage() {
	const params = useParams();
	const router = useRouter();
	const mentorId = params.id as string;

	const [mentor, setMentor] = useState<MentorDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [slots, setSlots] = useState<MentorSlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<'overview' | 'mentoredStartups'>('overview');
	const [showSlotsModal, setShowSlotsModal] = useState(false);
	const [showRequestModal, setShowRequestModal] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
	const [selectedDate, setSelectedDate] = useState('');
	const [requestMessage, setRequestMessage] = useState('');
	const [bookingSubmitting, setBookingSubmitting] = useState(false);
	const [bookingError, setBookingError] = useState<string | null>(null);
	const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				setLoading(true);
				const res = await fetch(`/api/mentors/${mentorId}`);
				if (!res.ok) return;
				const json = await res.json();
				const found = json.data;
				if (found) setMentor(parseMentorData(found));
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [mentorId]);

	const loadSlots = async () => {
		const token = getSessionToken();
		if (!token) return;
		const mentorUserId = mentor?.userId;
		if (!mentorUserId) return;
		setSlotsLoading(true);
		try {
			const res = await fetch(`/api/mentor-slots/?mentorId=${mentorUserId}`, {
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

	const getNextDateForDay = (dayName: string): string => {
		const dayIndex: Record<string, number> = {
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
			sunday: 0,
		};
		const target = dayIndex[(dayName || '').toLowerCase()];
		if (target === undefined) return '';
		const now = new Date();
		const current = now.getDay();
		let diff = target - current;
		if (diff <= 0) diff += 7;
		const next = new Date(now);
		next.setDate(now.getDate() + diff);
		return next.toISOString().split('T')[0];
	};

	const formatTime = (t: string) => {
		const [h, m] = t.split(':').map(Number);
		const period = h >= 12 ? 'PM' : 'AM';
		const hour = h % 12 || 12;
		return `${hour}:${String(m).padStart(2, '0')} ${period}`;
	};

	const slotsByDay = slots.reduce<Record<string, MentorSlot[]>>((acc, slot) => {
		const key = (slot.dayOfWeek || '').toLowerCase();
		if (!acc[key]) acc[key] = [];
		acc[key].push(slot);
		return acc;
	}, {});

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
				const match = (json.data ?? []).find((r: { mentor?: string | { id?: string } }) => {
					const mentorRef = typeof r.mentor === 'string'
						? r.mentor
						: (r.mentor && typeof r.mentor === 'object' && typeof r.mentor.id === 'string' ? r.mentor.id : null);
					return mentorRef === mentorId;
				});
				if (match) {
					setConnectionStatus(match.status);
					if (match.status === 'accepted') {
						await loadSlots();
					}
				}
			} catch { /* ignore */ }
		}
		loadConnection();
	}, [mentorId, mentor?.userId]);

	const handleConnect = () => {
		const token = getSessionToken();
		if (!token) { window.location.href = '/login'; return; }
		setShowConnectModal(true);
	};

	const handleSubmitConnection = async (message: string) => {
		const token = getSessionToken();
		if (!token || !mentor) return;
		try {
			const res = await fetch('/api/mentor-connections/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ mentorId: mentor.id, message }),
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
		}
	};

	const btnConfig = getConnectBtnConfig(connectionStatus);

	const openSlotBookingModal = async () => {
		const token = getSessionToken();
		if (!token) {
			window.location.href = '/login';
			return;
		}
		setBookingError(null);
		setBookingSuccess(null);
		await loadSlots();
		setShowSlotsModal(true);
	};

	const handlePickSlot = (slot: MentorSlot) => {
		setSelectedSlot(slot);
		setSelectedDate(getNextDateForDay(slot.dayOfWeek));
		setRequestMessage('');
		setBookingError(null);
		setShowSlotsModal(false);
		setShowRequestModal(true);
	};

	const handleSubmitBookingRequest = async () => {
		const token = getSessionToken();
		if (!token || !selectedSlot || !selectedDate) return;

		setBookingSubmitting(true);
		setBookingError(null);
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
					notes: requestMessage,
					mentorUserId: mentorId,
				}),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.error || 'Failed to send booking request');
			}
			setShowRequestModal(false);
			setBookingSuccess('Booking request sent. Mentor can review and accept it from their dashboard.');
		} catch (err) {
			setBookingError(err instanceof Error ? err.message : 'Failed to send booking request');
		} finally {
			setBookingSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0B0D10] text-white">
				<StartupProfileNavbar />
				<div className="p-6 max-w-5xl mx-auto animate-pulse space-y-5">
					<div className="h-5 w-36 bg-white/5 rounded-lg" />
					<div className="h-48 bg-white/3 border border-white/6 rounded-xl" />
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/3 border border-white/6 rounded-xl" />)}</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						<div className="lg:col-span-2 space-y-5"><div className="h-40 bg-white/3 border border-white/6 rounded-xl" /><div className="h-28 bg-white/3 border border-white/6 rounded-xl" /></div>
						<div className="h-64 bg-white/3 border border-white/6 rounded-xl" />
					</div>
				</div>
			</div>
		);
	}

	if (!mentor) {
		return (
			<div className="min-h-screen bg-[#0B0D10] text-white">
				<StartupProfileNavbar />
				<div className="p-6 flex flex-col items-center justify-center py-24 text-center">
					<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><AppIcon name="brain" className="w-8 h-8 text-gray-500" /></div>
					<h3 className="text-lg font-semibold text-white mb-1">Mentor not found</h3>
					<p className="text-sm text-gray-500 mb-4">This mentor profile doesn&apos;t exist or has been removed.</p>
					<button onClick={() => router.back()} className="text-sm text-violet-400 hover:text-violet-300">&larr; Go back</button>
				</div>
			</div>
		);
	}

	const hourlyRate = mentor.pricingPerHour || mentor.rate;

	return (
		<div className="min-h-screen bg-[#0B0D10] text-white">
			<StartupProfileNavbar />
			<div className="p-6 max-w-5xl mx-auto">
				{bookingSuccess && (
					<div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
						{bookingSuccess}
					</div>
				)}
				<Link href="/explore/mentors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
					Back to Mentors
				</Link>

				<HeroSection mentor={mentor} connectionStatus={connectionStatus} btnConfig={btnConfig} onAction={openSlotBookingModal} />

				{hourlyRate && (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
						<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Hourly Rate" value={`INR ${Number(hourlyRate).toLocaleString('en-IN')}`} />
						<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} label="Status" value={mentor.verified ? 'Verified' : mentor.status === 'approved' ? 'Approved' : 'Pending'} />
						<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} label="Expertise Areas" value={String(mentor.expertise.length)} />
						<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} label="Achievements" value={String(mentor.achievements.length)} />
					</div>
				)}

				<div className="mb-5">
					<div className="inline-flex items-center p-1 rounded-xl bg-white/3 border border-white/8">
						<button
							type="button"
							onClick={() => setActiveTab('overview')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview'
								? 'bg-white text-[#0B0D10]'
								: 'text-gray-300 hover:text-white'
								}`}
						>
							Overview
						</button>
						<button
							type="button"
							onClick={() => setActiveTab('mentoredStartups')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mentoredStartups'
								? 'bg-white text-[#0B0D10]'
								: 'text-gray-300 hover:text-white'
								}`}
						>
							Previously Mentored Startups
						</button>
					</div>
				</div>

				{activeTab === 'overview' && (

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						<div className="lg:col-span-2 space-y-5">
							{mentor.expertise.length > 0 && (
								<Section title="Areas of Expertise">
									<div className="flex flex-wrap gap-2">
										{mentor.expertise.map((tag) => (
											<span key={tag} className="text-sm px-4 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10">{tag}</span>
										))}
									</div>
								</Section>
							)}

							{mentor.achievements.length > 0 && (
								<Section title="Achievements" icon={<svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" /></svg>}>
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

							<AvailabilityBookingSection
								mentorId={mentorId}
								mentorName={mentor.name}
								connectionStatus={connectionStatus}
								slots={slots}
								slotsLoading={slotsLoading}
								availability={mentor.availability}
							/>

							<DocumentsSection documents={mentor.documents} verified={mentor.verified} />
						</div>

						<MentorPackages
							hourlyRate={hourlyRate ?? null}
							packages={mentor.packages}
							pricingPlans={mentor.pricingPlans}
							connectionStatus={connectionStatus}
							connectBtnDisabled={btnConfig.disabled}
							onConnectOrBook={openSlotBookingModal}
						/>
					</div>
				)}

				{activeTab === 'mentoredStartups' && (
					<div className="bg-white/3 border border-white/8 rounded-xl p-5">
						<div className="flex items-start justify-between gap-3 mb-4">
							<div>
								<h3 className="text-lg font-semibold text-white">Previously Mentored Startups</h3>
								<p className="text-sm text-gray-400 mt-0.5">Startups this mentor has completed sessions with on Xentro.</p>
							</div>
							<span className="px-2.5 py-1 rounded-full text-xs bg-white/8 text-gray-300 border border-white/10">
								{mentor.mentoredStartups.length}
							</span>
						</div>

						{mentor.mentoredStartups.length === 0 ? (
							<div className="border border-dashed border-white/12 rounded-xl p-8 text-center">
								<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
									<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
									</svg>
								</div>
								<p className="text-sm font-medium text-white">No mentoring experience on platform yet</p>
								<p className="text-xs text-gray-500 mt-1">Completed startup mentorships will appear here.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{mentor.mentoredStartups.map((startup) => (
									<Link
										key={startup.id}
										href={`/startups/${startup.id}`}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-white/6 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
												{startup.logo ? (
													<img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
												) : (
													<span className="text-sm font-bold text-gray-300">{startup.name.charAt(0).toUpperCase()}</span>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold text-white truncate">{startup.name}</p>
												{startup.isExternalInstitution && startup.institutionName && (
													<p className="text-xs text-amber-300 mt-0.5 truncate">
														Associated with {startup.institutionName}
													</p>
												)}
												<p className="text-[11px] text-gray-500 mt-1">View startup profile</p>
											</div>
											<svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
											</svg>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				)}

				{showConnectModal && mentor && (
					<ConnectModal
						mentorName={mentor.name}
						mentorAvatar={mentor.avatar}
						mentorOccupation={mentor.occupation}
						onClose={() => setShowConnectModal(false)}
						onSubmit={handleSubmitConnection}
					/>
				)}

				{showSlotsModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSlotsModal(false)} />
						<div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#12141a] p-5">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-white">Select an Available Slot</h3>
								<button onClick={() => setShowSlotsModal(false)} className="text-gray-500 hover:text-white">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
								</button>
							</div>

							{slotsLoading ? (
								<p className="text-sm text-gray-400">Loading slots...</p>
							) : slots.length === 0 ? (
								<p className="text-sm text-gray-400">This mentor has not published any slots yet.</p>
							) : (
								<div className="space-y-3">
									{Object.entries(slotsByDay).map(([day, daySlots]) => (
										<div key={day} className="rounded-xl border border-white/8 p-3 bg-white/[0.02]">
											<p className="text-sm font-semibold text-white mb-2 capitalize">{day}</p>
											<div className="flex flex-wrap gap-2">
												{daySlots.map((slot) => (
													<button
														key={slot.id}
														onClick={() => handlePickSlot(slot)}
														className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10"
													>
														{formatTime(slot.startTime)} – {formatTime(slot.endTime)}
													</button>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{showRequestModal && selectedSlot && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !bookingSubmitting && setShowRequestModal(false)} />
						<div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12141a] p-5">
							<h3 className="text-lg font-semibold text-white mb-1">Request Booking</h3>
							<p className="text-xs text-gray-500 mb-4">
								{selectedSlot.dayOfWeek} · {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
							</p>

							<div className="space-y-3">
								<div>
									<label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
									<input
										type="date"
										value={selectedDate}
										onChange={(e) => setSelectedDate(e.target.value)}
										min={new Date().toISOString().split('T')[0]}
										className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/50"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-400 mb-1">Message to mentor</label>
									<textarea
										rows={4}
										value={requestMessage}
										onChange={(e) => setRequestMessage(e.target.value)}
										placeholder="Tell the mentor what you want to discuss..."
										className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
									/>
								</div>

								{bookingError && (
									<div className="text-xs text-red-300 border border-red-500/20 bg-red-500/10 rounded-lg px-3 py-2">
										{bookingError}
									</div>
								)}
							</div>

							<div className="mt-4 flex items-center gap-2">
								<button
									onClick={() => !bookingSubmitting && setShowRequestModal(false)}
									className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-gray-300 hover:text-white"
									disabled={bookingSubmitting}
								>
									Cancel
								</button>
								<button
									onClick={handleSubmitBookingRequest}
									className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white disabled:bg-violet-600/50"
									disabled={bookingSubmitting || !selectedDate || !requestMessage.trim()}
								>
									{bookingSubmitting ? 'Sending...' : 'Send Request'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
