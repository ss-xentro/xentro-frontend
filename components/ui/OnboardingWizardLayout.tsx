'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { InlineFeedback } from '@/components/ui/FeedbackBanner';

type Feedback = { type: 'success' | 'error'; message: string } | null;

interface OnboardingWizardLayoutProps {
	/** Main title, e.g. "Investor onboarding" */
	title: React.ReactNode;
	/** Current step subtitle */
	subtitle?: string;
	/** 1-based current step index */
	currentStep: number;
	/** Total number of steps */
	totalSteps: number;
	/** Step content rendered inside the card body */
	children: React.ReactNode;
	/** Feedback banner shown below the step content */
	feedback?: Feedback;
	/** Called when "Back" is clicked */
	onBack: () => void;
	/** Called when the primary button is clicked */
	onNext: () => void;
	/** Label for the primary button. If empty/undefined, the button is hidden. */
	primaryLabel?: string;
	/** Disable all navigation */
	loading?: boolean;
	/** Disable primary button independently */
	canProceed?: boolean;
	/** Extra footer content (e.g. "Already have an account?") */
	footer?: React.ReactNode;
	className?: string;
}

/**
 * Reusable wizard layout for all onboarding flows.
 * Wraps ProgressIndicator + step content + Back/Continue buttons.
 * Replaces identical Card layouts in investor-onboarding, mentor-signup, institution-onboarding, etc.
 */
export function OnboardingWizardLayout({
	title,
	subtitle,
	currentStep,
	totalSteps,
	children,
	feedback,
	onBack,
	onNext,
	primaryLabel = 'Continue',
	loading = false,
	canProceed = true,
	footer,
	className,
}: OnboardingWizardLayoutProps) {
	return (
		<main className="flex-1 px-3 sm:px-4 py-6 sm:py-10 flex items-center justify-center">
			<Card className={cn('w-full max-w-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-lg bg-(--surface)/90 backdrop-blur animate-fadeInUp', className)}>
				<div className="flex flex-col gap-1.5 sm:gap-2">
					<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-(--primary)">{title}</h1>
					{subtitle && <p className="text-xs sm:text-sm text-(--secondary)">{subtitle}</p>}
				</div>

				<ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

				<div className="bg-(--surface-hover) border border-(--border) rounded-lg p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
					{children}
				</div>

				{feedback && (
					<InlineFeedback type={feedback.type} message={feedback.message} />
				)}

				<div className="flex items-center justify-between gap-3">
					<Button variant="ghost" onClick={onBack} disabled={currentStep === 1 || loading}>
						Back
					</Button>
					{primaryLabel && (
						<Button onClick={onNext} disabled={loading || !canProceed}>
							{primaryLabel}
						</Button>
					)}
				</div>

				{footer}
			</Card>
		</main>
	);
}
