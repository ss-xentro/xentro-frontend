'use client';

import { useEmailCheck } from '@/lib/useEmailCheck';
import { Spinner } from '@/components/ui/Spinner';

export function FounderEmailCheck({ email }: { email: string }) {
	const { checking, result } = useEmailCheck(email, 'create_user');

	if (!email || !email.includes('@')) return null;

	return (
		<div className="mt-1">
			{checking && (
				<p className="text-xs text-gray-400 flex items-center gap-1">
					<Spinner size="sm" className="h-3 w-3" />
					Checking email...
				</p>
			)}
			{!checking && result && result.canProceed && (
				<p className="text-xs text-green-600 flex items-center gap-1">
					<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					Email is available
				</p>
			)}
			{!checking && result && !result.canProceed && (
				<p className="text-xs text-red-600 flex items-center gap-1">
					<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
					{result.message}
				</p>
			)}
		</div>
	);
}
