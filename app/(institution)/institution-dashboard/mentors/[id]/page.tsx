'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';

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
			<p className="text-xs font-medium text-(--secondary) mb-1">{label}</p>
			<p className="text-sm text-(--primary)">{value}</p>
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
			if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to load mentor'));
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
				throw new Error(await readApiErrorMessage(res, 'Failed to remove mentor'));
			}
			router.push('/institution-dashboard/mentors');
		} catch (err) {
			setError((err as Error).message);
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
						<div className="h-8 bg-(--accent-light) rounded w-1/4" />
						<div className="h-64 bg-(--accent-light) rounded" />
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
						<p className="text-red-400 mb-4">{error || 'Mentor not found'}</p>
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
					<button onClick={() => router.push('/institution-dashboard/mentors')} className="text-sm text-(--secondary) hover:text-(--primary) flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Mentors
					</button>
					<div className="flex items-center gap-2">
						<Button onClick={() => router.push(`/institution-dashboard/mentors/${mentorId}/edit`)}>
							Edit Mentor
						</Button>
						<Button variant="ghost" className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/150/10" onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Removing...' : 'Delete'}
						</Button>
					</div>
				</div>

				{/* Profile Card */}
				<Card className="p-8 bg-(--accent-subtle) border border-(--border)">
					<div className="flex items-start gap-6 mb-6">
						<div className="w-20 h-20 rounded-full bg-(--accent-light) flex items-center justify-center text-3xl font-bold text-(--primary-light) shrink-0 overflow-hidden">
							{mentor.avatar ? (
								<img src={mentor.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
							) : (
								mentor.user_name?.[0]?.toUpperCase() || '?'
							)}
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-(--primary)">{mentor.user_name || 'Unnamed Mentor'}</h1>
							{mentor.occupation && <p className="text-(--primary-light) mt-1">{mentor.occupation}</p>}
							{mentor.user_email && <p className="text-sm text-(--secondary) mt-1">{mentor.user_email}</p>}
							<div className="flex items-center gap-3 mt-3">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${mentor.verified ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-200'}`}>
									{mentor.verified ? 'Verified' : 'Pending'}
								</span>
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${mentor.status === 'approved' || mentor.status === 'active' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200' : 'bg-(--accent-light) text-(--primary)'}`}>
									{mentor.status}
								</span>
								{mentor.profile_completed && (
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200">
										Profile Complete
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Details Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-(--border) pt-6">
						<InfoRow label="Institution" value={mentor.institutionName} />
						<InfoRow label="Base Rate" value={mentor.rate ? `INR ${Number(mentor.rate).toLocaleString('en-IN')}` : null} />
						<InfoRow label="Pricing / Hour" value={mentor.pricing_per_hour ? `INR ${Number(mentor.pricing_per_hour).toLocaleString('en-IN')}/hr` : null} />
						<InfoRow label="Joined" value={new Date(mentor.created_at).toLocaleDateString()} />
						<InfoRow label="Last Updated" value={new Date(mentor.updated_at).toLocaleDateString()} />
					</div>
				</Card>

				{/* Expertise */}
				{expertiseList.length > 0 && (
					<Card className="p-6 bg-(--accent-subtle) border border-(--border)">
						<h3 className="text-sm font-semibold text-(--primary) mb-3">Expertise Areas</h3>
						<div className="flex flex-wrap gap-2">
							{expertiseList.map((exp, idx) => (
								<span key={idx} className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 rounded-full">{exp}</span>
							))}
						</div>
					</Card>
				)}

				{/* Achievements */}
				{achievementsList.length > 0 && (
					<Card className="p-6 bg-(--accent-subtle) border border-(--border)">
						<h3 className="text-sm font-semibold text-(--primary) mb-3">Achievements & Highlights</h3>
						<ul className="space-y-2">
							{achievementsList.map((a, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-(--primary-light)">
									<span className="mt-0.5 text-amber-500 shrink-0">•</span>
									<span>{a}</span>
								</li>
							))}
						</ul>
					</Card>
				)}

				{/* Availability Slots */}
				{slotsList.length > 0 && (
					<Card className="p-6 bg-(--accent-subtle) border border-(--border)">
						<h3 className="text-sm font-semibold text-(--primary) mb-3">Available Slots</h3>
						<div className="space-y-2">
							{slotsList.map((slot, i) => (
								<div key={i} className="flex items-center gap-3 p-3 bg-(--accent-subtle) rounded-lg text-sm">
									<span className="font-medium text-(--primary) min-w-25">{slot.day}</span>
									<span className="text-(--secondary)">{slot.startTime}</span>
									<span className="text-(--secondary)">—</span>
									<span className="text-(--secondary)">{slot.endTime}</span>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* Documents */}
				{docsList.length > 0 && (
					<Card className="p-6 bg-(--accent-subtle) border border-(--border)">
						<h3 className="text-sm font-semibold text-(--primary) mb-3">Documents</h3>
						<div className="space-y-2">
							{docsList.map((doc, i) => (
								<div key={i} className="flex items-center gap-3 p-3 bg-(--accent-subtle) rounded-lg">
									<svg className="w-5 h-5 text-(--secondary) shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-(--primary) truncate">{doc.name}</p>
										{doc.uploadedAt && <p className="text-xs text-(--secondary)">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>}
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
					<Card className="p-6 bg-(--accent-subtle) border border-(--border)">
						<h3 className="text-sm font-semibold text-(--primary) mb-3">Packages</h3>
						<pre className="text-xs text-(--primary-light) bg-(--accent-subtle) rounded-lg p-4 overflow-auto">{JSON.stringify(mentor.packages, null, 2)}</pre>
					</Card>
				)}
			</div>
		</DashboardSidebar>
	);
}
