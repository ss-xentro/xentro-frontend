'use client';

import { useRouter } from 'next/navigation';
import { Button, StatusBadge } from '@/components/ui';

type InstitutionStatus = 'draft' | 'published' | 'archived' | 'pending';

interface AdminActionBarProps {
	status: InstitutionStatus;
	updating: boolean;
	onApprove: () => void;
	onReject: () => void;
}

export function AdminActionBar({ status, updating, onApprove, onReject }: AdminActionBarProps) {
	const router = useRouter();

	return (
		<div className="bg-gray-900 text-white sticky top-0 z-50">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.push('/admin/dashboard/institutions')}
						className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to Dashboard
					</button>
					<span className="text-gray-500">|</span>
					<span className="text-sm text-gray-300">Admin Preview Mode</span>
				</div>
				<div className="flex items-center gap-3">
					<StatusBadge status={status} />
					{status !== 'published' && (
						<>
							<Button
								variant="ghost"
								size="sm"
								onClick={onReject}
								disabled={updating}
								className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
							>
								Reject
							</Button>
							<Button
								size="sm"
								onClick={onApprove}
								disabled={updating}
								className="bg-green-600 hover:bg-green-700"
							>
								{updating ? 'Publishing...' : 'Approve & Publish'}
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
