'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';
import { AppIcon } from '@/components/ui/AppIcon';
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

	useEffect(() => {
		async function load() {
			try {
				setLoading(true);
				const res = await fetch('/api/mentors');
				if (!res.ok) return;
				const json = await res.json();
				const raw = json.mentors ?? json.data ?? [];
				const found = raw.find((m: Record<string, unknown>) => m.id === mentorId);
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

	const btnConfig = getConnectBtnConfig(connectionStatus);

	const scrollToBooking = () => {
		if (connectionStatus === 'accepted') {
			document.getElementById('availability-booking')?.scrollIntoView({ behavior: 'smooth' });
		} else if (!btnConfig.disabled) {
			handleConnect();
		}
	};

	if (loading) {
		return (
			<div className="p-6 max-w-5xl mx-auto animate-pulse space-y-5">
				<div className="h-5 w-36 bg-white/5 rounded-lg" />
				<div className="h-48 bg-white/3 border border-white/6 rounded-xl" />
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/3 border border-white/6 rounded-xl" />)}</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
					<div className="lg:col-span-2 space-y-5"><div className="h-40 bg-white/3 border border-white/6 rounded-xl" /><div className="h-28 bg-white/3 border border-white/6 rounded-xl" /></div>
					<div className="h-64 bg-white/3 border border-white/6 rounded-xl" />
				</div>
			</div>
		);
	}

	if (!mentor) {
		return (
			<div className="p-6 flex flex-col items-center justify-center py-24 text-center">
				<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><AppIcon name="brain" className="w-8 h-8 text-gray-500" /></div>
				<h3 className="text-lg font-semibold text-white mb-1">Mentor not found</h3>
				<p className="text-sm text-gray-500 mb-4">This mentor profile doesn&apos;t exist or has been removed.</p>
				<button onClick={() => router.back()} className="text-sm text-violet-400 hover:text-violet-300">&larr; Go back</button>
			</div>
		);
	}

	const hourlyRate = mentor.pricingPerHour || mentor.rate;

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<Link href="/explore/mentors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
				Back to Mentors
			</Link>

			<HeroSection mentor={mentor} connectionStatus={connectionStatus} btnConfig={btnConfig} onAction={scrollToBooking} />

			{hourlyRate && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Hourly Rate" value={`INR ${Number(hourlyRate).toLocaleString('en-IN')}`} />
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} label="Status" value={mentor.verified ? 'Verified' : mentor.status === 'approved' ? 'Approved' : 'Pending'} />
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} label="Expertise Areas" value={String(mentor.expertise.length)} />
					<StatCard icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} label="Achievements" value={String(mentor.achievements.length)} />
				</div>
			)}

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
					connectionStatus={connectionStatus}
					connectBtnDisabled={btnConfig.disabled}
					onConnectOrBook={scrollToBooking}
				/>
			</div>

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
