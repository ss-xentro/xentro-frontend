'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const OPTIONS = [
	{ value: 'system', label: 'System', icon: MonitorIcon },
	{ value: 'light', label: 'Light', icon: SunIcon },
	{ value: 'dark', label: 'Dark', icon: MoonIcon },
] as const;

export default function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div className="flex gap-1 p-1 rounded-xl bg-(--surface-hover) border border-(--border)">
				{OPTIONS.map((opt) => (
					<div key={opt.value} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
						<div className="w-4 h-4" />
						<span>{opt.label}</span>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex gap-1 p-1 rounded-xl bg-(--surface-hover) border border-(--border)">
			{OPTIONS.map((opt) => {
				const active = theme === opt.value;
				const Icon = opt.icon;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => setTheme(opt.value)}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
								? 'bg-(--background) text-(--primary) shadow-sm border border-(--border)'
								: 'text-(--secondary) hover:text-(--primary) border border-transparent'
							}`}
					>
						<Icon className="w-4 h-4" />
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

function SunIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>
	);
}

function MoonIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
		</svg>
	);
}

function MonitorIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
		</svg>
	);
}
