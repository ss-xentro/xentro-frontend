'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type VerifyState = 'loading' | 'success' | 'already-used' | 'expired' | 'invalid' | 'error';

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const [state, setState] = useState<VerifyState>('loading');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const session = searchParams.get('session');
		const code = searchParams.get('code');

		if (!session || !code) {
			setState('invalid');
			setErrorMessage('This verification link is incomplete or malformed. Please request a new one.');
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
	}, [searchParams]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center">
				{/* Logo */}
				<p className="text-xs font-semibold tracking-[0.2em] text-gray-400 mb-8">XENTRO</p>

				{state === 'loading' && <LoadingView />}
				{state === 'success' && <SuccessView />}
				{state === 'already-used' && <AlreadyUsedView />}
				{state === 'expired' && <ExpiredView />}
				{state === 'invalid' && <ErrorView title="Invalid Link" message={errorMessage} />}
				{state === 'error' && <ErrorView title="Verification Failed" message={errorMessage} />}
			</div>
		</div>
	);
}

function LoadingView() {
	return (
		<>
			<div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h1>
			<p className="text-sm text-gray-500">Please wait a moment.</p>
		</>
	);
}

function SuccessView() {
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					try {
						window.close();
					} catch {
						window.location.href = '/login';
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	return (
		<>
			<div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-gray-900 mb-2">Your email is verified!</h1>
			<p className="text-sm text-gray-500 mb-6">
				You can now close this tab and return to complete your sign-up.
			</p>
			<Link
				href="/login"
				className="inline-block bg-gray-900 text-white text-sm font-medium px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
			>
				Go to Login
			</Link>
			<p className="text-xs text-gray-400 mt-4">This tab will close in {countdown}s</p>
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
			<h1 className="text-xl font-semibold text-gray-900 mb-2">Link Already Used</h1>
			<p className="text-sm text-gray-500 mb-6">
				This verification link has already been used. If you&apos;ve already verified, you can sign in below.
			</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-gray-300 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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
			<h1 className="text-xl font-semibold text-gray-900 mb-2">Link Expired</h1>
			<p className="text-sm text-gray-500 mb-6">
				This verification link has expired. Please go back and request a new one.
			</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-gray-300 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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
			<h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
			<p className="text-sm text-gray-500 mb-6">{message}</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-gray-300 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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
				<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center">
						<p className="text-xs font-semibold tracking-[0.2em] text-gray-400 mb-8">XENTRO</p>
						<div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
							<svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
						</div>
						<h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h1>
						<p className="text-sm text-gray-500">Please wait a moment.</p>
					</div>
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
