import { useState, useEffect, useCallback } from 'react';
import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { isValidEmail } from './constants';

export function useEmailVerification(isCompletionFlow: boolean) {
	const { data, updateData } = useStartupOnboardingStore();

	const [magicLinkSent, setMagicLinkSent] = useState(false);
	const [emailVerified, setEmailVerified] = useState(false);
	const [emailLoading, setEmailLoading] = useState(false);
	const [emailExists, setEmailExists] = useState<{ exists: boolean; message: string } | null>(null);
	const [emailChecking, setEmailChecking] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const resetVerificationState = useCallback(() => {
		setMagicLinkSent(false);
		setEmailVerified(false);
		setEmailExists(null);
		setEmailChecking(false);
		setFeedback(null);
	}, []);

	// Debounced email existence check
	useEffect(() => {
		if (isCompletionFlow) {
			setEmailExists(null);
			setEmailChecking(false);
			return;
		}

		const email = data.primaryContactEmail.trim().toLowerCase();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setEmailExists(null);
			setEmailChecking(false);
			return;
		}

		let isActive = true;
		let abortController: AbortController | null = null;

		setEmailChecking(true);
		const timeout = setTimeout(async () => {
			try {
				abortController = new AbortController();
				const res = await fetch('/api/auth/check-email/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					signal: abortController.signal,
					body: JSON.stringify({ email }),
				});
				const resData = await res.json();
				if (!isActive) return;
				if (resData.exists && !resData.canProceed) {
					setEmailExists({ exists: true, message: resData.message });
				} else {
					setEmailExists({ exists: false, message: '' });
				}
			} catch (error) {
				if ((error as Error).name === 'AbortError' || !isActive) return;
				setEmailExists(null);
			} finally {
				if (isActive) setEmailChecking(false);
			}
		}, 500);

		return () => {
			isActive = false;
			clearTimeout(timeout);
			abortController?.abort();
		};
	}, [data.primaryContactEmail, isCompletionFlow]);

	// Poll for magic link verification
	useEffect(() => {
		if (!magicLinkSent || emailVerified) return;

		const pollInterval = setInterval(async () => {
			try {
				const res = await fetch('/api/auth/magic-link/status/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: data.primaryContactEmail }),
				});
				const resData = await res.json();
				if (res.ok && resData.verified) {
					setEmailVerified(true);
					setFeedback({ type: 'success', message: 'Email verified!' });
					clearInterval(pollInterval);
				}
			} catch {
				// Silently retry on next interval
			}
		}, 3000);

		return () => clearInterval(pollInterval);
	}, [magicLinkSent, emailVerified, data.primaryContactEmail]);

	const handleSendMagicLink = async () => {
		const email = data.primaryContactEmail.trim().toLowerCase();
		if (!data.name.trim()) {
			setFeedback({ type: 'error', message: 'Please enter your startup name first.' });
			return;
		}
		if (!isValidEmail(email)) {
			setFeedback({ type: 'error', message: 'Please enter a valid company email address.' });
			return;
		}

		setEmailLoading(true);
		setFeedback(null);
		try {
			const res = await fetch('/api/auth/magic-link/send/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name: data.name.trim(), purpose: 'signup' }),
			});
			const resData = await res.json();
			if (!res.ok) throw new Error(resData.error || resData.message || 'Failed to send verification link');
			updateData({ primaryContactEmail: email });
			setMagicLinkSent(true);
			setFeedback({ type: 'success', message: `Verification link sent to ${email}` });
		} catch (err) {
			setFeedback({ type: 'error', message: (err as Error).message });
		} finally {
			setEmailLoading(false);
		}
	};

	const handleCheckVerification = async () => {
		const email = data.primaryContactEmail.trim().toLowerCase();
		if (!isValidEmail(email)) {
			setFeedback({ type: 'error', message: 'Please enter a valid company email address.' });
			return;
		}

		setEmailLoading(true);
		setFeedback(null);
		try {
			const res = await fetch('/api/auth/magic-link/status/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			const resData = await res.json();
			if (!res.ok) throw new Error(resData.message || 'Verification check failed');
			if (resData.verified) {
				updateData({ primaryContactEmail: email });
				setEmailVerified(true);
				setFeedback({ type: 'success', message: 'Email verified!' });
			} else {
				setFeedback({ type: 'error', message: 'Not verified yet. Check your email and click the link.' });
			}
		} catch (err) {
			setFeedback({ type: 'error', message: (err as Error).message });
		} finally {
			setEmailLoading(false);
		}
	};

	const handleEmailChange = (value: string) => {
		updateData({ primaryContactEmail: value });
		if (emailVerified || magicLinkSent) {
			setEmailVerified(false);
			setMagicLinkSent(false);
			setFeedback(null);
		}
		setEmailExists(null);
	};

	return {
		magicLinkSent,
		emailVerified,
		emailLoading,
		emailExists,
		emailChecking,
		feedback,
		setFeedback,
		resetVerificationState,
		handleSendMagicLink,
		handleCheckVerification,
		handleEmailChange,
	};
}
