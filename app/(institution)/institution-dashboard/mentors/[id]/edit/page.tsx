'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button, BackButton, PageSkeleton } from '@/components/ui';
import { toast } from 'sonner';
import TagInput from '@/components/ui/TagInput';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import type { SlotEntry, DocumentEntry } from './_components/constants';
import { AchievementsCard } from './_components/AchievementsCard';
import { AvailabilitySlotsCard } from './_components/AvailabilitySlotsCard';
import { DocumentsCard } from './_components/DocumentsCard';

export default function EditMentorPage() {
	const router = useRouter();
	const params = useParams();
	const mentorId = params.id as string;

	// --- TanStack Query: load mentor ---
	const { data: mentorRaw, isLoading: loading, error: queryError } = useApiQuery<{ data: Record<string, unknown> }>(
		queryKeys.institution.mentorDetail(mentorId),
		`/api/mentors/${mentorId}/`,
		{ requestOptions: { role: 'institution' } },
	);
	const loadError = queryError?.message ?? null;

	// Read-only profile info
	const [userName, setUserName] = useState('');
	const [userEmail, setUserEmail] = useState('');
	const [occupation, setOccupation] = useState('');
	const [avatar, setAvatar] = useState<string | null>(null);
	const [status, setStatus] = useState('');
	const [verified, setVerified] = useState(false);

	// Editable fields
	const [expertise, setExpertise] = useState<string[]>([]);
	const [achievements, setAchievements] = useState<string[]>([]);
	const [achievementInput, setAchievementInput] = useState('');
	const [pricingPerHour, setPricingPerHour] = useState('');
	const [rate, setRate] = useState('');
	const [slots, setSlots] = useState<SlotEntry[]>([{ day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
	const [documents, setDocuments] = useState<DocumentEntry[]>([]);
	const [formSeeded, setFormSeeded] = useState(false);

	// Seed form when query data arrives
	useEffect(() => {
		if (!mentorRaw || formSeeded) return;
		const m = mentorRaw.data;
		setUserName((m.user_name as string) || '');
		setUserEmail((m.user_email as string) || '');
		setOccupation((m.occupation as string) || '');
		setAvatar((m.avatar as string) || null);
		setStatus((m.status as string) || '');
		setVerified(!!(m.verified));

		if (m.expertise) setExpertise(Array.isArray(m.expertise) ? m.expertise as string[] : []);
		if (m.achievements) setAchievements(Array.isArray(m.achievements) ? m.achievements as string[] : []);
		if (m.pricing_per_hour) setPricingPerHour(String(m.pricing_per_hour));
		if (m.rate) setRate(String(m.rate));
		if (m.availability) {
			try {
				const parsed = typeof m.availability === 'string' ? JSON.parse(m.availability as string) : m.availability;
				if (Array.isArray(parsed)) setSlots(parsed);
			} catch { /* ignore parse errors */ }
		}
		if (m.documents) setDocuments(Array.isArray(m.documents) ? m.documents as DocumentEntry[] : []);
		setFormSeeded(true);
	}, [mentorRaw, formSeeded]);

	// --- TanStack Mutation: save mentor ---
	const saveMutation = useApiMutation<unknown, Record<string, unknown>>({
		method: 'put',
		path: `/api/mentors/${mentorId}/`,
		invalidateKeys: [queryKeys.institution.mentors(), queryKeys.institution.mentorDetail(mentorId)],
		requestOptions: { role: 'institution' },
		mutationOptions: {
			onSuccess: () => { toast.success('Changes saved successfully!'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
			onError: (err) => toast.error(err.message),
		},
	});

	const saving = saveMutation.isPending;

	// Submit
	const handleSubmit = () => {
		const body: Record<string, unknown> = {
			expertise: expertise,
			achievements: achievements,
			availability: JSON.stringify(slots),
			documents: documents,
		};
		if (pricingPerHour) body.pricing_per_hour = parseFloat(pricingPerHour);
		if (rate) body.rate = parseFloat(rate);
		if (occupation) body.occupation = occupation;

		saveMutation.mutate(body);
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="max-w-3xl mx-auto px-6 py-12">
					<PageSkeleton />
				</div>
			</DashboardSidebar>
		);
	}

	if (loadError && !userName) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-400 mb-4">{loadError}</p><Button onClick={() => router.push('/institution-dashboard/mentors')}>Back to Mentors</Button></Card></div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<BackButton href={`/institution-dashboard/mentors/${mentorId}`} label="Back to Details" />
						<h1 className="text-2xl font-bold text-(--primary)">Edit Mentor</h1>
						<p className="text-sm text-(--primary-light) mt-1">Update mentor profile — same fields as the mentor sees</p>
					</div>
					<Button onClick={handleSubmit} disabled={saving}>
						{saving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>



				{/* Profile Overview (read-only) */}
				<Card className="p-6 bg-(--accent-subtle) border border-(--border)">
					<div className="flex items-center gap-4 mb-2">
						<div className="w-14 h-14 rounded-full bg-(--accent-light) flex items-center justify-center text-xl font-bold text-(--primary-light) shrink-0 overflow-hidden">
							{avatar ? (
								<img src={avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
							) : (
								userName?.[0]?.toUpperCase() || '?'
							)}
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-(--primary)">{userName || 'Unnamed Mentor'}</h2>
							<p className="text-sm text-(--secondary)">{userEmail}</p>
						</div>
						<div className="flex items-center gap-2">
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${verified ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'}`}>
								{verified ? 'Verified' : 'Pending'}
							</span>
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'approved' || status === 'active' ? 'bg-blue-500/20 text-blue-200' : 'bg-(--accent-light) text-(--primary)'}`}>
								{status}
							</span>
						</div>
					</div>
				</Card>

				{/* Occupation */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-(--primary)">Occupation</h3>
					<input
						type="text"
						value={occupation}
						onChange={(e) => setOccupation(e.target.value)}
						className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
						placeholder="e.g., Senior Product Manager at Google"
					/>
				</Card>

				{/* Expertise */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-(--primary)">Expertise Areas</h3>
					<p className="text-sm text-(--secondary)">Add your areas of expertise one at a time</p>
					<TagInput
						tags={expertise}
						onChange={setExpertise}
						placeholder="e.g., Product Strategy, Fundraising"
					/>
				</Card>

				{/* Achievements */}
				<AchievementsCard
					achievements={achievements}
					setAchievements={setAchievements}
					achievementInput={achievementInput}
					setAchievementInput={setAchievementInput}
				/>

				{/* Pricing */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-(--primary)">Pricing</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Rate per hour (INR)</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--secondary)">Rs</span>
								<input
									type="number"
									value={pricingPerHour}
									onChange={(e) => setPricingPerHour(e.target.value)}
									className="w-full pl-8 pr-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"

									min="0"
									step="1"
								/>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Base Rate (INR)</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--secondary)">Rs</span>
								<input
									type="number"
									value={rate}
									onChange={(e) => setRate(e.target.value)}
									className="w-full pl-8 pr-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"

									min="0"
									step="1"
								/>
							</div>
						</div>
					</div>
				</Card>

				{/* Available Slots */}
				<AvailabilitySlotsCard slots={slots} setSlots={setSlots} />

				{/* Documents */}
				<DocumentsCard documents={documents} setDocuments={setDocuments} />

				{/* Bottom actions */}
				<div className="flex items-center justify-between pt-4 pb-8">
					<button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-(--primary-light) hover:text-(--primary) transition-colors">
						Cancel
					</button>
					<button onClick={handleSubmit} disabled={saving} className="px-6 py-3 text-sm font-medium bg-(--primary) text-(--background) rounded-lg hover:bg-(--primary-light) disabled:opacity-50 transition-colors flex items-center gap-2">
						{saving ? 'Saving...' : <><span>Save Changes</span> <span>→</span></>}
					</button>
				</div>
			</div>
		</DashboardSidebar>
	);
}
