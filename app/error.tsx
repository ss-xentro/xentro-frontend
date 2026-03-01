'use client';

import { useEffect } from 'react';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Unhandled error:', error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="text-6xl">⚠️</div>
				<h1 className="text-2xl font-bold text-(--primary)">Something went wrong</h1>
				<p className="text-(--secondary) text-sm">
					{error.message || 'An unexpected error occurred. Please try again.'}
				</p>
				<div className="flex gap-3 justify-center">
					<button
						onClick={reset}
						className="px-6 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
					>
						Try Again
					</button>
					<button
						onClick={() => (window.location.href = '/')}
						className="px-6 py-2.5 bg-(--surface) text-(--primary) rounded-xl font-medium border border-(--border) hover:bg-(--surface-hover) transition-colors"
					>
						Go Home
					</button>
				</div>
			</div>
		</div>
	);
}
