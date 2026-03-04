'use client';

import Link from 'next/link';
import Image from 'next/image';

interface OnboardingNavbarProps {
	exitHref?: string;
	exitLabel?: string;
}

/**
 * Minimal navbar used across onboarding/signup flows.
 * Shows the Xentro logo and an "Exit" link.
 * Replaces identical navbars in investor-onboarding, mentor-signup, institution-onboarding, and startup onboarding.
 */
export function OnboardingNavbar({ exitHref = '/join', exitLabel = 'Exit' }: OnboardingNavbarProps) {
	return (
		<nav className="h-16 border-b border-(--border) bg-white/80 backdrop-blur-md sticky top-0 z-50">
			<div className="container mx-auto px-4 h-full flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
					<span className="text-lg font-bold text-(--primary)">Xentro</span>
				</Link>
				<Link
					href={exitHref}
					className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
					{exitLabel}
				</Link>
			</div>
		</nav>
	);
}
