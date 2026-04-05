'use client';

import { useEffect, useState } from 'react';
import AccountSettings from '@/components/ui/AccountSettings';
import { Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { toast } from 'sonner';

interface MentorProfileState {
	verified: boolean;
	profile_completed: boolean;
}

export default function MentorSettingsPage() {
	const [profile, setProfile] = useState<MentorProfileState | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const token = getSessionToken('mentor') || getSessionToken();
				if (!token) return;
				const res = await fetch('/api/auth/mentor-profile/', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error();
				const data = await res.json();
				setProfile({
					verified: Boolean(data.verified),
					profile_completed: Boolean(data.profile_completed),
				});
			} catch {
				toast.error('Could not load profile status.');
			} finally {
				setLoadingProfile(false);
			}
		};
		load();
	}, []);

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
