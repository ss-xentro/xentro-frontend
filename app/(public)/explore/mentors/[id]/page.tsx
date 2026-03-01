'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';
import { VerifiedBadge, InstitutionalBadge, StatCard, Section } from './_components/MentorProfileHelpers';
import AvailabilityBookingSection from './_components/AvailabilityBookingSection';
import ConnectModal from './_components/ConnectModal';
import MentorPackages from './_components/MentorPackages';

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
	institutionId?: string | null;
	institutionName?: string | null;
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

	const [slots, setSlots] = useState<MentorSlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);

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
					institutionId: found.institutionId || null,
					institutionName: found.institutionName || null,
				});
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
				const match = (json.data ?? []).find((r: { mentor: string }) => r.mentor === mentorId);
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

	const connectBtnLabel = connectionStatus === 'pending' ? 'Request Pending'
		: connectionStatus === 'accepted' ? 'Book a Session'
			: connectionStatus === 'rejected' ? 'Rejected' : 'Connect & Book';

	const connectBtnDisabled = ['pending', 'rejected'].includes(connectionStatus || '');

	const connectBtnClass = connectionStatus === 'pending'
		? 'bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-default'
		: connectionStatus === 'accepted'
			? 'bg-white text-gray-900 hover:bg-gray-100 border-white/20'
			: connectionStatus === 'rejected'
				? 'bg-red-500/20 text-red-300 border-red-500/30 cursor-default'
				: 'bg-white text-gray-900 hover:bg-gray-100';

	const scrollToBooking = () => {
		if (connectionStatus === 'accepted') {
			document.getElementById('availability-booking')?.scrollIntoView({ behavior: 'smooth' });
		} else if (!connectBtnDisabled) {
			handleConnect();
		}
	};

	// ── Loading skeleton ──
	if (loading) {
		return (
			<div className="p-6 max-w-5xl mx-auto animate-pulse space-y-5">
				<div className="h-5 w-36 bg-white/5 rounded-lg" />
				<div className="h-48 bg-white/3 border border-white/6 rounded-xl" />
				<div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/3 border border-white/6 rounded-xl" />)}</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
					<div className="lg:col-span-2 space-y-5"><div className="h-40 bg-white/3 border border-white/6 rounded-xl" /><div className="h-28 bg-white/3 border border-white/6 rounded-xl" /></div>
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
				<button onClick={() => router.back()} className="text-sm text-violet-400 hover:text-violet-300">&larr; Go back</button>
			</div>
		);
	}

	const hourlyRate = mentor.pricingPerHour || mentor.rate;

	return (
		<div className="p-6 max-w-5xl mx-auto">
			{/* Back link */}
			<Link href="/explore/mentors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
				Back to Mentors
			</Link>

			{/* HERO SECTION */}
			<div className="bg-white/3 border border-white/6 rounded-xl p-6 sm:p-8 mb-5">
				<div className="flex flex-col sm:flex-row items-start gap-6">
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
								<svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z" clipRule="evenodd" /></svg>
							</div>
						)}
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-3 flex-wrap mb-1">
									<h1 className="text-2xl font-bold text-white">{mentor.name}</h1>
									{mentor.institutionName ? <InstitutionalBadge name={mentor.institutionName} /> : <VerifiedBadge verified={mentor.verified} status={mentor.status} />}
								</div>
								{mentor.occupation && <p className="text-sm text-gray-400 mt-1">{mentor.occupation}</p>}
							</div>
							<div className="flex gap-2 shrink-0">
								{connectionStatus === 'accepted' && (
									<span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
										<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
										Connected
									</span>
								)}
								<button onClick={scrollToBooking} disabled={connectBtnDisabled} className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${connectBtnClass}`}>{connectBtnLabel}</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* STATS ROW */}
			{hourlyRate && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Hourly Rate" value={`$${Number(hourlyRate).toLocaleString()}`} />
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} label="Status" value={mentor.verified ? 'Verified' : mentor.status === 'approved' ? 'Approved' : 'Pending'} />
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} label="Expertise Areas" value={String(mentor.expertise.length)} />
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} label="Achievements" value={String(mentor.achievements.length)} />
				</div>
			)}

			{/* TWO-COLUMN LAYOUT */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* LEFT COLUMN (2/3) */}
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

					{/* Documents / Certifications */}
					{mentor.documents && mentor.documents.length > 0 && (
						<Section title="Certifications & Verification" icon={<svg className="w-4 h-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z" clipRule="evenodd" /></svg>}>
							<div className="space-y-3">
								{mentor.documents.map((doc, i) => (
									<div key={i} className="flex items-start gap-3 bg-white/3 border border-white/5 rounded-lg p-4">
										<div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
											<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-white">{doc.name || `Document ${i + 1}`}</p>
											{doc.type && <p className="text-xs text-gray-500 mt-0.5">{doc.type}</p>}
											{doc.url && (
												<a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors">
													View Document
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
												</a>
											)}
										</div>
									</div>
								))}
							</div>
							{mentor.verified && (
								<div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
									<svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
									<div>
										<p className="text-sm font-semibold text-emerald-400">Identity Verified</p>
										<p className="text-xs text-emerald-400/70 mt-0.5">This mentor&apos;s identity has been verified through document review and credential checks.</p>
									</div>
								</div>
							)}
						</Section>
					)}

					{/* Verified banner without documents */}
					{mentor.verified && (!mentor.documents || mentor.documents.length === 0) && (
						<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-3">
							<svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
							<div>
								<p className="text-sm font-semibold text-emerald-400">Identity Verified</p>
								<p className="text-xs text-emerald-400/70 mt-0.5">This mentor&apos;s identity has been verified through document review and credential checks.</p>
							</div>
						</div>
					)}
				</div>

				{/* RIGHT COLUMN (1/3) — Packages */}
				<MentorPackages
					hourlyRate={hourlyRate ?? null}
					packages={mentor.packages}
					connectionStatus={connectionStatus}
					connectBtnDisabled={connectBtnDisabled}
					onConnectOrBook={scrollToBooking}
				/>
			</div>

			{/* CONNECTION REQUEST MODAL */}
			{showConnectModal && mentor && (
				<ConnectModal
					mentorName={mentor.name}
					mentorAvatar={mentor.avatar}
					mentorOccupation={mentor.occupation}
					onClose={() => setShowConnectModal(false)}
					onSubmit={handleSubmitConnection}
				/>
			)}
		</div>
	);
}
