'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';

interface MentorDetail {
	id: string;
	name: string;
	title: string;
	company: string;
	expertise: string[];
	avatar?: string | null;
	bio?: string;
	location?: string;
	status: string;
	email?: string;
	rate?: string | null;
	achievements?: string | string[];
	availability?: Record<string, unknown> | null;
	packages?: string | string[];
}

export default function MentorDetailPage() {
	const params = useParams();
	const router = useRouter();
	const mentorId = params.id as string;

	const [mentor, setMentor] = useState<MentorDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

	// Connect modal state
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [connectMessage, setConnectMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);

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

				setMentor({
					id: found.id,
					name: found.user_name || found.name || 'Mentor',
					title: found.occupation || found.role_title || '',
					company: found.company || '',
					expertise: typeof found.expertise === 'string'
						? found.expertise.split(',').map((s: string) => s.trim()).filter(Boolean)
						: Array.isArray(found.expertise) ? found.expertise : [],
					avatar: found.avatar || null,
					bio: found.bio || '',
					location: found.location || '',
					status: found.status || 'approved',
					email: found.user_email || '',
					rate: found.rate || found.pricing_per_hour || null,
					achievements: found.achievements || [],
					availability: found.availability || null,
					packages: found.packages || [],
				});
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [mentorId]);

	// Load connection status
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
				if (match) setConnectionStatus(match.status);
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

	if (loading) {
		return (
			<div className="p-6 max-w-3xl mx-auto animate-pulse space-y-6">
				<div className="h-8 w-32 bg-white/5 rounded-lg" />
				<div className="h-64 bg-white/5 border border-white/10 rounded-2xl" />
				<div className="h-40 bg-white/5 border border-white/10 rounded-2xl" />
			</div>
		);
	}

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

	const getButtonLabel = () => {
		if (connectionStatus === 'pending') return 'Pending';
		if (connectionStatus === 'accepted') return 'Connected';
		if (connectionStatus === 'rejected') return 'Rejected';
		return 'Connect';
	};

	const getButtonStyle = () => {
		if (connectionStatus === 'pending') return 'bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-default';
		if (connectionStatus === 'accepted') return 'bg-green-500/20 text-green-300 border-green-500/30 cursor-default';
		if (connectionStatus === 'rejected') return 'bg-red-500/20 text-red-300 border-red-500/30 cursor-default';
		return 'bg-violet-600 hover:bg-violet-500 text-white';
	};

	return (
		<div className="p-6 max-w-3xl mx-auto">
			{/* Back link */}
			<Link href="/explore/mentors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Back to Mentors
			</Link>

			{/* Profile Card */}
			<div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
				<div className="flex flex-col sm:flex-row items-start gap-6">
					{/* Avatar */}
					<div className="w-20 h-20 rounded-full bg-linear-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
						{mentor.avatar ? (
							<img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
						) : (
							<span className="text-2xl font-bold text-gray-300">{mentor.name.charAt(0).toUpperCase()}</span>
						)}
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div>
								<h1 className="text-2xl font-bold text-white">{mentor.name}</h1>
								<p className="text-sm text-gray-500 mt-1">
									{mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}
								</p>
							</div>
							<button
								onClick={() => {
									if (!connectionStatus || connectionStatus === 'rejected') handleConnect();
								}}
								disabled={['pending', 'accepted'].includes(connectionStatus || '')}
								className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${getButtonStyle()}`}
							>
								{getButtonLabel()}
							</button>
						</div>

						{mentor.location && (
							<div className="flex items-center gap-1.5 text-sm text-gray-500 mt-3">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								{mentor.location}
							</div>
						)}

						{/* Expertise tags */}
						{mentor.expertise.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-4">
								{mentor.expertise.map((tag) => (
									<span key={tag} className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Bio / About */}
			{mentor.bio && (
				<div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
					<h2 className="text-base font-semibold text-white mb-3">About</h2>
					<p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{mentor.bio}</p>
				</div>
			)}

			{/* Achievements */}
			{mentor.achievements && (Array.isArray(mentor.achievements) ? mentor.achievements.length > 0 : !!mentor.achievements) && (
				<div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
					<h2 className="text-base font-semibold text-white mb-3">Achievements</h2>
					{Array.isArray(mentor.achievements) ? (
						<ul className="space-y-2">
							{mentor.achievements.map((a, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-gray-400">
									<span className="text-violet-400 mt-0.5">•</span>
									{a}
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{mentor.achievements}</p>
					)}
				</div>
			)}

			{/* Rate */}
			{mentor.rate && (
				<div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
					<h2 className="text-base font-semibold text-white mb-3">Pricing</h2>
					<p className="text-lg font-bold text-violet-400">${mentor.rate}/hr</p>
				</div>
			)}

			{/* Connection Modal */}
			{showConnectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => !submitting && setShowConnectModal(false)}
					/>
					<div className="relative bg-[#12141a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
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
								<p className="text-xs text-gray-500">
									{mentor.title}{mentor.company ? ` · ${mentor.company}` : ''}
								</p>
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
