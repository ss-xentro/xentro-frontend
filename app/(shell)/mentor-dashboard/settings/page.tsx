'use client';

import AccountSettings from '@/components/ui/AccountSettings';
import { Card } from '@/components/ui';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface MentorProfileState {
	verified: boolean;
	profile_completed: boolean;
}

export default function MentorSettingsPage() {
	const { data: profile, isLoading: loadingProfile } = useApiQuery<MentorProfileState>(
		queryKeys.mentor.profile(),
		'/api/auth/mentor-profile/',
		{ requestOptions: { role: 'mentor' } },
	);

	return (
		<div className="space-y-6">
			<AccountSettings contactOnly showProfileSection={false} />

			<Card className="p-6 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-lg font-semibold text-(--primary)">Profile Status</h2>
						<p className="text-sm text-(--secondary) mt-1">
							Your profile goes live automatically once all sections are complete — no approval needed.
						</p>
					</div>
					{!loadingProfile && (
						profile?.verified ? (
							<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
								Verified
							</span>
						) : profile?.profile_completed ? (
							<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 border border-blue-500/30">
								Active
							</span>
						) : (
							<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-(--surface-hover) text-(--secondary) border border-(--border)">
								Incomplete
							</span>
						)
					)}
				</div>

				{!loadingProfile && !profile?.profile_completed && (
					<p className="text-sm text-amber-600">
						Head to your <a href="/mentor-dashboard/profile" className="underline font-medium">profile page</a> to fill in the missing sections and go live.
					</p>
				)}
			</Card>
		</div>
	);
}
