'use client';

import RichTextDisplay from '@/components/ui/RichTextDisplay';
import { ProfileData, DocumentEntry, PricingPlan } from '../_lib/constants';

interface ProfileViewProps {
	profileData: ProfileData;
	achievements: string[];
	highlights: string[];
	pricingPlans: PricingPlan[];
	documents: DocumentEntry[];
	slots: Array<{ day: string; startTime: string; endTime: string }>;
	onEditClick: () => void;
}

function ExpertiseTag({ label }: { label: string }) {
	return (
		<span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-(--surface-hover) text-(--primary) border border-(--border)">
			{label}
		</span>
	);
}

function SectionBlock({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<div className="flex items-center gap-2 mb-4">
				{icon && <span>{icon}</span>}
				<h3 className="font-semibold text-(--primary)">{title}</h3>
			</div>
			{children}
		</div>
	);
}

export default function ProfileView({
	profileData,
	achievements,
	highlights,
	pricingPlans,
	documents,
	slots,
	onEditClick,
}: ProfileViewProps) {
	const expertiseList = Array.isArray(profileData.expertise)
		? profileData.expertise
		: String(profileData.expertise || '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

	const slotsByDay = slots.reduce<Record<string, Array<{ startTime: string; endTime: string }>>>((acc, s) => {
		if (!acc[s.day]) acc[s.day] = [];
		acc[s.day].push({ startTime: s.startTime, endTime: s.endTime });
		return acc;
	}, {});

	const formatTime = (t: string) => {
		const [h, m] = t.split(':').map(Number);
		const period = h >= 12 ? 'PM' : 'AM';
		const hour = h % 12 || 12;
		return `${hour}:${String(m).padStart(2, '0')} ${period}`;
	};

	return (
		<div className="space-y-5">
			{/* Cover photo */}
			<div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-purple-500/10 border border-(--border)">
				{profileData.cover_photo && (
					<img src={profileData.cover_photo} alt="Cover" className="w-full h-full object-cover" />
				)}
			</div>

			{/* Hero card */}
			<div className="border border-(--border) rounded-xl p-5 sm:p-6 bg-(--surface) -mt-10 pt-0">
				<div className="flex flex-col sm:flex-row sm:items-end gap-4 -translate-y-10 mb-0">
					{/* Avatar */}
					<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-(--surface) bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
						{profileData.avatar ? (
							<img src={profileData.avatar} alt={profileData.user_name} className="w-full h-full object-cover" />
						) : (
							<span className="text-2xl sm:text-3xl font-bold text-(--secondary)">
								{profileData.user_name.charAt(0).toUpperCase()}
							</span>
						)}
					</div>

					<div className="flex-1 sm:pb-2">
						<div className="flex flex-col gap-3">
							<div>
								<div className="flex items-center gap-2 flex-wrap">
									<h2 className="text-xl sm:text-2xl font-bold text-(--primary)">{profileData.user_name}</h2>
									{profileData.verified && (
										<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
											<svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" />
											</svg>
											Verified
										</span>
									)}
									{!profileData.verified && profileData.status === 'approved' && (
										<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 border border-blue-500/30">
											Approved
										</span>
									)}
									{profileData.status === 'pending' && (
										<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
											Pending Review
										</span>
									)}
								</div>
								{profileData.occupation && (
									<p className="text-sm text-(--secondary) mt-0.5">{profileData.occupation}</p>
								)}
								<p className="text-xs text-(--secondary) mt-0.5">{profileData.user_email}</p>
							</div>
						</div>
						<div className="flex justify-center sm:justify-center">
							<button
								onClick={onEditClick}
								className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white bg-white text-slate-900 text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
								</svg>
								Edit Profile
							</button>
						</div>
					</div>
				</div>

				{/* Expertise */}
				{expertiseList.length > 0 && (
					<div className="flex flex-wrap gap-2 -mt-6">
						{expertiseList.map((tag, i) => (
							<ExpertiseTag key={i} label={tag} />
						))}
					</div>
				)}
			</div>

			{/* Stats row */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{[
					{ label: 'Pricing Plans', value: String(pricingPlans.length) },
					{ label: 'Achievements', value: String(achievements.length) },
					{ label: 'Highlights', value: String(highlights.length) },
					{ label: 'Availability Slots', value: String(slots.length) },
				].map(({ label, value }) => (
					<div key={label} className="border border-(--border) rounded-xl px-4 py-3 bg-(--surface)">
						<p className="text-xs text-(--secondary) mb-1">{label}</p>
						<p className="text-xl font-bold text-(--primary)">{value}</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				<div className="lg:col-span-2 space-y-5">
					{/* Achievements */}
					{achievements.length > 0 && (
						<SectionBlock
							title="Achievements"
							icon={
								<svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
								</svg>
							}
						>
							<ul className="space-y-3">
								{achievements.map((a, i) => (
									<li key={i} className="flex items-start gap-3">
										<div className="w-5 h-5 mt-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
											<svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
												<path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
											</svg>
										</div>
										<div className="text-sm text-(--secondary) flex-1">
											<RichTextDisplay html={a} />
										</div>
									</li>
								))}
							</ul>
						</SectionBlock>
					)}

					{/* Highlights / packages */}
					{highlights.length > 0 && (
						<SectionBlock
							title="Highlights"
							icon={
								<svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
								</svg>
							}
						>
							<ul className="space-y-3">
								{highlights.map((h, i) => (
									<li key={i} className="flex items-start gap-3">
										<div className="w-5 h-5 mt-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
											<svg className="w-2.5 h-2.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
										</div>
										<div className="text-sm text-(--secondary) flex-1">
											<RichTextDisplay html={h} />
										</div>
									</li>
								))}
							</ul>
						</SectionBlock>
					)}

					{/* Availability */}
					{Object.keys(slotsByDay).length > 0 && (
						<SectionBlock
							title="Availability"
							icon={
								<svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							}
						>
							<div className="space-y-3">
								{Object.entries(slotsByDay).map(([day, daySlots]) => (
									<div key={day} className="flex items-start gap-3">
										<span className="text-xs font-semibold text-(--primary) w-24 shrink-0 pt-0.5">{day}</span>
										<div className="flex flex-wrap gap-1.5">
											{daySlots.map((slot, i) => (
												<span key={i} className="text-xs px-2.5 py-1 rounded-full bg-(--surface-hover) text-(--secondary) border border-(--border)">
													{formatTime(slot.startTime)} – {formatTime(slot.endTime)}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</SectionBlock>
					)}

					{/* Documents */}
					{documents.length > 0 && (
						<SectionBlock
							title="Documents"
							icon={
								<svg className="w-4 h-4 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							}
						>
							<ul className="space-y-2">
								{documents.map((doc, i) => (
									<li key={i} className="flex items-center gap-3 text-sm">
										<svg className="w-4 h-4 text-(--secondary) shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
										</svg>
										<a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-(--primary) hover:text-accent transition-colors truncate">
											{doc.name}
										</a>
									</li>
								))}
							</ul>
						</SectionBlock>
					)}
				</div>

				{/* Sidebar: Pricing Plans */}
				<div className="space-y-4">
					{pricingPlans.length > 0 ? (
						pricingPlans.map((plan, idx) => (
							<div key={idx} className="border border-(--border) rounded-xl p-5 bg-(--surface)">
								<div className="flex items-start justify-between mb-1">
									<h3 className="text-sm font-semibold text-(--primary)">{plan.sessionType || 'Session'}</h3>
									{plan.duration && (
										<span className="text-xs text-(--secondary) shrink-0 ml-2">{plan.duration}</span>
									)}
								</div>
								<p className="text-2xl font-bold text-(--primary) mb-4">
									{!plan.price || plan.price === '0' ? 'Free' : `₹${Number(plan.price).toLocaleString('en-IN')}`}
								</p>
								{plan.perks.filter(Boolean).length > 0 && (
									<ul className="space-y-2">
										{plan.perks.filter(Boolean).map((perk, j) => (
											<li key={j} className="flex items-center gap-2 text-sm text-(--secondary)">
												<svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
												</svg>
												{perk}
											</li>
										))}
									</ul>
								)}
							</div>
						))
					) : (
						<div className="border border-dashed border-(--border) rounded-xl p-5 text-center">
							<p className="text-sm text-(--secondary)">No pricing plans set</p>
						</div>
					)}

					{achievements.length === 0 && highlights.length === 0 && slots.length === 0 && (
						<div className="border border-dashed border-(--border) rounded-xl p-5 text-center">
							<p className="text-sm text-(--secondary) mb-3">Your profile is incomplete</p>
							<button
								onClick={onEditClick}
								className="text-sm font-medium text-accent hover:opacity-80 transition-opacity"
							>
								Complete your profile →
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
