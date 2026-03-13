'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button, BackButton, FeedbackBanner, PageSkeleton } from '@/components/ui';
import TagInput from '@/components/ui/TagInput';
import { getSessionToken } from '@/lib/auth-utils';
import type { SlotEntry, DocumentEntry } from './_components/constants';
import { AchievementsCard } from './_components/AchievementsCard';
import { AvailabilitySlotsCard } from './_components/AvailabilitySlotsCard';
import { DocumentsCard } from './_components/DocumentsCard';

export default function EditMentorPage() {
	const router = useRouter();
	const params = useParams();
	const mentorId = params.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

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
			const json = await res.json();
			const m = json.data;

			setUserName(m.user_name || '');
			setUserEmail(m.user_email || '');
			setOccupation(m.occupation || '');
			setAvatar(m.avatar || null);
			setStatus(m.status || '');
			setVerified(m.verified || false);

			// Expertise
			if (m.expertise) {
				if (Array.isArray(m.expertise)) setExpertise(m.expertise.filter(Boolean));
				else if (typeof m.expertise === 'string') setExpertise(m.expertise.split(',').map((s: string) => s.trim()).filter(Boolean));
			}

			// Achievements
			if (m.achievements) {
				if (Array.isArray(m.achievements)) setAchievements(m.achievements.filter(Boolean));
				else if (typeof m.achievements === 'string') {
					setAchievements(m.achievements.split(/[\n;]+/).map((s: string) => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean));
				}
			}

			// Pricing
			if (m.pricing_per_hour) setPricingPerHour(String(m.pricing_per_hour));
			if (m.rate) setRate(String(m.rate));

			// Availability / slots
			if (m.availability) {
				try {
					const parsed = typeof m.availability === 'string' ? JSON.parse(m.availability) : m.availability;
					if (Array.isArray(parsed) && parsed.length > 0) setSlots(parsed);
				} catch { /* ignore */ }
			}

			// Documents
			if (m.documents && Array.isArray(m.documents) && m.documents.length > 0) {
				setDocuments(m.documents);
			}

			setError(null);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	// Submit
	const handleSubmit = async () => {
		setError(null);
		setSuccess(false);
		setSaving(true);

		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');

			const body: Record<string, unknown> = {
				expertise: expertise,
				achievements: achievements,
				availability: JSON.stringify(slots),
				documents: documents,
			};
			if (pricingPerHour) body.pricing_per_hour = parseFloat(pricingPerHour);
			if (rate) body.rate = parseFloat(rate);
			if (occupation) body.occupation = occupation;

			const res = await fetch(`/api/mentors/${mentorId}/`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to update mentor');
			}

			setSuccess(true);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setSaving(false);
		}
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

	if (error && !userName) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-600 mb-4">{error}</p><Button onClick={() => router.push('/institution-dashboard/mentors')}>Back to Mentors</Button></Card></div>
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
						<h1 className="text-2xl font-bold text-gray-900">Edit Mentor</h1>
						<p className="text-sm text-gray-600 mt-1">Update mentor profile — same fields as the mentor sees</p>
					</div>
					<Button onClick={handleSubmit} disabled={saving}>
						{saving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>

				{success && <FeedbackBanner type="success" message="Changes saved successfully!" onDismiss={() => setSuccess(false)} />}
				{error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

				{/* Profile Overview (read-only) */}
				<Card className="p-6">
					<div className="flex items-center gap-4 mb-2">
						<div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 shrink-0 overflow-hidden">
							{avatar ? (
								<img src={avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
							) : (
								userName?.[0]?.toUpperCase() || '?'
							)}
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-gray-900">{userName || 'Unnamed Mentor'}</h2>
							<p className="text-sm text-gray-500">{userEmail}</p>
						</div>
						<div className="flex items-center gap-2">
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
								{verified ? 'Verified' : 'Pending'}
							</span>
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'approved' || status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
								{status}
							</span>
						</div>
					</div>
				</Card>

				{/* Occupation */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">Occupation</h3>
					<input
						type="text"
						value={occupation}
						onChange={(e) => setOccupation(e.target.value)}
						className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
						placeholder="e.g., Senior Product Manager at Google"
					/>
				</Card>

				{/* Expertise */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">Expertise Areas</h3>
					<p className="text-sm text-gray-500">Add your areas of expertise one at a time</p>
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
					<h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-2">Rate per hour (INR)</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rs</span>
								<input
									type="number"
									value={pricingPerHour}
									onChange={(e) => setPricingPerHour(e.target.value)}
									className="w-full pl-8 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
									placeholder="0.00"
									min="0"
									step="0.01"
								/>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-2">Base Rate (INR)</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rs</span>
								<input
									type="number"
									value={rate}
									onChange={(e) => setRate(e.target.value)}
									className="w-full pl-8 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
									placeholder="0.00"
									min="0"
									step="0.01"
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
					<button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
						Cancel
					</button>
					<button onClick={handleSubmit} disabled={saving} className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2">
						{saving ? 'Saving...' : <><span>Save Changes</span> <span>→</span></>}
					</button>
				</div>
			</div>
		</DashboardSidebar>
	);
}
