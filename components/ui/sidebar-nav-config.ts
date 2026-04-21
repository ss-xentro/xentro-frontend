import { ReactNode } from 'react';
import { icons } from './sidebar-icons';

export type UserRole = 'institution' | 'startup' | 'founder' | 'mentor';

export interface NavItem {
	name: string;
	href: string;
	icon: ReactNode;
}

export function getNavItems(role: UserRole): NavItem[] {
	switch (role) {
		case 'institution':
			return [
				{ name: 'Overview', href: '/institution-dashboard', icon: icons.overview },
				{ name: 'Edit Profile', href: '/institution-edit', icon: icons.edit },
				// events hidden — re-enable in v2
				// { name: 'Events', href: '/institution-dashboard/events', icon: icons.clock },
				{ name: 'Startups', href: '/institution-dashboard/startups', icon: icons.bolt },
				{ name: 'Mentors', href: '/institution-dashboard/mentors', icon: icons.mentors },
				{ name: 'Programs', href: '/institution-dashboard/programs', icon: icons.bolt },
				{ name: 'Projects', href: '/institution-dashboard/projects', icon: icons.document },
				{ name: 'Team Members', href: '/institution-dashboard/team', icon: icons.team },
				{ name: 'Analytics', href: '/institution-dashboard/analytics', icon: icons.analytics },
				{ name: 'Recycle Bin', href: '/institution-dashboard/recycle-bin', icon: icons.trash },
			];
		case 'startup':
		case 'founder':
			return [
				{ name: 'Overview', href: '/dashboard', icon: icons.overview },
				{ name: 'Edit Profile', href: '/dashboard/startup', icon: icons.edit },
				{ name: 'Pitch Deck', href: '/dashboard/startup/pitch', icon: icons.document },
				{ name: 'Team', href: '/dashboard/team', icon: icons.team },
				{ name: 'Activity', href: '/dashboard/activity', icon: icons.clock },
				{ name: 'My Mentors', href: '/dashboard/mentors', icon: icons.groupPeople },
				{ name: 'Endorsements', href: '/dashboard/endorsements', icon: icons.endorsement },
			];
		case 'mentor':
			return [
				{ name: 'Overview', href: '/mentor-dashboard', icon: icons.overview },
				{ name: 'Profile', href: '/mentor-dashboard/profile', icon: icons.profile },
				{ name: 'Packages', href: '/mentor-dashboard/packages', icon: icons.bolt },
				{ name: 'Sessions', href: '/mentor-dashboard/sessions', icon: icons.calendar },
				{ name: 'Mentees', href: '/mentor-dashboard/mentees', icon: icons.team },
				{ name: 'Requests', href: '/mentor-dashboard/requests', icon: icons.addPerson },
				{ name: 'Endorsements', href: '/mentor-dashboard/endorsements', icon: icons.endorsement },
				{ name: 'Analytics', href: '/mentor-dashboard/analytics', icon: icons.analytics },
			];
		// investor hidden for v1 — re-enable in v2
		default:
			return [];
	}
}

export const roleLabels: Record<UserRole, string> = {
	institution: 'Institution',
	startup: 'Founder',
	founder: 'Founder',
	mentor: 'Mentor',
};

export const logoutRedirects: Record<UserRole, string> = {
	institution: '/institution-login',
	startup: '/login',
	founder: '/login',
	mentor: '/login',
};
