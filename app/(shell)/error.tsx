'use client';

import { useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';

export default function ShellError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Shell error:', error);
	}, [error]);

	return (
		<div className="flex items-center justify-center min-h-[60vh] px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<AppIcon name="alert-circle" className="w-12 h-12 text-(--secondary) mx-auto" />
				<h1 className="text-xl font-bold text-(--primary)">Something went wrong</h1>
				<p className="text-(--secondary) text-sm">
					{error.message || 'An unexpected error occurred. Please try again.'}
				</p>
				<div className="flex gap-3 justify-center">
					<button
						onClick={reset}
						className="px-5 py-2 bg-accent text-(--background) rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
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
