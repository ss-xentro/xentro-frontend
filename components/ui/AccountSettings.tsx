'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Settings {
	id: string;
	name: string;
	email: string;
	phone: string;
	avatar: string;
	accountType: string;
	emailVerified: boolean;
	activeContext: string;
	unlockedContexts: string[];
	notifications: {
		emailNotifications: boolean;
		pushNotifications: boolean;
		inAppNotifications: boolean;
	};
}

export default function AccountSettings() {
	const [settings, setSettings] = useState<Settings | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	// Editable fields
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [avatar, setAvatar] = useState('');
	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		pushNotifications: true,
		inAppNotifications: true,
	});

	// Password change
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordSaving, setPasswordSaving] = useState(false);

	const fetchSettings = useCallback(async () => {
		const token = getSessionToken();
		if (!token) return;

		try {
			const res = await fetch(`${API}/api/account/settings/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load settings');
			const json = await res.json();
			const d = json.data;
			setSettings(d);
			setName(d.name);
			setPhone(d.phone || '');
			setAvatar(d.avatar || '');
			setNotifications(d.notifications);
		} catch {
			setMessage({ type: 'error', text: 'Failed to load settings' });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchSettings(); }, [fetchSettings]);

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		const token = getSessionToken();
		if (!token) return;

		try {
			const res = await fetch(`${API}/api/account/settings/`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, phone, avatar, notifications }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || 'Failed to save');

			setSettings(json.data);
			setMessage({ type: 'success', text: 'Settings saved successfully' });
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
		} finally {
			setSaving(false);
		}
	};

	const handlePasswordChange = async () => {
		if (newPassword !== confirmPassword) {
			setMessage({ type: 'error', text: 'Passwords do not match' });
			return;
		}
		if (newPassword.length < 8) {
			setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
			return;
		}

		setPasswordSaving(true);
		setMessage(null);
		const token = getSessionToken();
		if (!token) return;

		try {
			const res = await fetch(`${API}/api/account/change-password/`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ currentPassword, newPassword }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || 'Failed to change password');

			setMessage({ type: 'success', text: 'Password changed successfully' });
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setShowPasswordForm(false);
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message || 'Failed to change password' });
		} finally {
			setPasswordSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-3xl">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-(--primary)">Settings</h1>
				<p className="text-(--secondary) mt-1">Manage your account preferences</p>
			</div>

			{/* Status Message */}
			{message && (
				<div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success'
						? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
						: 'bg-red-50 text-red-700 border border-red-200'
					}`}>
					{message.text}
				</div>
			)}

			{/* Profile Section */}
			<Card className="p-6 space-y-5">
				<h2 className="text-lg font-semibold text-(--primary)">Profile</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-(--secondary) mb-1">Name</label>
						<Input
							value={name}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
							placeholder="Your full name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-(--secondary) mb-1">Email</label>
						<Input value={settings?.email || ''} disabled />
						{settings?.emailVerified && (
							<span className="text-xs text-emerald-600 mt-1 inline-block">✓ Verified</span>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium text-(--secondary) mb-1">Phone</label>
						<Input
							value={phone}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
							placeholder="+1 (555) 000-0000"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-(--secondary) mb-1">Avatar URL</label>
						<Input
							value={avatar}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatar(e.target.value)}
							placeholder="https://..."
						/>
					</div>
				</div>

				<div className="flex items-center gap-3 pt-2">
					<div className="text-sm text-(--secondary)">
						<span className="font-medium">Account type:</span>{' '}
						<span className="capitalize">{settings?.accountType?.toLowerCase()}</span>
					</div>
					{(settings?.unlockedContexts?.length ?? 0) > 1 && (
						<div className="text-sm text-(--secondary)">
							<span className="font-medium">Contexts:</span>{' '}
							{settings?.unlockedContexts?.map(c => c).join(', ')}
						</div>
					)}
				</div>
			</Card>

			{/* Notifications Section */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-(--primary)">Notifications</h2>
				<div className="space-y-3">
					{[
						{ key: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive updates via email' },
						{ key: 'pushNotifications' as const, label: 'Push notifications', desc: 'Browser push notifications' },
						{ key: 'inAppNotifications' as const, label: 'In-app notifications', desc: 'Show notifications in the app' },
					].map(({ key, label, desc }) => (
						<label key={key} className="flex items-center justify-between py-2 cursor-pointer">
							<div>
								<div className="text-sm font-medium text-(--primary)">{label}</div>
								<div className="text-xs text-(--secondary)">{desc}</div>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={notifications[key]}
								onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[key] ? 'bg-accent' : 'bg-gray-300'
									}`}
							>
								<span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${notifications[key] ? 'translate-x-6' : 'translate-x-1'
									}`} />
							</button>
						</label>
					))}
				</div>
			</Card>

			{/* Security Section */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-(--primary)">Security</h2>
				{!showPasswordForm ? (
					<Button variant="secondary" onClick={() => setShowPasswordForm(true)}>
						Change Password
					</Button>
				) : (
					<div className="space-y-3 max-w-sm">
						<div>
							<label className="block text-sm font-medium text-(--secondary) mb-1">Current Password</label>
							<Input
								type="password"
								value={currentPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-(--secondary) mb-1">New Password</label>
							<Input
								type="password"
								value={newPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-(--secondary) mb-1">Confirm New Password</label>
							<Input
								type="password"
								value={confirmPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
							/>
						</div>
						<div className="flex gap-2 pt-1">
							<Button onClick={handlePasswordChange} disabled={passwordSaving}>
								{passwordSaving ? 'Saving...' : 'Update Password'}
							</Button>
							<Button variant="secondary" onClick={() => {
								setShowPasswordForm(false);
								setCurrentPassword('');
								setNewPassword('');
								setConfirmPassword('');
							}}>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</Card>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : 'Save Settings'}
				</Button>
			</div>
		</div>
	);
}
