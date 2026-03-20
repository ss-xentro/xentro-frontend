"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, Button, Input } from "@/components/ui";
import { getSessionToken } from "@/lib/auth-utils";
import { useAuth } from "@/contexts/AuthContext";
import { AppIcon } from "@/components/ui/AppIcon";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

interface AccountSettingsProps {
	showPasswordSection?: boolean;
	/** When true, hides avatar + name and renames the section to "Contact Information". Use on pages where those are managed elsewhere (e.g. the Profile page). */
	contactOnly?: boolean;
	/** When false, hides the profile/contact editing card from Settings and keeps only preferences/security sections. */
	showProfileSection?: boolean;
	/** Optional route to dedicated profile editor page. When provided, shows an Edit Profile action in the header. */
	editProfileHref?: string;
}

export default function AccountSettings({
	showPasswordSection = false,
	contactOnly = false,
	showProfileSection = true,
	editProfileHref,
}: AccountSettingsProps) {
	const { user, setSession, token: authToken } = useAuth();
	const [settings, setSettings] = useState<Settings | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	// Editable fields
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [avatar, setAvatar] = useState("");
	const [avatarUploading, setAvatarUploading] = useState(false);
	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		pushNotifications: true,
		inAppNotifications: true,
	});

	// Password change (admin only)
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordSaving, setPasswordSaving] = useState(false);

	const fetchSettings = useCallback(async () => {
		const token = getSessionToken();
		if (!token) return;

		try {
			const res = await fetch(`${API}/api/account/settings/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Failed to load settings");
			const json = await res.json();
			const d = json.data;
			setSettings(d);
			setName(d.name);
			setPhone(d.phone || "");
			setAvatar(d.avatar || "");
			setNotifications(d.notifications);
		} catch {
			setMessage({ type: "error", text: "Failed to load settings" });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		const token = getSessionToken();
		if (!token) return;

		try {
			const res = await fetch(`${API}/api/account/settings/`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, phone, avatar, notifications }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to save");

			setSettings(json.data);
			setMessage({ type: "success", text: "Settings saved successfully" });

			// Sync updated name/avatar to auth cookie + context so sidebar updates
			if (user && authToken) {
				const updatedUser = { ...user, name, avatar };
				setSession(updatedUser, authToken);
			}
		} catch (err: any) {
			setMessage({
				type: "error",
				text: err.message || "Failed to save settings",
			});
		} finally {
			setSaving(false);
		}
	};

	const handlePasswordChange = async () => {
		if (newPassword !== confirmPassword) {
			setMessage({ type: "error", text: "Passwords do not match" });
			return;
		}
		if (newPassword.length < 8) {
			setMessage({
				type: "error",
				text: "Password must be at least 8 characters",
			});
			return;
		}

		setPasswordSaving(true);
		setMessage(null);
		const token = getSessionToken();
		if (!token) return;

		try {
			const res = await fetch(`${API}/api/account/change-password/`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ currentPassword, newPassword }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Failed to change password");

			setMessage({ type: "success", text: "Password changed successfully" });
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setShowPasswordForm(false);
		} catch (err: any) {
			setMessage({
				type: "error",
				text: err.message || "Failed to change password",
			});
		} finally {
			setPasswordSaving(false);
		}
	};

	const profileIncomplete = showProfileSection && (contactOnly
		? !phone?.trim()
		: !name?.trim() || !phone?.trim());

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
			<div className="flex items-start justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-(--primary)">Settings</h1>
					<p className="text-(--secondary) mt-1">
						Manage your account preferences
					</p>
				</div>
				{editProfileHref && (
					<Link
						href={editProfileHref}
						className="inline-flex min-h-11 h-11 items-center justify-center rounded-lg border border-(--border) bg-(--surface) px-4 text-sm font-medium text-(--primary) transition-colors hover:bg-(--surface-hover)"
					>
						Edit Profile
					</Link>
				)}
			</div>

			{/* Status Message */}
			{message && (
				<div
					className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success"
						? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
						: "bg-red-500/15 text-red-400 border border-red-500/20"
						}`}
				>
					{message.text}
				</div>
			)}

			{/* Profile Completion Banner */}
			{profileIncomplete && (
				<div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
					<svg
						className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<div>
						<p className="text-sm font-medium text-amber-400">
							Complete your profile
						</p>
						<p className="text-xs text-(--secondary) mt-0.5">
							{contactOnly
								? "Please fill in your phone number."
								: `Please fill in your ${!name?.trim() ? "name" : ""}${!name?.trim() && !phone?.trim() ? " and " : ""}${!phone?.trim() ? "phone number" : ""}.`}
						</p>
					</div>
				</div>
			)}

			{/* Profile / Contact Information Section */}
			{showProfileSection && (
				<Card className="p-6 space-y-5">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-(--primary)">
							{contactOnly ? "Contact Information" : "Profile"}
						</h2>
					</div>

					{/* Avatar — hidden in contactOnly mode (managed on Profile page) */}
					{!contactOnly && (
						<div className="flex items-center gap-5">
							<div className="w-20 h-20 rounded-full border-2 border-(--border) flex items-center justify-center overflow-hidden shrink-0 bg-(--surface-hover)">
								{avatar ? (
									<img
										src={avatar}
										alt="Avatar"
										className="w-full h-full object-cover"
										referrerPolicy="no-referrer"
									/>
								) : (
									<span className="text-2xl font-bold text-(--secondary)">
										{name ? name.charAt(0).toUpperCase() : "?"}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<label className="block text-sm font-medium text-(--secondary)">
									Profile Photo
								</label>
								<div className="flex items-center gap-2">
									<label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-(--surface-hover) border border-(--border) text-(--primary) hover:bg-(--surface-pressed) transition-colors">
										<svg
											className="w-4 h-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										Upload
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (!file) return;
												setAvatarUploading(true);
												const formData = new FormData();
												formData.append("file", file);
												formData.append("folder", "avatars");
												const uploadToken = getSessionToken();
												fetch("/api/media", {
													method: "POST",
													body: formData,
													headers: uploadToken
														? { Authorization: `Bearer ${uploadToken}` }
														: {},
												})
													.then((r) => r.json())
													.then((json) => {
														if (json.data?.url) setAvatar(json.data.url);
													})
													.catch(() =>
														setMessage({
															type: "error",
															text: "Failed to upload avatar",
														}),
													)
													.finally(() => setAvatarUploading(false));
											}}
										/>
									</label>
									{avatar && (
										<button
											type="button"
											onClick={() => setAvatar("")}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
										>
											Remove
										</button>
									)}
									{avatarUploading && (
										<span className="text-xs text-(--secondary)">
											Uploading...
										</span>
									)}
								</div>
								<p className="text-xs text-(--secondary)">
									JPG, PNG or SVG. Max 5MB.
								</p>
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Name — hidden in contactOnly mode (managed on Profile page) */}
						{!contactOnly && (
							<div>
								<label className="block text-sm font-medium text-(--secondary) mb-1">
									Name
								</label>
								<Input
									value={name}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setName(e.target.value)
									}
									placeholder="Your full name"
								/>
							</div>
						)}
						<div>
							<label className="block text-sm font-medium text-(--secondary) mb-1">
								Email
							</label>
							<Input value={settings?.email || ""} disabled />
							{settings?.emailVerified && (
								<span className="text-xs text-emerald-400 mt-1 inline-flex items-center gap-1">
									<AppIcon name="check" className="w-3 h-3" /> Verified
								</span>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-(--secondary) mb-1">
								Phone
							</label>
							<Input
								value={phone}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPhone(e.target.value)
								}
								placeholder="+1 (555) 000-0000"
							/>
						</div>
					</div>
				</Card>
			)}

			{/* Notifications Section */}
			<Card className="p-6 space-y-4">
				<h2 className="text-lg font-semibold text-(--primary)">
					Notifications
				</h2>
				<div className="space-y-3">
					{[
						{
							key: "emailNotifications" as const,
							label: "Email notifications",
							desc: "Receive updates via email",
						},
						{
							key: "pushNotifications" as const,
							label: "Push notifications",
							desc: "Browser push notifications",
						},
						{
							key: "inAppNotifications" as const,
							label: "In-app notifications",
							desc: "Show notifications in the app",
						},
					].map(({ key, label, desc }) => (
						<label
							key={key}
							className="flex items-center justify-between py-2 cursor-pointer"
						>
							<div>
								<div className="text-sm font-medium text-(--primary)">
									{label}
								</div>
								<div className="text-xs text-(--secondary)">{desc}</div>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={notifications[key]}
								onClick={() =>
									setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
								}
								className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${notifications[key]
									? "bg-(--primary) border-(--primary)"
									: "bg-(--surface-hover) border-(--border)"
									}`}
							>
								<span
									className={`inline-block h-4 w-4 rounded-full transition-transform ${notifications[key]
										? "translate-x-6 bg-(--background)"
										: "translate-x-1 bg-(--secondary-light)"
										}`}
								/>
							</button>
						</label>
					))}
				</div>
			</Card>

			{/* Security Section — admin only */}
			{showPasswordSection && (
				<Card className="p-6 space-y-4">
					<h2 className="text-lg font-semibold text-(--primary)">Security</h2>
					{!showPasswordForm ? (
						<Button
							variant="secondary"
							onClick={() => setShowPasswordForm(true)}
						>
							Change Password
						</Button>
					) : (
						<div className="space-y-3 max-w-sm">
							<div>
								<label className="block text-sm font-medium text-(--secondary) mb-1">
									Current Password
								</label>
								<Input
									type="password"
									value={currentPassword}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setCurrentPassword(e.target.value)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-(--secondary) mb-1">
									New Password
								</label>
								<Input
									type="password"
									value={newPassword}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setNewPassword(e.target.value)
									}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-(--secondary) mb-1">
									Confirm New Password
								</label>
								<Input
									type="password"
									value={confirmPassword}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setConfirmPassword(e.target.value)
									}
								/>
							</div>
							<div className="flex gap-2 pt-1">
								<Button
									onClick={handlePasswordChange}
									disabled={passwordSaving}
								>
									{passwordSaving ? "Saving..." : "Update Password"}
								</Button>
								<Button
									variant="secondary"
									onClick={() => {
										setShowPasswordForm(false);
										setCurrentPassword("");
										setNewPassword("");
										setConfirmPassword("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</Card>
			)}

			{/* Save Button */}
			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={saving}>
					{saving ? "Saving..." : "Save Settings"}
				</Button>
			</div>
		</div>
	);
}
