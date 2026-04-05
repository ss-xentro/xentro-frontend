'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, ProgressIndicator } from '@/components/ui';
import { useEmailCheck } from '@/lib/useEmailCheck';
import { toast } from 'sonner';

const TOTAL_STEPS = 2;

export function SignupForm() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ name: '', email: '' });

	const { checking: emailChecking, result: emailCheckResult } = useEmailCheck(form.email, 'signup');
	const emailTaken = emailCheckResult?.exists && !emailCheckResult?.canProceed;
	const emailClear = form.email.trim().length > 4 && form.email.includes('@') && !emailChecking && emailCheckResult !== null && !emailTaken;

	const updateField = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const canProceed = () => {
		switch (step) {
			case 1: return form.name.trim().length > 0;
			case 2: return emailClear;
			default: return false;
		}
	};

	const handleNext = async () => {
		if (!canProceed()) {
			toast.error('Please complete this step before continuing.');
			return;
		}

		if (step === 1) {
			setStep((prev) => prev + 1);
			return;
		}

		setLoading(true);
		try {
			// Create the startup account first
			const res = await fetch('/api/founder/startups/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: form.name.trim(),
					primaryContactEmail: form.email.trim().toLowerCase(),
					status: 'public',
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Failed to create account');

			// Send verification link
			const linkRes = await fetch('/api/auth/magic-link/send/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: form.email.trim().toLowerCase(),
					name: form.name.trim(),
					purpose: 'signup',
				}),
			}).catch(() => null);

			if (linkRes && !linkRes.ok) {
				const linkData = await linkRes.json().catch(() => ({}));
				if (linkData.code === 'EMAIL_ALREADY_REGISTERED') {
					toast.error('An account with this email already exists. Please log in instead.');
					router.push('/login');
					return;
				}
			}

			toast.success('Account created! Check your email to verify your address, then log in.');
			router.push('/login');
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		setStep((prev) => Math.max(1, prev - 1));
	};

	const isLastStep = step === TOTAL_STEPS;
	const primaryLabel = isLastStep
		? (loading ? 'Creating account...' : 'Continue to login')
		: 'Continue';

	return (
		<Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
			<ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

			{step === 1 && (
				<div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
					<div className="text-center space-y-2 mb-6">
						<h2 className="text-xl font-semibold text-(--primary)">What&apos;s your startup called?</h2>
						<p className="text-sm text-(--secondary)">We&apos;ll use this for your startup profile.</p>
					</div>
					<Input
						label="Startup Name"
						value={form.name}
						onChange={(e) => updateField('name', e.target.value)}
						autoFocus
						required
						aria-label="Startup Name"
						aria-required="true"
					/>
					<div className="flex justify-end pt-4">
						<Button
							onClick={handleNext}
							disabled={!canProceed()}
							aria-label="Continue to email verification"
							className="min-w-30 min-h-11"
						>
							Continue
						</Button>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
					<div className="text-center space-y-2 mb-6">
						<h2 className="text-xl font-semibold text-(--primary)">Verify your email address</h2>
						<p className="text-sm text-(--secondary)">We&apos;ll send you a verification link. You can log in once you&apos;ve verified your email.</p>
					</div>
					<Input
						label="Company Email"
						type="email"
						value={form.email}
						onChange={(e) => updateField('email', e.target.value)}
						autoFocus
						required
						aria-label="Company Email"
						aria-required="true"
					/>
					{emailChecking && (
						<p className="text-xs text-(--secondary) animate-pulse">Checking email availability...</p>
					)}
					{emailTaken && (
						<div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-500/30 rounded-xl">
							<svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<div>
								<p className="text-sm font-medium text-amber-800">{emailCheckResult?.message || 'This email is already associated with an account.'}</p>
								<a href="/login" className="text-sm text-accent hover:underline font-medium mt-1 inline-block">
									Go to Login &rarr;
								</a>
							</div>
						</div>
					)}
					<div className="flex flex-wrap gap-3 pt-4">
						<Button
							onClick={handleNext}
							disabled={loading || !canProceed()}
							isLoading={loading}
							aria-label={primaryLabel}
							className="min-h-11"
						>
							{primaryLabel}
						</Button>
						<Button variant="ghost" onClick={handleBack} aria-label="Go back to previous step" className="min-h-11">
							Back
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
}
