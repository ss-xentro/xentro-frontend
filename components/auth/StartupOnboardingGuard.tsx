'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-utils';
import { getStartupCompletionStep } from '@/lib/startup-onboarding';

const ALLOWED_PATHS = new Set(['/onboarding/startup']);
const CACHE_KEY = 'xentro_onboarding_ok';

export default function StartupOnboardingGuard({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [isChecking, setIsChecking] = useState(false);

	useEffect(() => {
		if (isLoading) return;

		const role = user?.role;
		const isStartupUser = role === 'startup' || role === 'founder';

		if (!isAuthenticated || !isStartupUser || ALLOWED_PATHS.has(pathname)) {
			setIsChecking(false);
			return;
		}

		// If we already verified onboarding this session, skip the API call
		if (sessionStorage.getItem(CACHE_KEY) === 'true') {
			setIsChecking(false);
			return;
		}

		const token = getSessionToken('founder');
		if (!token) {
			setIsChecking(false);
			return;
		}

		let cancelled = false;
		setIsChecking(true);

		const enforceOnboarding = async () => {
			try {
				const res = await fetch('/api/founder/my-startup', {
					headers: { Authorization: `Bearer ${token}` },
				});

				// Only redirect on a definitive "no startup" 404 — not on 403/500/network errors
				if (!res.ok) {
					if (res.status === 404) {
						router.replace('/onboarding/startup');
					}
					// For 403, 500, etc. — don't redirect, give user benefit of the doubt
					return;
				}

				const payload = await res.json();
				const startup = payload.data?.startup;
				const whyXentro = payload.data?.whyXentro ?? [];
				const nextStep = getStartupCompletionStep({
					name: startup?.name,
					tagline: startup?.tagline,
					logo: startup?.logo,
					founders: startup?.founders,
					sectors: startup?.sectors,
					stage: startup?.stage,
					whyXentro,
				});

				if (nextStep <= 4) {
					router.replace('/onboarding/startup');
				} else {
					// Cache success so we don't re-check on every navigation
					sessionStorage.setItem(CACHE_KEY, 'true');
				}
			} catch {
				// Network errors — don't redirect, just let the user through
			} finally {
				if (!cancelled) {
					setIsChecking(false);
				}
			}
		};

		enforceOnboarding();

		return () => {
			cancelled = true;
		};
	}, [isAuthenticated, isLoading, pathname, router, user?.role]);

	return <>{children}</>;
}
