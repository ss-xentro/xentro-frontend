'use client';

import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

function isEmailValid(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function hasPartialProfile(entry: { name?: string; email?: string; title?: string; avatar?: string | null; bio?: string }) {
	return Boolean(entry.name?.trim() || entry.email?.trim() || entry.title?.trim() || entry.avatar || entry.bio?.trim());
}

export function FoundersSection() {
	const { data, addFounder, updateFounder, removeFounder, addTeamMember, updateTeamMember, removeTeamMember } = useStartupOnboardingStore();

	const founderCount = data.founders.length;
	const teamCount = data.teamMembers.length;
	const totalProfiles = founderCount + teamCount;

	const hasPrimaryFounder = Boolean(data.founders[0]?.name.trim());

	const invalidEmailCount = [
		...data.founders.map(member => member.email),
		...data.teamMembers.map(member => member.email),
	].filter(email => email.trim() && !isEmailValid(email)).length;

	const incompleteCount = [
		...data.founders,
		...data.teamMembers,
	].filter(member => hasPartialProfile(member) && !member.name?.trim()).length;

	return (
		<div className="animate-fadeIn grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 xl:gap-8">
			<div className="space-y-7">
				<section className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-4 md:p-5">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Part A</p>
							<h3 className="text-lg font-semibold text-(--primary)">Founder Profiles</h3>
							<p className="text-sm text-(--secondary) mt-1">Add your lead founder first. Co-founders are optional.</p>
						</div>
						<span className="rounded-full border border-(--border) bg-(--surface-secondary) px-3 py-1 text-xs font-medium text-(--secondary)">
							{founderCount} founder{founderCount === 1 ? '' : 's'}
						</span>
					</div>

					{data.founders.map((founder, index) => (
						<div
							key={index}
							className="rounded-2xl border border-(--border) bg-(--surface) p-4 md:p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
						>
							<div className="flex items-center justify-between gap-3 mb-4">
								<div>
									<h4 className="text-sm font-semibold text-(--primary)">{index === 0 ? 'Primary Founder' : `Co-Founder ${index}`}</h4>
									<p className="text-xs text-(--secondary) mt-1">{index === 0 ? 'Required to continue onboarding' : 'Optional public teammate profile'}</p>
								</div>

								{data.founders.length > 1 && (
									<button
										type="button"
										onClick={() => removeFounder(index)}
										className="inline-flex items-center gap-1.5 rounded-md border border-(--border) bg-(--surface) px-2.5 py-1.5 text-xs font-medium text-(--secondary) transition-colors hover:border-error/30 hover:text-error"
										title="Remove founder card"
									>
										<AppIcon name="x" className="h-3.5 w-3.5" />
										Remove
									</button>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
								<Input
									label="Full Name"
									placeholder="Jane Doe"
									value={founder.name}
									onChange={(e) => updateFounder(index, { name: e.target.value })}
									required
								/>

								<Input
									label="Email Address (Optional display)"
									placeholder="jane@example.com"
									type="email"
									hint="Shown publicly if provided"
									value={founder.email}
									onChange={(e) => updateFounder(index, { email: e.target.value })}
								/>

								<Input
									label="Title (Optional)"
									placeholder={index === 0 ? 'Founder' : 'Co-Founder'}
									value={founder.title || ''}
									onChange={(e) => updateFounder(index, { title: e.target.value })}
								/>

								<div>
									<label className="block text-sm font-medium text-(--primary) mb-2">Photo (Optional)</label>
									<FileUpload
										value={founder.avatar || ''}
										onChange={(url) => updateFounder(index, { avatar: url })}
										folder="startup-team"
										accept="image/*"
										enableCrop
										aspectRatio={1}
									/>
									<p className="mt-1.5 text-xs text-(--secondary)">Square headshot recommended</p>
								</div>
							</div>

							<div className="mt-4">
								<label className="block text-sm font-medium text-(--primary) mb-2">Profile Details (Optional)</label>
								<RichTextEditor
									value={founder.bio || ''}
									onChange={(html) => updateFounder(index, { bio: html })}
									placeholder="Share background, achievements, and what this founder leads..."
									minimal
								/>
							</div>
						</div>
					))}

					<Button
						type="button"
						variant="secondary"
						onClick={addFounder}
						className="w-full border-dashed border-slate-300 bg-slate-100 text-white hover:bg-slate-200 hover:border-slate-400"
					>
						<AppIcon name="plus" className="h-4 w-4 mr-1.5" />
						Add Co-Founder
					</Button>
				</section>

				<section className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-4 md:p-5">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Part B</p>
							<h3 className="text-lg font-semibold text-(--primary)">Team Members</h3>
							<p className="text-sm text-(--secondary) mt-1">Optional. Add people you want to showcase publicly.</p>
						</div>
						<span className="rounded-full border border-(--border) bg-(--surface-secondary) px-3 py-1 text-xs font-medium text-(--secondary)">
							{teamCount} member{teamCount === 1 ? '' : 's'}
						</span>
					</div>

					{teamCount === 0 && (
						<div className="rounded-2xl border border-dashed border-(--secondary-light) bg-(--surface-secondary) px-4 py-5 text-sm text-(--secondary)">
							<div className="flex items-start gap-3">
								<div className="h-8 w-8 rounded-lg bg-(--surface) border border-(--border) flex items-center justify-center">
									<AppIcon name="users" className="h-4 w-4 text-(--secondary)" />
								</div>
								<div>
									<p className="font-medium text-(--primary)">No team members added yet</p>
									<p className="mt-1">You can continue onboarding now, or add key team profiles for your public startup page.</p>
								</div>
							</div>
						</div>
					)}

					{data.teamMembers.map((member, index) => (
						<div
							key={`team-${index}`}
							className="p-4 md:p-5 bg-(--surface) border border-(--border) rounded-2xl transition-all shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-(--secondary-light)"
						>
							<div className="flex items-center justify-between gap-3 mb-4">
								<div>
									<h4 className="text-sm font-semibold text-(--primary)">Team Member {index + 1}</h4>
									<p className="text-xs text-(--secondary) mt-1">Optional public teammate profile</p>
								</div>

								<button
									type="button"
									onClick={() => removeTeamMember(index)}
									className="inline-flex items-center gap-1.5 rounded-md border border-(--border) bg-(--surface) px-2.5 py-1.5 text-xs font-medium text-(--secondary) transition-colors hover:border-error/30 hover:text-error"
									title="Remove team member"
								>
									<AppIcon name="x" className="h-3.5 w-3.5" />
									Remove
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input
									label="Full Name"
									placeholder="Alex Doe"
									value={member.name}
									onChange={(e) => updateTeamMember(index, { name: e.target.value })}
									required
								/>

								<Input
									label="Email Address (Optional display)"
									placeholder="alex@example.com"
									type="email"
									hint="Shown publicly if provided"
									value={member.email}
									onChange={(e) => updateTeamMember(index, { email: e.target.value })}
								/>

								<Input
									label="Title (Optional)"
									placeholder="Product Designer"
									value={member.title || ''}
									onChange={(e) => updateTeamMember(index, { title: e.target.value })}
								/>

								<div>
									<label className="block text-sm font-medium text-(--primary) mb-2">Photo (Optional)</label>
									<FileUpload
										value={member.avatar || ''}
										onChange={(url) => updateTeamMember(index, { avatar: url })}
										folder="startup-team"
										accept="image/*"
										enableCrop
										aspectRatio={1}
									/>
									<p className="mt-1.5 text-xs text-(--secondary)">Square headshot recommended</p>
								</div>
							</div>

							<div className="mt-4">
								<label className="block text-sm font-medium text-(--primary) mb-2">Profile Details (Optional)</label>
								<RichTextEditor
									value={member.bio || ''}
									onChange={(html) => updateTeamMember(index, { bio: html })}
									placeholder="Add this member's role, skills, and short story for public profile viewers..."
									minimal
								/>
							</div>
						</div>
					))}

					<Button
						type="button"
						variant="secondary"
						onClick={addTeamMember}
						className="w-full border-dashed border-slate-300 bg-slate-100 text-white hover:bg-slate-200 hover:border-slate-400"
					>
						<AppIcon name="plus" className="h-4 w-4 mr-1.5" />
						Add Team Member
					</Button>
				</section>
			</div>

			<aside className="space-y-4 xl:sticky xl:top-24 self-start">
				<div className="rounded-2xl border border-(--border) bg-slate-50 p-4 md:p-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Part C</p>
							<h3 className="text-base font-semibold text-(--primary)">Team setup status</h3>
							<p className="text-sm text-(--secondary) mt-1">Check this panel before continuing to the next step.</p>
						</div>
						<div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
							<AppIcon name="users" className="h-4 w-4 text-accent" />
							<span className="text-xs font-medium text-(--primary)">{totalProfiles} profile{totalProfiles === 1 ? '' : 's'} added</span>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-2 mt-4">
						<div
							className={cn(
								'rounded-xl border px-3 py-2 text-xs',
								hasPrimaryFounder ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800' : 'border-amber-200 bg-amber-50/90 text-amber-800'
							)}
						>
							<p className="font-semibold uppercase tracking-wide">Primary founder</p>
							<p className="mt-1">{hasPrimaryFounder ? 'Ready to proceed' : 'Founder name required'}</p>
						</div>
						<div
							className={cn(
								'rounded-xl border px-3 py-2 text-xs',
								incompleteCount === 0 ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800' : 'border-amber-200 bg-amber-50/90 text-amber-800'
							)}
						>
							<p className="font-semibold uppercase tracking-wide">Profile completion</p>
							<p className="mt-1">{incompleteCount === 0 ? 'No partial profiles' : `${incompleteCount} profile${incompleteCount > 1 ? 's' : ''} need a name`}</p>
						</div>
						<div
							className={cn(
								'rounded-xl border px-3 py-2 text-xs',
								invalidEmailCount === 0 ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800' : 'border-rose-200 bg-rose-50/90 text-rose-800'
							)}
						>
							<p className="font-semibold uppercase tracking-wide">Email format</p>
							<p className="mt-1">{invalidEmailCount === 0 ? 'No invalid emails' : `${invalidEmailCount} email${invalidEmailCount > 1 ? 's' : ''} need fixing`}</p>
						</div>
					</div>
				</div>

				<div className="bg-(--surface) border border-(--border) rounded-xl p-4">
					<h4 className="text-sm font-medium text-accent mb-1">Primary Contact</h4>
					<p className="text-sm text-(--secondary)">
						We will use <strong>{data.primaryContactEmail || 'your verified signup email'}</strong> for application and communication only.
					</p>
				</div>

				<div className="rounded-xl border border-(--border) bg-(--surface) p-4">
					<h4 className="text-sm font-semibold text-(--primary)">Quick Tip</h4>
					<p className="text-sm text-(--secondary) mt-1.5">
						Profiles with clear titles and short bios tend to get more inbound mentor and investor interest.
					</p>
				</div>
			</aside>
		</div>
	);
}
