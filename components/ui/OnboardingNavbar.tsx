'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingNavbarProps {
	exitHref?: string;
	exitLabel?: string;
	showLogout?: boolean;
	showAction?: boolean;
}

/**
 * Minimal navbar used across onboarding/signup flows.
 * Shows the Xentro logo and an "Exit" link.
 * Replaces identical navbars in investor-onboarding, mentor-signup, institution-onboarding, and startup onboarding.
 */

export function OnboardingNavbar({ exitHref = '/join', exitLabel = 'Exit', showLogout = false, showAction = true }: OnboardingNavbarProps) {
	const router = useRouter();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.push('/login');
	};

	return (
		<nav className="h-16 border-b border-(--border) bg-(--surface) backdrop-blur-md sticky top-0 z-50">
			<div className="container mx-auto px-4 h-full flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
					<span className="text-lg font-bold text-(--primary)">Xentro</span>
				</Link>
				{showAction ? (showLogout ? (
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
						</svg>
						Logout
					</button>
				) : (
					<Link
						href={exitHref}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
						{exitLabel}
					</Link>
				)) : <div className="w-[88px]" aria-hidden="true" />}
			</div>
		</nav>
	);
}
