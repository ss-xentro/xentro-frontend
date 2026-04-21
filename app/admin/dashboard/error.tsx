'use client';

import { useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';

export default function AdminDashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Admin dashboard error:', error);
	}, [error]);

	return (
		<div className="flex items-center justify-center min-h-[60vh] px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<AppIcon name="layout-dashboard" className="w-12 h-12 text-(--secondary) mx-auto" />
				<h1 className="text-xl font-bold text-(--primary)">Dashboard Error</h1>
				<p className="text-(--secondary) text-sm">
					{error.message || 'Something went wrong loading the admin dashboard.'}
				</p>
				<div className="flex gap-3 justify-center">
					<button
						onClick={reset}
						className="px-5 py-2 bg-accent text-(--background) rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
					>
						Try Again
					</button>
					<button
						onClick={() => (window.location.href = '/admin/dashboard')}
						className="px-5 py-2 bg-(--surface) text-(--primary) rounded-xl text-sm font-medium border border-(--border) hover:bg-(--surface-hover) transition-colors"
					>
						Admin Home
					</button>
				</div>
			</div>
		</div>
	);
}
