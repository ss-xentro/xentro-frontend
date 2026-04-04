'use client';

import { useRef, useEffect, useState } from 'react';

export type OnboardingRole = 'startup' | 'institution' | 'mentor';

const ROLE_LABELS: Record<OnboardingRole, string> = {
	startup: 'Startup',
	institution: 'Institution',
	mentor: 'Mentor',
};

interface OnboardingRoleSelectProps {
	current: OnboardingRole;
	/** When provided, role changes call this instead of navigating */
	onChange?: (role: OnboardingRole) => void;
	className?: string;
}

export function OnboardingRoleSelect({ current, onChange, className }: OnboardingRoleSelectProps) {
	const measureRef = useRef<HTMLSpanElement>(null);
	const [width, setWidth] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (measureRef.current) {
			// 24px accounts for the chevron icon + right padding
			setWidth(measureRef.current.offsetWidth + 24);
		}
	}, [current]);

	return (
		<span className={className}>
			Join as{' '}
			<span className="relative inline-block">
				{/* Hidden measurer that matches the select's font */}
				<span
					ref={measureRef}
					className="invisible absolute whitespace-nowrap font-bold [font-size:inherit]"
					aria-hidden="true"
				>
					{ROLE_LABELS[current]}
				</span>
				<select
					value={current}
					onChange={(e) => {
						const role = e.target.value as OnboardingRole;
						if (onChange) {
							onChange(role);
						}
					}}
					style={width ? { width: `${width}px` } : undefined}
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
		</span>
	);
}
