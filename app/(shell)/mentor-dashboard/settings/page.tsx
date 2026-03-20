'use client';

import AccountSettings from '@/components/ui/AccountSettings';

export default function MentorSettingsPage() {
	return <AccountSettings contactOnly showProfileSection={false} editProfileHref="/mentor-dashboard/profile" />;
}
