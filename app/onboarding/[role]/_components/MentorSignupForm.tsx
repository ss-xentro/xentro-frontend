'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, ProgressIndicator } from '@/components/ui';
import { EmailVerificationStep, useEmailVerification } from '@/components/ui/EmailVerificationStep';
import { toast } from 'sonner';

const TOTAL_STEPS = 2;

export function MentorSignupForm() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ name: '', email: '' });

	const emailVerification = useEmailVerification({
		email: form.email,
		name: form.name,
		purpose: 'signup',
	});

	const updateField = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const canProceed = () => {
		switch (step) {
			case 1: return form.name.trim().length > 0;
			case 2: return form.email.trim().length > 0 && emailVerification.verified;
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
			const nameParts = form.name.trim().split(/\s+/);
			const firstName = nameParts[0] || '';
			const lastName = nameParts.slice(1).join(' ') || '';

			const res = await fetch('/api/mentors/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: form.email,
					display_name: form.name.trim(),
					firstName,
					lastName,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Application failed');

			toast.success('Account created. Continue to login to finish mentor onboarding.');
			setTimeout(() => router.push('/login'), 2000);
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		setStep((prev) => Math.max(1, prev - 1));
	};

	const stepTitles = ['Your name', 'Verify email'];
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
						<h2 className="text-xl font-semibold text-(--primary)">What&apos;s your name?</h2>
						<p className="text-sm text-(--secondary)">We&apos;ll use this for your mentor profile.</p>
					</div>
					<Input
						label="Full name"
						value={form.name}
						onChange={(e) => updateField('name', e.target.value)}
						autoFocus
						required
						aria-label="Full name"
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
						<p className="text-sm text-(--secondary)">We&apos;ll send you a secure link to confirm your identity.</p>
					</div>
					<Input
						label="Work email"
						type="email"
						value={form.email}
						onChange={(e) => updateField('email', e.target.value)}
						autoFocus
						required
						aria-label="Work email address"
						aria-required="true"
					/>
					<EmailVerificationStep
						email={form.email}
						verified={emailVerification.verified}
						magicLinkSent={emailVerification.magicLinkSent}
						loading={emailVerification.loading}
						onSendMagicLink={emailVerification.sendMagicLink}
						onCheckVerification={emailVerification.checkVerification}
					/>
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
