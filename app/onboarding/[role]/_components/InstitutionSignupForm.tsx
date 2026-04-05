'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, ProgressIndicator } from '@/components/ui';
import { toast } from 'sonner';
import { useEmailCheck } from '@/lib/useEmailCheck';
import { OnboardingFormData } from '@/lib/types';

const steps = ['Name', 'Admin', 'Email'];

const initialForm: OnboardingFormData = {
	type: null,
	name: '',
	tagline: '',
	city: '',
	country: '',
	countryCode: '',
	operatingMode: null,
	startupsSupported: 0,
	studentsMentored: 0,
	fundingFacilitated: 0,
	fundingCurrency: 'USD',
	sdgFocus: [],
	sectorFocus: [],
	logo: null,
	website: '',
	linkedin: '',
	email: '',
	phone: '',
	description: '',
	legalDocuments: [],
};

export function InstitutionSignupForm() {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<OnboardingFormData>(initialForm);
	const [email, setEmail] = useState('');
	const [adminName, setAdminName] = useState('');
	const [adminPhone, setAdminPhone] = useState('');
	const [appCreating, setAppCreating] = useState(false);

	const { checking: emailChecking, result: emailCheckResult } = useEmailCheck(email, 'signup');
	const emailTaken = emailCheckResult?.exists && !emailCheckResult?.canProceed;
	const emailClear = email.trim().length > 4 && email.includes('@') && !emailChecking && emailCheckResult !== null && !emailTaken;

	const canProceed = () => {
		switch (step) {
			case 0: return form.name.trim().length > 0;
			case 1: return adminName.trim().length > 0;
			case 2: return emailClear && !!form.name && !!adminName;
			default: return false;
		}
	};

	const goNext = async () => {
		if (!canProceed()) return;

		if (step === 2) {
			setAppCreating(true);
			try {
				const res = await fetch('/api/institution-applications', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: form.name,
						email: email.trim().toLowerCase(),
						adminName: adminName.trim(),
						adminPhone: adminPhone.trim(),
					}),
				});
				const payload = await res.json();
				if (!res.ok) throw new Error(payload.message || 'Failed to create application');

				// Send verification link
				const linkRes = await fetch('/api/auth/magic-link/send/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: email.trim().toLowerCase(),
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
				toast.success('Application submitted! Check your email to verify your address, then log in.');
				router.push('/login');
			} catch (err) {
				toast.error((err as Error).message);
			} finally {
				setAppCreating(false);
			}
			return;
		}

		if (step < steps.length - 1) {
			setStep((s) => s + 1);
		}
	};

	const goPrev = () => setStep((s) => Math.max(0, s - 1));

	return (
		<Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
			<ProgressIndicator currentStep={step + 1} totalSteps={steps.length} />

			{step === 0 && (
				<div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
					<div className="text-center space-y-2 mb-6">
						<h2 className="text-xl font-semibold text-(--primary)">What&apos;s your institution name?</h2>
						<p className="text-sm text-(--secondary)">We&apos;ll use this for your profile.</p>
					</div>
					<Input
						label="Institution Name"
						value={form.name}
						onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
						required
						autoFocus
						aria-label="Institution name"
						aria-required="true"
					/>
					<div className="flex justify-end pt-4">
						<Button
							onClick={() => goNext()}
							disabled={!canProceed()}
							aria-label="Continue to admin details"
							className="min-w-30 min-h-11"
						>
							Continue
						</Button>
					</div>
				</div>
			)}

			{step === 1 && (
				<div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
					<div className="text-center space-y-2 mb-6">
						<h2 className="text-xl font-semibold text-(--primary)">Hello! Admin</h2>
						<p className="text-sm text-(--secondary)">As the institution admin, we need your personal details.</p>
					</div>
					<Input
						label="Admin Name"
						value={adminName}
						onChange={(e) => setAdminName(e.target.value)}
						required
						autoFocus
						aria-label="Admin name"
						aria-required="true"
					/>
					<Input
						label="Admin Contact Number (optional)"
						type="tel"
						value={adminPhone}
						onChange={(e) => setAdminPhone(e.target.value)}
						aria-label="Admin contact number"
					/>
					<div className="flex flex-wrap gap-3 pt-4">
						<Button
							onClick={() => goNext()}
							disabled={!canProceed()}
							aria-label="Continue to email verification"
							className="min-w-30 min-h-11"
						>
							Continue
						</Button>
						<Button variant="ghost" onClick={goPrev} aria-label="Go back to previous step" className="min-h-11">
							Back
						</Button>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
					<div className="text-center space-y-2 mb-6">
						<h2 className="text-xl font-semibold text-(--primary)">Verify your email address</h2>
						<p className="text-sm text-(--secondary)">We&apos;ll send you a secure link to confirm your identity.</p>
					</div>
					<Input
						label="Work Email Address"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						autoFocus
						autoComplete="email"
						aria-label="Work email address"
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
							onClick={goNext}
							disabled={appCreating || !emailClear || !form.name || !adminName}
							isLoading={appCreating}
							aria-label="Verify email"
							className="min-h-11"
						>
							{appCreating ? 'Sending email...' : 'Verify Email'}
						</Button>
						<Button variant="ghost" onClick={goPrev} disabled={appCreating} aria-label="Go back to previous step" className="min-h-11">
							Back
						</Button>
					</div>
				</div>
			)}


		</Card>
	);
}
