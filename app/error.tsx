'use client';

import { useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';

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
				<AppIcon name="alert-triangle" className="w-14 h-14 text-amber-500 mx-auto" />
				<h1 className="text-2xl font-bold text-(--primary)">Something went wrong</h1>
				<p className="text-(--secondary) text-sm">
					{error.message || 'An unexpected error occurred. Please try again.'}
				</p>
				<div className="flex gap-3 justify-center">
					<Button
						onClick={reset}
						variant="primary"
					>
						Try Again
					</Button>
					<Button
						onClick={() => (window.location.href = '/')}
						variant="secondary"
					>
						Go Home
					</Button>
				</div>
			</div>
		</div>
	);
}
