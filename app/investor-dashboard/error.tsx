'use client';

import { useEffect } from 'react';

export default function InvestorDashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Investor dashboard error:', error);
	}, [error]);

	return (
		<div className="flex items-center justify-center min-h-[60vh] px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="text-5xl">📈</div>
				<h2 className="text-xl font-bold text-(--primary)">Dashboard Error</h2>
				<p className="text-(--secondary) text-sm">
					{error.message || 'Something went wrong loading the investor dashboard.'}
				</p>
				<div className="flex gap-3 justify-center">
					<button
						onClick={reset}
						className="px-5 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
					>
						Try Again
					</button>
					<button
						onClick={() => (window.location.href = '/')}
						className="px-5 py-2 bg-(--surface) text-(--primary) rounded-xl text-sm font-medium border border-(--border) hover:bg-(--surface-hover) transition-colors"
					>
						Go Home
					</button>
				</div>
			</div>
		</div>
	);
}
