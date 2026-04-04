'use client';

import { useRouter } from 'next/navigation';

const ROLE_ROUTES: Record<string, string> = {
	startup: '/onboarding/startup',
	institution: '/institution-onboarding',
	mentor: '/mentor-signup',
};

const ROLE_LABELS: Record<string, string> = {
	startup: 'a Startup',
	institution: 'an Institution',
	mentor: 'a Mentor',
};

interface OnboardingRoleSelectProps {
	current: 'startup' | 'institution' | 'mentor';
	className?: string;
}

export function OnboardingRoleSelect({ current, className }: OnboardingRoleSelectProps) {
	const router = useRouter();

	return (
		<span className={className}>
			Join as{' '}
			<select
				value={current}
				onChange={(e) => {
					const route = ROLE_ROUTES[e.target.value];
					if (route) router.push(route);
				}}
				className="font-bold text-accent bg-transparent border-b-2 border-accent outline-none cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-position-[right_0.25rem_center] [font-size:inherit]"
				aria-label="Select your role"
			>
				{Object.entries(ROLE_LABELS).map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
		</span>
	);
}
