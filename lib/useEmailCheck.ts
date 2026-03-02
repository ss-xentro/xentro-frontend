import { useState, useEffect } from 'react';
import { getSessionToken } from '@/lib/auth-utils';

interface EmailCheckResult {
	exists: boolean;
	canProceed: boolean;
	accountType?: string;
	message?: string;
}

/**
 * Hook to check email uniqueness in real-time.
 * Debounces the check to avoid excessive API calls.
 *
 * @param email - The email to check
 * @param purpose - "signup" | "create_user" (create_user enforces strict uniqueness)
 * @param debounceMs - Debounce delay in ms (default 500)
 */
export function useEmailCheck(email: string, purpose: 'signup' | 'create_user' = 'create_user', debounceMs = 500) {
	const [checking, setChecking] = useState(false);
	const [result, setResult] = useState<EmailCheckResult | null>(null);

	useEffect(() => {
		// Reset if email is empty or not a valid-looking email
		if (!email || !email.includes('@') || email.length < 5) {
			setResult(null);
			setChecking(false);
			return;
		}

		setChecking(true);
		const timer = setTimeout(async () => {
			try {
				const token = getSessionToken('institution') || getSessionToken('mentor') || getSessionToken('startup');
				const headers: Record<string, string> = { 'Content-Type': 'application/json' };
				if (token) {
					headers['Authorization'] = `Bearer ${token}`;
				}

				const res = await fetch('/api/auth/check-email/', {
					method: 'POST',
					headers,
					body: JSON.stringify({ email: email.trim().toLowerCase(), purpose }),
				});

				if (res.ok) {
					const data: EmailCheckResult = await res.json();
					setResult(data);
				} else {
					setResult(null);
				}
			} catch {
				setResult(null);
			} finally {
				setChecking(false);
			}
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [email, purpose, debounceMs]);

	return { checking, result };
}
