'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type VerifyState = 'loading' | 'success' | 'already-used' | 'expired' | 'invalid' | 'error';

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const session = searchParams.get('session');
	const code = searchParams.get('code');
	const [state, setState] = useState<VerifyState>('loading');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (!session || !code) {
			return;
		}

		const verifyEmail = async () => {
			try {
				const res = await fetch('/api/auth/verify-email/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ session, code }),
				});

				const data = await res.json();

				if (res.ok && data.valid) {
					setState('success');
				} else {
					const error = (data.error || '').toLowerCase();
					if (error.includes('already used')) {
						setState('already-used');
					} else if (error.includes('expired')) {
						setState('expired');
					} else {
						setState('error');
						setErrorMessage(data.error || 'We couldn\u2019t verify your email. Please try again.');
					}
				}
			} catch {
				setState('error');
				setErrorMessage('Something went wrong. Please check your connection and try again.');
			}
		};

		verifyEmail();
	}, [session, code]);

	if (!session || !code) {
		return (
			<div className="min-h-screen bg-(--surface-hover) flex items-center justify-center px-4">
				<div className="bg-(--surface) rounded-2xl shadow-sm border border-(--border) p-8 sm:p-12 max-w-md w-full text-center">
					<div className="flex items-center justify-center gap-1 mb-8">
						<img src="/xentro-logo.png" alt="" className="h-7 w-auto" />
						<span className="text-lg font-bold tracking-tight text-(--primary)">entro</span>
					</div>
					<ErrorView
						title="Invalid Link"
						message="Invalid link. Please request a new one."
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-(--surface-hover) flex items-center justify-center px-4">
			<div className="bg-(--surface) rounded-2xl shadow-sm border border-(--border) p-8 sm:p-12 max-w-md w-full text-center">
				{/* Logo */}
				<div className="flex items-center justify-center gap-1 mb-8">
					<img src="/xentro-logo.png" alt="" className="h-7 w-auto" />
					<span className="text-lg font-bold tracking-tight text-(--primary)">entro</span>
				</div>

				{state === 'loading' && <LoadingView />}
				{state === 'success' && <SuccessView />}
				{state === 'already-used' && <AlreadyUsedView />}
				{state === 'expired' && <ExpiredView />}
				{state === 'invalid' && <ErrorView title="Invalid Link" message={errorMessage} />}
				{state === 'error' && <ErrorView title="Email Not Verified" message={errorMessage} />}
			</div>
		</div>
	);
}

function LoadingView() {
	return (
		<>
			<div className="w-14 h-14 bg-(--surface-hover) rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="animate-spin h-6 w-6 text-(--secondary)" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-(--primary) mb-2">Verifying your email...</h1>
			<p className="text-sm text-(--secondary)">Please wait a moment.</p>
		</>
	);
}

function SuccessView() {
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const CLOSE_AFTER_MS = 5000;
		const deadline = Date.now() + CLOSE_AFTER_MS;
		let closed = false;

		const attemptClose = () => {
			if (closed) return;
			closed = true;
			try {
				window.close();
			} catch {
				window.location.href = '/login';
				return;
			}

			// Some browsers block close() unless tab was script-opened.
			window.setTimeout(() => {
				if (!window.closed) {
					window.location.href = '/login';
				}
			}, 150);
		};

		const syncWithDeadline = () => {
			const msLeft = deadline - Date.now();
			if (msLeft <= 0) {
				setCountdown(0);
				attemptClose();
				return;
			}
			setCountdown(Math.ceil(msLeft / 1000));
		};

		syncWithDeadline();

		const interval = window.setInterval(syncWithDeadline, 500);
		const timeout = window.setTimeout(syncWithDeadline, CLOSE_AFTER_MS + 30);

		window.addEventListener('visibilitychange', syncWithDeadline);
		window.addEventListener('focus', syncWithDeadline);
		window.addEventListener('pageshow', syncWithDeadline);

		return () => {
			window.clearInterval(interval);
			window.clearTimeout(timeout);
			window.removeEventListener('visibilitychange', syncWithDeadline);
			window.removeEventListener('focus', syncWithDeadline);
			window.removeEventListener('pageshow', syncWithDeadline);
		};
	}, []);

	return (
		<>
			<div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-(--primary) mb-2">Your email is verified!</h1>
			<p className="text-sm text-(--secondary) mb-6">
				You can now close this tab and return to complete your sign-up.
			</p>
			<Link
				href="/login"
				className="inline-block bg-(--primary) text-(--surface) text-sm font-medium px-8 py-3 rounded-lg hover:bg-(--primary)/90 transition-colors"
			>
				Go to Login
			</Link>
			<p className="text-xs text-(--secondary) mt-4">This tab will close in {countdown}s</p>
		</>
	);
}

function AlreadyUsedView() {
	return (
		<>
			<div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-(--primary) mb-2">Link Already Used</h1>
			<p className="text-sm text-(--secondary) mb-6">
				This link was already used. You can sign in below.
			</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-(--primary) text-(--surface) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--primary)/90 transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-(--border) text-(--primary) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--surface-hover) transition-colors"
				>
					Sign Up
				</Link>
			</div>
		</>
	);
}

function ExpiredView() {
	return (
		<>
			<div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-(--primary) mb-2">Link Expired</h1>
			<p className="text-sm text-(--secondary) mb-6">
				This link has expired. Request a new one.
			</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-(--primary) text-(--surface) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--primary)/90 transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-(--border) text-(--primary) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--surface-hover) transition-colors"
				>
					Sign Up
				</Link>
			</div>
		</>
	);
}

function ErrorView({ title, message }: { title: string; message: string }) {
	return (
		<>
			<div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-(--primary) mb-2">{title}</h1>
			<p className="text-sm text-(--secondary) mb-6">{message}</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-(--primary) text-(--surface) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--primary)/90 transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-(--border) text-(--primary) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--surface-hover) transition-colors"
				>
					Sign Up
				</Link>
			</div>
		</>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-(--surface-hover) flex items-center justify-center px-4">
					<div className="bg-(--surface) rounded-2xl shadow-sm border border-(--border) p-8 sm:p-12 max-w-md w-full text-center">
						<div className="flex items-center justify-center gap-1 mb-8">
							<img src="/xentro-logo.png" alt="" className="h-7 w-auto" />
							<span className="text-lg font-bold tracking-tight text-(--primary)">entro</span>
						</div>
						<div className="w-14 h-14 bg-(--surface-hover) rounded-full flex items-center justify-center mx-auto mb-5">
							<svg className="animate-spin h-6 w-6 text-(--secondary)" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
						</div>
						<h1 className="text-xl font-semibold text-(--primary) mb-2">Verifying your email...</h1>
						<p className="text-sm text-(--secondary)">Please wait a moment.</p>
					</div>
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
