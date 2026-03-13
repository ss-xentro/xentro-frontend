'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-utils';
import { isMentorOnboardingComplete } from '@/lib/mentor-onboarding';

const CANONICAL_ONBOARDING_PATH = '/mentor/onboarding';
const ALLOWED_PATHS = new Set([CANONICAL_ONBOARDING_PATH]);
const CACHE_KEY = 'xentro_mentor_onboarding_ok';

export default function MentorOnboardingGuard({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (isLoading) return;

		const role = user?.role;
		if (!isAuthenticated || role !== 'mentor' || ALLOWED_PATHS.has(pathname)) {
			return;
		}

		if (sessionStorage.getItem(CACHE_KEY) === 'true') {
			return;
		}

		const token = getSessionToken('mentor');
		if (!token) {
			return;
		}

		const enforceMentorOnboarding = async () => {
			try {
				const res = await fetch('/api/auth/mentor-profile/', {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!res.ok) {
					if (res.status === 404) {
						router.replace(CANONICAL_ONBOARDING_PATH);
					}
					return;
				}

				const profile = await res.json();
				if (!isMentorOnboardingComplete(profile)) {
					router.replace(CANONICAL_ONBOARDING_PATH);
					return;
				}

				sessionStorage.setItem(CACHE_KEY, 'true');
			} catch {
				// Avoid redirecting on transient failures.
			}
		};

		enforceMentorOnboarding();
	}, [isAuthenticated, isLoading, pathname, router, user?.role]);

	return <>{children}</>;
}
