'use client';

import { useEffect, useState } from 'react';
import AccountSettings from '@/components/ui/AccountSettings';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface MentorVerificationState {
	status: string;
	verified: boolean;
	profile_completed: boolean;
}

export default function MentorSettingsPage() {
	const [verification, setVerification] = useState<MentorVerificationState | null>(null);
	const [loadingVerification, setLoadingVerification] = useState(true);
	const [requesting, setRequesting] = useState(false);

	const loadVerificationState = async () => {
		try {
			setLoadingVerification(true);
			const token = getSessionToken('mentor') || getSessionToken();
			if (!token) {
				setVerification(null);
				return;
			}

			const res = await fetch(`${API}/api/auth/mentor-profile/`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) throw new Error('Failed to load verification status');
			const data = await res.json();
			setVerification({
				status: data.status,
				verified: Boolean(data.verified),
				profile_completed: Boolean(data.profile_completed),
			});
		} catch {
			toast.error('Could not load verification status.');
		} finally {
			setLoadingVerification(false);
		}
	};

	useEffect(() => {
		loadVerificationState();
	}, []);

	const handleRequestVerification = async () => {
		try {
			setRequesting(true);
			const token = getSessionToken('mentor') || getSessionToken();
			if (!token) throw new Error('Authentication required');

			const res = await fetch(`${API}/api/auth/mentor-profile/request-verification/`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});

			const payload = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(payload.error || payload.message || 'Failed to submit request');

			if (payload.data) {
				setVerification({
					status: payload.data.status,
					verified: Boolean(payload.data.verified),
					profile_completed: Boolean(payload.data.profile_completed),
				});
			}
			toast.success(payload.message || 'Verification request submitted.');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to submit request');
		} finally {
			setRequesting(false);
		}
	};

	const isVerified = Boolean(verification?.verified);
	const isPending = verification?.status === 'pending' && verification?.profile_completed;
	const canRequest = Boolean(verification?.profile_completed) && !isVerified && !isPending;

	return (
		<div className="space-y-6">
			<AccountSettings contactOnly showProfileSection={false} editProfileHref="/mentor-dashboard/profile" />

			<Card className="p-6 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-lg font-semibold text-(--primary)">Verification Badge</h2>
						<p className="text-sm text-(--secondary) mt-1">
							Request a verified badge once your mentor profile is complete.
						</p>
					</div>
					{isVerified ? (
						<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
							Verified
						</span>
					) : isPending ? (
						<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
							Pending Review
						</span>
					) : (
						<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-(--surface-hover) text-(--secondary) border border-(--border)">
							Not Requested
						</span>
					)}
				</div>

				{loadingVerification ? (
					<p className="text-sm text-(--secondary)">Loading verification status...</p>
				) : (
					<div className="space-y-3">
						{!verification?.profile_completed && (
							<p className="text-sm text-amber-600">
								Complete your mentor profile first, then request verification.
							</p>
						)}

						<div className="flex items-center justify-end">
							<Button onClick={handleRequestVerification} disabled={!canRequest || requesting}>
								{requesting ? 'Submitting...' : 'Request Verification Badge'}
							</Button>
						</div>
					</div>
				)}

			</Card>
		</div>
	);
}
