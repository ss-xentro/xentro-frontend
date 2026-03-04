'use client';

import { useState, useEffect } from 'react';

const CONSENT_COOKIE = 'xentro_cookie_consent';

function hasConsent(): boolean {
	if (typeof document === 'undefined') return true;
	return /xentro_cookie_consent=(all|necessary)/.test(document.cookie);
}

function setConsent(level: 'all' | 'necessary') {
	if (typeof document === 'undefined') return;
	const maxAge = 365 * 24 * 60 * 60; // 1 year
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${CONSENT_COOKIE}=${level}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export default function CookieConsent() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// Small delay so the banner doesn't flash on pages where consent exists
		const timer = setTimeout(() => {
			if (!hasConsent()) setVisible(true);
		}, 800);
		return () => clearTimeout(timer);
	}, []);

	if (!visible) return null;

	const handleAcceptAll = () => {
		setConsent('all');
		setVisible(false);
	};

	const handleAcceptNecessary = () => {
		setConsent('necessary');
		setVisible(false);
	};

	return (
		<div
			className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-500"
			role="dialog"
			aria-label="Cookie consent"
		>
			<div className="bg-[#13151A] border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
				{/* Header */}
				<div className="flex items-center gap-2 mb-3">
					<svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h3 className="text-white font-semibold text-sm">Cookie Notice</h3>
				</div>

				{/* Body */}
				<p className="text-gray-400 text-xs leading-relaxed mb-4">
					We use cookies to keep you signed in, remember your preferences, and improve your experience.
				</p>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<button
						onClick={handleAcceptAll}
						className="flex-1 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
					>
						Accept All
					</button>
					<button
						onClick={handleAcceptNecessary}
						className="flex-1 px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
					>
						Accept Necessary
					</button>
				</div>
			</div>
		</div>
	);
}
