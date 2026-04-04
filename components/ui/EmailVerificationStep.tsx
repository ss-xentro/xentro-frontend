'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface UseEmailVerificationOptions {
	email: string;
	name?: string;
	purpose?: string;
	/** Called when verification succeeds. Receives the response data. */
	onVerified?: (data: Record<string, unknown>) => void;
}

/**
 * Hook to manage magic-link email verification flow.
 * Replaces duplicated magic-link logic in investor-onboarding, mentor-signup,
 * institution-onboarding, and startup onboarding.
 */
export function useEmailVerification({ email, name, purpose = 'signup', onVerified }: UseEmailVerificationOptions) {
	const [loading, setLoading] = useState(false);
	const [magicLinkSent, setMagicLinkSent] = useState(false);
	const [verified, setVerified] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const onVerifiedRef = useRef(onVerified);
	onVerifiedRef.current = onVerified;

	const sendMagicLink = useCallback(async () => {
		setLoading(true);
		setFeedback(null);
		try {
			const res = await fetch('/api/auth/magic-link/send/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, purpose }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || data.message || 'Failed to send verification link');
			setMagicLinkSent(true);
			setFeedback({ type: 'success', message: `Verification link sent to ${email}` });
		} catch (err) {
			setFeedback({ type: 'error', message: (err as Error).message });
		} finally {
			setLoading(false);
		}
	}, [email, name, purpose]);

	const checkVerification = useCallback(async () => {
		setLoading(true);
		setFeedback(null);
		try {
			const res = await fetch('/api/auth/magic-link/status/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Verification check failed');

			if (data.verified) {
				setVerified(true);
				setFeedback({ type: 'success', message: 'Email verified!' });
				onVerifiedRef.current?.(data);
			} else {
				setFeedback({ type: 'error', message: 'Not verified yet. Check your email and click the link.' });
			}
		} catch (err) {
			setFeedback({ type: 'error', message: (err as Error).message });
		} finally {
			setLoading(false);
		}
	}, [email]);

	/** Reset state when email changes */
	const reset = useCallback(() => {
		setMagicLinkSent(false);
		setVerified(false);
		setFeedback(null);
	}, []);

	return { loading, magicLinkSent, verified, feedback, sendMagicLink, checkVerification, reset, setVerified, setFeedback };
}


interface EmailVerificationStepProps {
	email: string;
	verified: boolean;
	magicLinkSent: boolean;
	loading: boolean;
	onSendMagicLink: () => void;
	onCheckVerification: () => void;
	/** Optional countdown number displayed after verification */
	countdown?: number | null;
}

/**
 * Reusable email verification step UI.
 * Shows different states: send link, check inbox, or verified.
 * Replaces identical Step 5 UI in mentor-signup, investor-onboarding, etc.
 */
export function EmailVerificationStep({
	email,
	verified,
	magicLinkSent,
	loading,
	onSendMagicLink,
	onCheckVerification,
	countdown,
}: EmailVerificationStepProps) {
	return (
		<div className="space-y-5">
			<div className="text-center">
				<div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
					{verified ? (
						<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					) : (
						<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					)}
				</div>

				{verified ? (
					<>
						<h3 className="text-lg font-semibold text-green-700 mb-1">Email verified!</h3>
						{countdown !== undefined && countdown !== null && (
							<p className="text-sm text-(--secondary)">
								Redirecting to login in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}…
							</p>
						)}
					</>
				) : magicLinkSent ? (
					<>
						<h3 className="text-lg font-semibold text-(--primary) mb-1">Check your inbox</h3>
						<p className="text-sm text-(--secondary)">
							We sent a verification link to <strong>{email}</strong>.<br />
							Click the link, then come back here.
						</p>
					</>
				) : (
					<>
						<h3 className="text-lg font-semibold text-(--primary) mb-1">Verify your email</h3>
						<p className="text-sm text-(--secondary)">
							We&apos;ll send a verification link to <strong>{email || 'your email'}</strong>.
						</p>
					</>
				)}
			</div>

			{verified ? (
				<div className="flex flex-col items-center gap-3 py-2">
					<div className="flex items-center gap-2 text-green-600 font-medium">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Verified
					</div>
					{countdown !== undefined && countdown !== null && (
						<div className="w-full bg-(--border) rounded-full h-1.5 overflow-hidden">
							<div
								className="bg-green-500 h-full rounded-full transition-all duration-1000"
								style={{ width: `${((countdown) / 5) * 100}%` }}
							/>
						</div>
					)}
				</div>
			) : !magicLinkSent ? (
				<Button onClick={onSendMagicLink} disabled={loading || !email.trim()} isLoading={loading} className="w-full">
					{loading ? 'Sending email...' : 'Verify Email'}
				</Button>
			) : (
				<div className="space-y-3">
					<Button onClick={onCheckVerification} disabled={loading} isLoading={loading} className="w-full">
						{loading ? 'Checking…' : "I've clicked the link"}
					</Button>
					<button
						type="button"
						onClick={onSendMagicLink}
						disabled={loading}
						className="w-full text-sm text-accent hover:underline disabled:opacity-50"
					>
						Resend link
					</button>
				</div>
			)}
		</div>
	);
}
