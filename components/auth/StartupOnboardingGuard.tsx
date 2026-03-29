'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken, syncAuthCookie, getAuthCookie } from '@/lib/auth-utils';
import { getStartupCompletionStep } from '@/lib/startup-onboarding';

const CANONICAL_ONBOARDING_PATH = '/startup/onboarding';
const ALLOWED_PATHS = new Set([CANONICAL_ONBOARDING_PATH, '/onboarding/startup']);
const CACHE_KEY = 'xentro_onboarding_ok';

export default function StartupOnboardingGuard({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (isLoading) return;

		const role = user?.role;
		const isStartupUser = role === 'startup' || role === 'founder';

		if (!isAuthenticated || !isStartupUser || ALLOWED_PATHS.has(pathname)) {
			return;
		}

		// If we already verified onboarding this session, skip the API call
		if (sessionStorage.getItem(CACHE_KEY) === 'true') {
			return;
		}

		const token = getSessionToken('founder');
		if (!token) {
			return;
		}

		const enforceOnboarding = async () => {
			try {
				const res = await fetch('/api/founder/my-startup', {
					headers: { Authorization: `Bearer ${token}` },
				});

				// Only redirect on a definitive "no startup" 404 — not on 403/500/network errors
				if (!res.ok) {
					if (res.status === 404) {
						router.replace(CANONICAL_ONBOARDING_PATH);
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
					router.replace(CANONICAL_ONBOARDING_PATH);
				} else {
					// Update cookie so middleware stops redirecting to onboarding
					syncAuthCookie({ ...(getAuthCookie() ?? {}), startupOnboarded: true });
					// Cache success so we don't re-check on every navigation
					sessionStorage.setItem(CACHE_KEY, 'true');
				}
			} catch {
				// Network errors — don't redirect, just let the user through
			}
		};

		enforceOnboarding();
	}, [isAuthenticated, isLoading, pathname, router, user?.role]);

	return <>{children}</>;
}
