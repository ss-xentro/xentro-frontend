'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { setTokenCookie, syncAuthCookie, setRoleToken, clearAllRoleTokens, normalizeUser } from '@/lib/auth-utils';

type VerifyState = 'loading' | 'success' | 'already-used' | 'invalid' | 'error';

function VerifyInstitutionContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [state, setState] = useState<VerifyState>('loading');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const token = searchParams.get('token');

		if (!token) {
			setState('invalid');
			setErrorMessage('This verification link is incomplete or malformed. Please request a new one.');
			return;
		}

		const verifyInstitution = async () => {
			try {
				const res = await fetch('/api/institution-applications/verify/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token }),
				});

				const data = await res.json();

				if (res.ok && data.success) {
					// Store the JWT so the user is logged in on redirect
					if (data.token) {
						clearAllRoleTokens();
						setRoleToken('institution', data.token);
						setTokenCookie(data.token);
						if (data.user) {
							syncAuthCookie(data.user);
						}
					}
					setState('success');
					// Auto-redirect to institution dashboard after a short delay
					setTimeout(() => {
						router.push(data.redirectUrl || '/institution-dashboard');
					}, 2000);
				} else {
					const error = (data.message || data.error || '').toLowerCase();
					if (error.includes('already') || error.includes('used') || error.includes('expired')) {
						setState('already-used');
					} else {
						setState('error');
						setErrorMessage(data.message || data.error || 'We couldn\u2019t verify your institution. Please try again.');
					}
				}
			} catch {
				setState('error');
				setErrorMessage('Something went wrong. Please check your connection and try again.');
			}
		};

		verifyInstitution();
	}, [searchParams, router]);

	return (
		<div className="min-h-screen bg-(--surface-hover) flex items-center justify-center px-4">
			<div className="bg-(--surface) rounded-2xl shadow-sm border border-(--border-light) p-8 sm:p-12 max-w-md w-full text-center">
				{/* Logo */}
				<div className="flex items-center justify-center gap-1 mb-8">
					<img src="/xentro-logo.png" alt="" className="h-7 w-auto" />
					<span className="text-lg font-bold tracking-tight text-(--primary)">entro</span>
				</div>

				{state === 'loading' && <LoadingView />}
				{state === 'success' && <SuccessView />}
				{state === 'already-used' && <AlreadyUsedView />}
				{state === 'invalid' && <ErrorView title="Invalid Link" message={errorMessage} />}
				{state === 'error' && <ErrorView title="Verification Failed" message={errorMessage} />}
			</div>
		</div>
	);
}

function LoadingView() {
	return (
		<>
			<div className="w-14 h-14 bg-(--surface-pressed) rounded-full flex items-center justify-center mx-auto mb-5">
				<svg className="animate-spin h-6 w-6 text-(--secondary-light)" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
				</svg>
			</div>
			<h1 className="text-xl font-semibold text-(--primary) mb-2">Verifying your institution...</h1>
			<p className="text-sm text-(--secondary)">Please wait a moment.</p>
		</>
	);
}

function SuccessView() {
	const [countdown, setCountdown] = useState(3);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
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
			<h1 className="text-xl font-semibold text-(--primary) mb-2">Institution Verified!</h1>
			<p className="text-sm text-(--secondary) mb-6">
				Your institution email has been verified. Redirecting to your dashboard...
			</p>
			<Link
				href="/institution-dashboard"
				className="inline-block bg-(--primary) text-white text-sm font-medium px-8 py-3 rounded-lg hover:bg-(--primary-light) transition-colors"
			>
				Go to Dashboard
			</Link>
			<p className="text-xs text-(--secondary-light) mt-4">Redirecting in {countdown}s</p>
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
				This verification link has already been used or has expired. If you&apos;ve already verified, try logging in below.
			</p>
			<div className="flex items-center justify-center gap-3">
				<Link
					href="/login"
					className="inline-block bg-(--primary) text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--primary-light) transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-(--border) text-(--primary-light) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--surface-hover) transition-colors"
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
					className="inline-block bg-(--primary) text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--primary-light) transition-colors"
				>
					Go to Login
				</Link>
				<Link
					href="/join"
					className="inline-block border border-(--border) text-(--primary-light) text-sm font-medium px-6 py-3 rounded-lg hover:bg-(--surface-hover) transition-colors"
				>
					Sign Up
				</Link>
			</div>
		</>
	);
}

export default function VerifyInstitutionPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-(--surface-hover) flex items-center justify-center px-4">
					<div className="bg-(--surface) rounded-2xl shadow-sm border border-(--border-light) p-8 sm:p-12 max-w-md w-full text-center">
						<div className="flex items-center justify-center gap-1 mb-8">
							<img src="/xentro-logo.png" alt="" className="h-7 w-auto" />
							<span className="text-lg font-bold tracking-tight text-(--primary)">entro</span>
						</div>
						<div className="w-14 h-14 bg-(--surface-pressed) rounded-full flex items-center justify-center mx-auto mb-5">
							<svg className="animate-spin h-6 w-6 text-(--secondary-light)" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
						</div>
						<h1 className="text-xl font-semibold text-(--primary) mb-2">Verifying your institution...</h1>
						<p className="text-sm text-(--secondary)">Please wait a moment.</p>
					</div>
				</div>
			}
		>
			<VerifyInstitutionContent />
		</Suspense>
	);
}
