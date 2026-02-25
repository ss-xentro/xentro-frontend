'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
	const { user } = useAuth();
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		// Placeholder — no backend endpoint yet
		setTimeout(() => {
			setSaving(false);
			setMessage('Settings saved successfully.');
		}, 500);
	};

	return (
		<div className="space-y-8 max-w-3xl">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Settings</h1>
				<p className="text-gray-500 mt-1">Manage your admin account and platform settings</p>
			</div>

			{/* Profile */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">Account</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
						<Input value={user?.name ?? ''} disabled />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<Input value={user?.email ?? ''} disabled />
					</div>
				</div>
			</Card>

			{/* Platform */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">Platform</h2>
				<div className="space-y-3 text-sm text-gray-600">
					<div className="flex justify-between py-2 border-b border-gray-100">
						<span>Environment</span>
						<span className="font-medium text-gray-900">{process.env.NODE_ENV}</span>
					</div>
					<div className="flex justify-between py-2 border-b border-gray-100">
						<span>API Backend</span>
						<span className="font-medium text-gray-900">Django + DRF</span>
					</div>
					<div className="flex justify-between py-2">
						<span>Version</span>
						<span className="font-medium text-gray-900">1.0.0</span>
					</div>
				</div>
			</Card>

			{/* Actions */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
				<p className="text-sm text-gray-500">
					These actions are irreversible. Proceed with caution.
				</p>
				<Button variant="ghost" className="text-red-600 border border-red-200 hover:bg-red-50" disabled>
					Reset Platform Data
				</Button>
			</Card>

			{message && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
					{message}
				</div>
			)}
		</div>
	);
}
