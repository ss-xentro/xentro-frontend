'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface StartupDetail {
	id: string;
	name: string;
	slug: string;
	tagline: string | null;
	logo: string | null;
	coverImage: string | null;
	pitch: string | null;
	description: string | null;
	stage: string | null;
	status: string | null;
	location: string | null;
	city: string | null;
	country: string | null;
	oneLiner: string | null;
	foundedDate: string | null;
	fundingRound: string | null;
	fundsRaised: string | null;
	fundingCurrency: string | null;
	website: string | null;
	linkedin: string | null;
	twitter: string | null;
	instagram: string | null;
	pitchDeckUrl: string | null;
	demoVideoUrl: string | null;
	industry: string | null;
	primaryContactEmail: string | null;
	teamSize: number | null;
	sectors: string[];
	sdgs: string[];
	createdAt: string;
	updatedAt: string;
}

const stageLabels: Record<string, string> = {
	idea: 'Idea Stage',
	mvp: 'MVP (Pre-Revenue)',
	early_traction: 'Early Traction',
	growth: 'Growth',
	scale: 'Scale',
};

const fundingLabels: Record<string, string> = {
	bootstrapped: 'Bootstrapped',
	pre_seed: 'Pre-Seed',
	seed: 'Seed',
	series_a: 'Series A',
	series_b_plus: 'Series B+',
	unicorn: 'Unicorn',
};

export default function StartupDetailPage() {
	const router = useRouter();
	const params = useParams();
	const startupId = params.id as string;

	const [startup, setStartup] = useState<StartupDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => { loadStartup(); }, []);

	const loadStartup = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) { router.push('/institution-login'); return; }
			const res = await fetch(`/api/startups/${startupId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load startup');
			const data = await res.json();
			setStartup(data.data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this startup? It will be moved to the recycle bin.')) return;
		setDeleting(true);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');
			const res = await fetch(`/api/startups/${startupId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to delete startup');
			}
			router.push('/institution-dashboard/startups');
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>
			</DashboardSidebar>
		);
	}

	if (error || !startup) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-600 mb-4">{error || 'Startup not found'}</p><Button onClick={() => router.push('/institution-dashboard/startups')}>Back to Startups</Button></Card></div>
			</DashboardSidebar>
		);
	}

	const InfoRow = ({ label, value, isLink }: { label: string; value: string | null | undefined; isLink?: boolean }) => {
		if (!value) return null;
		return (
			<div>
				<p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
				{isLink ? (
					<a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{value}</a>
				) : (
					<p className="text-sm text-gray-900">{value}</p>
				)}
			</div>
		);
	};

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/startups')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Startups
					</button>
					<div className="flex items-center gap-2">
						<Button onClick={() => router.push(`/institution-dashboard/startups/${startupId}/edit`)}>Edit Startup</Button>
						<Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</div>

				{/* Cover image */}
				{startup.coverImage && (
					<div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
						<img src={startup.coverImage} alt="Cover" className="w-full h-full object-cover" />
					</div>
				)}

				{/* Profile header */}
				<Card className="p-8">
					<div className="flex items-start gap-5 mb-4">
						{startup.logo ? (
							<img src={startup.logo} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
						) : (
							<div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
								{startup.name.substring(0, 2).toUpperCase()}
							</div>
						)}
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-1">
								<h1 className="text-2xl font-bold text-gray-900">{startup.name}</h1>
								{startup.stage && (
									<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
										{stageLabels[startup.stage] || startup.stage}
									</span>
								)}
								{startup.status && (
									<span className={`px-2 py-1 text-xs font-medium rounded ${startup.status === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
										{startup.status}
									</span>
								)}
							</div>
							{startup.tagline && <p className="text-gray-600 text-sm">{startup.tagline}</p>}
						</div>
					</div>

					{startup.oneLiner && (
						<p className="text-gray-700 text-lg mb-4 italic">&ldquo;{startup.oneLiner}&rdquo;</p>
					)}

					{startup.pitch && (
						<p className="text-gray-600 mb-4">{startup.pitch}</p>
					)}

					{startup.description && (
						<div className="border-t border-gray-200 pt-4 mt-4">
							<p className="text-xs font-medium text-gray-500 mb-2">Description</p>
							<p className="text-sm text-gray-700 whitespace-pre-wrap">{startup.description}</p>
						</div>
					)}
				</Card>

				{/* Details Grid */}
				<Card className="p-8">
					<h3 className="text-sm font-semibold text-gray-900 mb-4">Company Details</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<InfoRow label="Industry" value={startup.industry} />
						<InfoRow label="Location" value={startup.location} />
						<InfoRow label="City" value={startup.city} />
						<InfoRow label="Country" value={startup.country} />
						<InfoRow label="Founded" value={startup.foundedDate ? new Date(startup.foundedDate).toLocaleDateString() : null} />
						<InfoRow label="Primary Contact" value={startup.primaryContactEmail} />
						<InfoRow label="Team Size" value={startup.teamSize ? String(startup.teamSize) : null} />
						<InfoRow label="Created" value={new Date(startup.createdAt).toLocaleDateString()} />
					</div>
				</Card>

				{/* Funding */}
				{(startup.fundingRound || startup.fundsRaised) && (
					<Card className="p-8">
						<h3 className="text-sm font-semibold text-gray-900 mb-4">Funding & Financials</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<InfoRow label="Latest Round" value={startup.fundingRound ? (fundingLabels[startup.fundingRound] || startup.fundingRound) : null} />
							<InfoRow label="Funds Raised" value={startup.fundsRaised ? `${startup.fundingCurrency || 'USD'} ${Number(startup.fundsRaised).toLocaleString()}` : null} />
						</div>
					</Card>
				)}

				{/* Links */}
				{(startup.website || startup.linkedin || startup.twitter || startup.instagram || startup.pitchDeckUrl || startup.demoVideoUrl) && (
					<Card className="p-8">
						<h3 className="text-sm font-semibold text-gray-900 mb-4">Links & Social</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<InfoRow label="Website" value={startup.website} isLink />
							<InfoRow label="LinkedIn" value={startup.linkedin} isLink />
							<InfoRow label="Twitter" value={startup.twitter} isLink />
							<InfoRow label="Instagram" value={startup.instagram} isLink />
							<InfoRow label="Pitch Deck" value={startup.pitchDeckUrl} isLink />
							<InfoRow label="Demo Video" value={startup.demoVideoUrl} isLink />
						</div>
					</Card>
				)}

				{/* Sectors & SDGs */}
				{((startup.sectors && startup.sectors.length > 0) || (startup.sdgs && startup.sdgs.length > 0)) && (
					<Card className="p-8">
						{startup.sectors && startup.sectors.length > 0 && (
							<div className="mb-6">
								<p className="text-xs font-medium text-gray-500 mb-3">Sectors</p>
								<div className="flex flex-wrap gap-2">
									{startup.sectors.map((s, i) => (
										<span key={i} className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">{s}</span>
									))}
								</div>
							</div>
						)}
						{startup.sdgs && startup.sdgs.length > 0 && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-3">SDG Focus</p>
								<div className="flex flex-wrap gap-2">
									{startup.sdgs.map((s, i) => (
										<span key={i} className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 rounded-full">{s}</span>
									))}
								</div>
							</div>
						)}
					</Card>
				)}
			</div>
		</DashboardSidebar>
	);
}
