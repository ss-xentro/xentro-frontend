'use client';

import AccountSettings from '@/components/ui/AccountSettings';
import { Card } from '@/components/ui';

export default function AdminSettingsPage() {
	return (
		<div className="space-y-8 max-w-3xl">
			<AccountSettings />

			{/* Platform Info */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-(--primary)">Platform</h2>
				<div className="space-y-3 text-sm text-(--secondary)">
					<div className="flex justify-between py-2 border-b border-(--border)">
						<span>Environment</span>
						<span className="font-medium text-(--primary)">{process.env.NODE_ENV}</span>
					</div>
					<div className="flex justify-between py-2 border-b border-(--border)">
						<span>API Backend</span>
						<span className="font-medium text-(--primary)">Django + DRF</span>
					</div>
					<div className="flex justify-between py-2">
						<span>Version</span>
						<span className="font-medium text-(--primary)">1.0.0</span>
					</div>
				</div>
			</Card>
		</div>
	);
}
