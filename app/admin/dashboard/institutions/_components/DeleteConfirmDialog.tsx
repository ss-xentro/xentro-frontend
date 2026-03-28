'use client';

import { Button, Modal } from '@/components/ui';

interface DeleteConfirmDialogProps {
	institution: { id: string; name: string };
	onConfirm: () => void;
	onCancel: () => void;
	deleting: boolean;
}

export function DeleteConfirmDialog({ institution, onConfirm, onCancel, deleting }: DeleteConfirmDialogProps) {
	return (
		<Modal isOpen onClose={onCancel} title="Delete Institution" className="max-w-md">
			<div className="flex items-start gap-4">
				<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
					<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<div className="flex-1">
					<p className="text-(--secondary) mb-4">
						Are you sure you want to delete <strong>{institution.name}</strong>? This action cannot be undone.
					</p>
					<div className="flex gap-3 justify-end">
						<Button variant="ghost" onClick={onCancel} disabled={deleting}>
							Cancel
						</Button>
						<Button
							variant="danger"
							onClick={onConfirm}
							disabled={deleting}
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
