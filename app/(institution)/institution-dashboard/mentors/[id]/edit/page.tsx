'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface SlotEntry {
	day: string;
	startTime: string;
	endTime: string;
}

interface DocumentEntry {
	name: string;
	url: string;
	uploadedAt: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_OPTIONS = [
	'06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
	'09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
	'12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
	'15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
	'18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
	'21:00', '21:30', '22:00',
];

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
	const [expertiseInput, setExpertiseInput] = useState('');
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

	// Expertise management
	const addExpertise = () => {
		const text = expertiseInput.trim();
		if (!text) return;
		setExpertise((prev) => [...prev, text]);
		setExpertiseInput('');
	};
	const removeExpertise = (i: number) => setExpertise((prev) => prev.filter((_, idx) => idx !== i));

	// Achievement management
	const addAchievement = () => {
		const text = achievementInput.trim();
		if (!text) return;
		setAchievements((prev) => [...prev, text]);
		setAchievementInput('');
	};
	const removeAchievement = (i: number) => setAchievements((prev) => prev.filter((_, idx) => idx !== i));

	// Slot management
	const addSlot = () => setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
	const removeSlot = (i: number) => setSlots(slots.filter((_, idx) => idx !== i));
	const updateSlot = (i: number, field: keyof SlotEntry, value: string) => {
		const updated = [...slots];
		updated[i] = { ...updated[i], [field]: value };
		setSlots(updated);
	};

	// Document removal
	const removeDocument = (i: number) => setDocuments(documents.filter((_, idx) => idx !== i));

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
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 rounded w-1/4" />
						<div className="h-64 bg-gray-200 rounded" />
					</div>
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
						<button onClick={() => router.push(`/institution-dashboard/mentors/${mentorId}`)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
							Back to Details
						</button>
						<h1 className="text-2xl font-bold text-gray-900">Edit Mentor</h1>
						<p className="text-sm text-gray-600 mt-1">Update mentor profile — same fields as the mentor sees</p>
					</div>
					<Button onClick={handleSubmit} disabled={saving}>
						{saving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>

				{success && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
						Changes saved successfully!
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
						{error}
					</div>
				)}

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
					<div className="flex gap-2">
						<input
							type="text"
							value={expertiseInput}
							onChange={(e) => setExpertiseInput(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExpertise(); } }}
							placeholder="e.g., Product Strategy, Fundraising"
							className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
						/>
						<Button variant="secondary" size="sm" onClick={addExpertise} disabled={!expertiseInput.trim()}>Add</Button>
					</div>
					{expertise.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{expertise.map((item, i) => (
								<span key={i} className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">
									{item}
									<button onClick={() => removeExpertise(i)} className="ml-1 text-blue-400 hover:text-red-500">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
								</span>
							))}
						</div>
					)}
				</Card>

				{/* Achievements */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">Achievements & Highlights</h3>
					<p className="text-sm text-gray-500">Add key accomplishments one at a time</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={achievementInput}
							onChange={(e) => setAchievementInput(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(); } }}
							placeholder="e.g., Mentored 50+ startups to Series A"
							className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
							maxLength={300}
						/>
						<Button variant="secondary" size="sm" onClick={addAchievement} disabled={!achievementInput.trim()}>Add</Button>
					</div>
					{achievements.length > 0 && (
						<ul className="space-y-2">
							{achievements.map((item, i) => (
								<li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
									<span className="mt-0.5 text-amber-500">•</span>
									<span className="flex-1 text-sm text-gray-800">{item}</span>
									<button onClick={() => removeAchievement(i)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
								</li>
							))}
						</ul>
					)}
				</Card>

				{/* Pricing */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-2">Rate per hour (USD)</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
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
							<label className="block text-xs font-medium text-gray-500 mb-2">Base Rate (USD)</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
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
				<Card className="p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-gray-900">Available Slots</h3>
							<p className="text-sm text-gray-500">Weekly availability for mentoring sessions</p>
						</div>
						<Button variant="secondary" size="sm" onClick={addSlot}>+ Add Slot</Button>
					</div>
					<div className="space-y-3">
						{slots.map((slot, i) => (
							<div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
								<select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none min-w-32">
									{DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
								</select>
								<select value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none">
									{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
								</select>
								<span className="text-gray-500 text-sm">to</span>
								<select value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none">
									{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
								</select>
								{slots.length > 1 && (
									<button onClick={() => removeSlot(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
									</button>
								)}
							</div>
						))}
					</div>
				</Card>

				{/* Documents */}
				<Card className="p-6 space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">Documents</h3>
					<p className="text-sm text-gray-500">Certifications, resume, or portfolio documents</p>
					{documents.length > 0 ? (
						<div className="space-y-2">
							{documents.map((doc, i) => (
								<div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
									<svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
										<p className="text-xs text-gray-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
									</div>
									<a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
									<button onClick={() => removeDocument(i)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-gray-400 py-4 text-center">No documents uploaded</p>
					)}
				</Card>

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
