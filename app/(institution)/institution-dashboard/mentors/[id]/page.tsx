'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface SlotEntry { day: string; startTime: string; endTime: string; }
interface DocumentEntry { name: string; url: string; uploadedAt: string; }

interface MentorDetail {
	id: string;
	user_name: string | null;
	user_email: string | null;
	avatar: string | null;
	occupation: string | null;
	expertise: string[] | string | null;
	status: string;
	verified: boolean;
	rate: number | null;
	pricing_per_hour: number | null;
	packages: Record<string, unknown>[] | null;
	achievements: string[] | string | null;
	availability: SlotEntry[] | string | null;
	documents: DocumentEntry[] | null;
	profile_completed: boolean;
	institutionName: string | null;
	created_at: string;
	updated_at: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	if (!value) return null;
	return (
		<div>
			<p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
			<p className="text-sm text-gray-900">{value}</p>
		</div>
	);
}

export default function MentorDetailPage() {
	const router = useRouter();
	const params = useParams();
	const mentorId = params.id as string;

	const [mentor, setMentor] = useState<MentorDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadMentor();
	}, []);

	const loadMentor = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) { router.push('/institution-login'); return; }

			const res = await fetch(`/api/mentors/${mentorId}/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load mentor');
			const data = await res.json();
			setMentor(data.data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to remove this mentor? They will be moved to the recycle bin.')) return;
		setDeleting(true);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');
			const res = await fetch(`/api/institution-mentors/${mentorId}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to remove mentor');
			}
			router.push('/institution-dashboard/mentors');
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setDeleting(false);
		}
	};

	// Parse expertise into array
	const parseExpertise = (): string[] => {
		if (!mentor?.expertise) return [];
		if (Array.isArray(mentor.expertise)) return mentor.expertise.filter(Boolean);
		if (typeof mentor.expertise === 'string') return mentor.expertise.split(',').map((s) => s.trim()).filter(Boolean);
		return [];
	};

	// Parse achievements into array
	const parseAchievements = (): string[] => {
		if (!mentor?.achievements) return [];
		if (Array.isArray(mentor.achievements)) return mentor.achievements.filter(Boolean);
		if (typeof mentor.achievements === 'string') {
			return mentor.achievements.split(/[\n;]+/).map((s) => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
		}
		return [];
	};

	// Parse availability/slots
	const parseSlots = (): SlotEntry[] => {
		if (!mentor?.availability) return [];
		try {
			const parsed = typeof mentor.availability === 'string' ? JSON.parse(mentor.availability) : mentor.availability;
			return Array.isArray(parsed) ? parsed : [];
		} catch { return []; }
	};

	// Parse documents
	const parseDocs = (): DocumentEntry[] => {
		if (!mentor?.documents) return [];
		return Array.isArray(mentor.documents) ? mentor.documents : [];
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 rounded w-1/4" />
						<div className="h-64 bg-gray-200 rounded" />
					</div>
				</div>
			</DashboardSidebar>
		);
	}

	if (error || !mentor) {
		return (
			<DashboardSidebar>
				<div className="p-8">
					<Card className="p-8 text-center">
						<p className="text-red-600 mb-4">{error || 'Mentor not found'}</p>
						<Button onClick={() => router.push('/institution-dashboard/mentors')}>Back to Mentors</Button>
					</Card>
				</div>
			</DashboardSidebar>
		);
	}

	const expertiseList = parseExpertise();
	const achievementsList = parseAchievements();
	const slotsList = parseSlots();
	const docsList = parseDocs();

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/mentors')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Mentors
					</button>
					<div className="flex items-center gap-2">
						<Button onClick={() => router.push(`/institution-dashboard/mentors/${mentorId}/edit`)}>
							Edit Mentor
						</Button>
						<Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Removing...' : 'Delete'}
						</Button>
					</div>
				</div>

				{/* Profile Card */}
				<Card className="p-8">
					<div className="flex items-start gap-6 mb-6">
						<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shrink-0 overflow-hidden">
							{mentor.avatar ? (
								<img src={mentor.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
							) : (
								mentor.user_name?.[0]?.toUpperCase() || '?'
							)}
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-gray-900">{mentor.user_name || 'Unnamed Mentor'}</h1>
							{mentor.occupation && <p className="text-gray-600 mt-1">{mentor.occupation}</p>}
							{mentor.user_email && <p className="text-sm text-gray-400 mt-1">{mentor.user_email}</p>}
							<div className="flex items-center gap-3 mt-3">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${mentor.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
									{mentor.verified ? 'Verified' : 'Pending'}
								</span>
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${mentor.status === 'approved' || mentor.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
									{mentor.status}
								</span>
								{mentor.profile_completed && (
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
										Profile Complete
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Details Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
						<InfoRow label="Institution" value={mentor.institutionName} />
						<InfoRow label="Base Rate" value={mentor.rate ? `$${Number(mentor.rate).toFixed(2)}` : null} />
						<InfoRow label="Pricing / Hour" value={mentor.pricing_per_hour ? `$${Number(mentor.pricing_per_hour).toFixed(2)}/hr` : null} />
						<InfoRow label="Joined" value={new Date(mentor.created_at).toLocaleDateString()} />
						<InfoRow label="Last Updated" value={new Date(mentor.updated_at).toLocaleDateString()} />
					</div>
				</Card>

				{/* Expertise */}
				{expertiseList.length > 0 && (
					<Card className="p-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Expertise Areas</h3>
						<div className="flex flex-wrap gap-2">
							{expertiseList.map((exp, idx) => (
								<span key={idx} className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">{exp}</span>
							))}
						</div>
					</Card>
				)}

				{/* Achievements */}
				{achievementsList.length > 0 && (
					<Card className="p-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Achievements & Highlights</h3>
						<ul className="space-y-2">
							{achievementsList.map((a, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-gray-700">
									<span className="mt-0.5 text-amber-500 shrink-0">•</span>
									<span>{a}</span>
								</li>
							))}
						</ul>
					</Card>
				)}

				{/* Availability Slots */}
				{slotsList.length > 0 && (
					<Card className="p-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Available Slots</h3>
						<div className="space-y-2">
							{slotsList.map((slot, i) => (
								<div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
									<span className="font-medium text-gray-900 min-w-25">{slot.day}</span>
									<span className="text-gray-500">{slot.startTime}</span>
									<span className="text-gray-400">—</span>
									<span className="text-gray-500">{slot.endTime}</span>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* Documents */}
				{docsList.length > 0 && (
					<Card className="p-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Documents</h3>
						<div className="space-y-2">
							{docsList.map((doc, i) => (
								<div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
									<svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
										{doc.uploadedAt && <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>}
									</div>
									<a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
										View
									</a>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* Packages (if any) */}
				{mentor.packages && Array.isArray(mentor.packages) && (mentor.packages as unknown[]).length > 0 && (
					<Card className="p-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Packages</h3>
						<pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-4 overflow-auto">{JSON.stringify(mentor.packages, null, 2)}</pre>
					</Card>
				)}
			</div>
		</DashboardSidebar>
	);
}
