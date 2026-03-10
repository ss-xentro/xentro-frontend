'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-utils';
import { getStartupCompletionStep } from '@/lib/startup-onboarding';

const ALLOWED_PATHS = new Set(['/onboarding/startup']);

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

				if (!res.ok) {
					router.replace('/onboarding/startup');
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
				}
			} catch {
				router.replace('/onboarding/startup');
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

	if (isChecking && !ALLOWED_PATHS.has(pathname)) {
		return (
			<div className="min-h-screen bg-(--background) flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
			</div>
		);
	}

	return <>{children}</>;
}
