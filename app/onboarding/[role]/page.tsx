'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { OnboardingRoleSelect, type OnboardingRole } from '@/components/ui/OnboardingRoleSelect';
import { toast } from 'sonner';
import { AppIcon } from '@/components/ui/AppIcon';
import { COMPLETION_STEPS } from './_lib/constants';
import { useFlowInitialization } from './_lib/useFlowInitialization';
import { useStepNavigation } from './_lib/useStepNavigation';
import { SignupForm } from './_components/SignupForm';
import { StepProgressBar } from './_components/StepProgressBar';
import { CompletionStepContent } from './_components/CompletionStepContent';
import { InstitutionSignupForm } from './_components/InstitutionSignupForm';
import { MentorSignupForm } from './_components/MentorSignupForm';

const VALID_ROLES: OnboardingRole[] = ['startup', 'institution', 'mentor'];

const STEP_GUIDANCE: Record<number, { title: string; intro: string; checklist: string[] }> = {
	1: {
		title: 'Identity Guidelines',
		intro: 'Set the public brand basics.',
		checklist: [
			'Use your registered or commonly used name.',
			'Keep the tagline short and specific.',
			'Upload a square logo.',
		],
	},
	2: {
		title: 'Team Guidelines',
		intro: 'Build credibility with clear team info.',
		checklist: [
			'Primary founder name is required.',
			'Only add members you want visible publicly.',
			'Use valid emails and concise titles.',
		],
	},
	3: {
		title: 'Market Position Guidelines',
		intro: 'Help investors and mentors find you.',
		checklist: [
			'Select the sector matching your product.',
			'Pick your actual current stage.',
			'These fields affect recommendations.',
		],
	},
	4: {
		title: 'Intent Guidelines',
		intro: 'Tell us what outcomes matter most.',
		checklist: [
			'Select reasons that reflect your immediate goals.',
			'If you choose Other, add context.',
			'These personalize your opportunities.',
		],
	},
};

const ROLE_SUBTITLES: Record<OnboardingRole, string> = {
	startup: 'Start with your startup name and email verification. You can finish the rest after login.',
	institution: 'Set up your profile. Request verification anytime after.',
	mentor: 'Create your mentor profile to start guiding founders.',
};

export default function OnboardingPage() {
	const params = useParams<{ role: string }>();
	const initialRole = VALID_ROLES.includes(params.role as OnboardingRole)
		? (params.role as OnboardingRole)
		: null;

	if (!initialRole) notFound();

	const [activeRole, setActiveRole] = useState<OnboardingRole>(initialRole);

	// --- Startup-specific hooks (only active when role is startup) ---
	const {
		existingStartupId, isInitializingFlow, isMounted,
		isCompletionFlow,
	} = useFlowInitialization();

	const nav = useStepNavigation({
		isCompletionFlow,
		existingStartupId,
		emailVerified: false,
		setFeedback: () => { },
	});

	const [mobilePanel, setMobilePanel] = useState<'form' | 'guide'>('form');

	const containerWidthClass = isCompletionFlow ? 'max-w-[1480px]' : 'max-w-2xl';
	const currentGuide = useMemo(() => STEP_GUIDANCE[nav.currentStep], [nav.currentStep]);

	useEffect(() => {
		if (nav.error) {
			toast.error(nav.error);
			nav.setError(null);
		}
	}, [nav.error]);

	// --- Role switch handler ---
	const handleRoleChange = (role: OnboardingRole) => {
		setActiveRole(role);
		window.history.replaceState(null, '', `/onboarding/${role}`);
	};

	if (!isMounted) return null;

	// Startup completion flow — completely different layout
	if (activeRole === 'startup' && isCompletionFlow) {
		return (
			<div className="min-h-screen bg-linear-to-br from-(--surface-hover) via-background to-(--surface-pressed)/70 flex flex-col">
				<OnboardingNavbar showLogout />

				<div className="flex-1 py-5 sm:py-7 px-3 sm:px-6 lg:px-8 xl:px-10">
					<div className="max-w-370 mx-auto w-full">
						<div className="mb-4 sm:mb-6 rounded-2xl border border-(--border) bg-(--surface) px-4 py-4 sm:px-6 sm:py-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div className="max-w-3xl">
									<p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--secondary)">Startup Onboarding</p>
									<h1 className="mt-1.5 text-xl sm:text-3xl lg:text-4xl font-semibold text-(--primary) tracking-tight leading-tight">
										Complete your Startup Profile
									</h1>
									<p className="mt-2 text-xs sm:text-base text-(--secondary)">
										Work in a focused form panel while keeping guidance separate and easy to reference.
									</p>
								</div>
								<div className="inline-flex items-center gap-2 self-start rounded-full border border-(--border) bg-(--surface-pressed) px-3 py-1.5">
									<span className="h-2 w-2 rounded-full bg-(--primary-light)" />
									<span className="text-xs font-semibold text-(--primary)">Step {nav.currentStep} of {COMPLETION_STEPS.length}</span>
								</div>
							</div>
							<div className="mt-5 border-t border-(--border) pt-5">
								<StepProgressBar currentStep={nav.currentStep} />
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 sm:gap-6 items-start">
							<aside className="hidden lg:block sticky top-20 space-y-4">
								<div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
									<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Guidelines</p>
									<h3 className="mt-1 text-base font-semibold text-(--primary)">{currentGuide.title}</h3>
									<p className="mt-1.5 text-sm text-(--secondary)">{currentGuide.intro}</p>
									<ul className="mt-3 space-y-2.5">
										{currentGuide.checklist.map((item) => (
											<li key={item} className="flex items-start gap-2 text-sm text-(--primary-light)">
												<AppIcon name="check" className="h-4 w-4 text-emerald-600 mt-0.5" />
												<span>{item}</span>
											</li>
										))}
									</ul>
								</div>
							</aside>

							<div className="space-y-4">
								<div className="lg:hidden rounded-2xl border border-(--border) bg-(--surface) p-2">
									<div className="grid grid-cols-2 gap-2">
										<button
											type="button"
											onClick={() => setMobilePanel('form')}
											className={`rounded-xl px-3 py-2 text-sm font-medium transition ${mobilePanel === 'form' ? 'bg-(--primary) text-(--primary)' : 'bg-(--surface-pressed) text-(--primary-light)'}`}
										>
											Form
										</button>
										<button
											type="button"
											onClick={() => setMobilePanel('guide')}
											className={`rounded-xl px-3 py-2 text-sm font-medium transition ${mobilePanel === 'guide' ? 'bg-(--primary) text-(--primary)' : 'bg-(--surface-pressed) text-(--primary-light)'}`}
										>
											Guidelines
										</button>
									</div>
								</div>

								{mobilePanel === 'guide' && (
									<div className="lg:hidden rounded-2xl border border-(--border) bg-(--surface) p-4">
										<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Guidelines</p>
										<h3 className="mt-1 text-base font-semibold text-(--primary)">{currentGuide.title}</h3>
										<p className="mt-1.5 text-sm text-(--secondary)">{currentGuide.intro}</p>
										<ul className="mt-3 space-y-2.5">
											{currentGuide.checklist.map((item) => (
												<li key={item} className="flex items-start gap-2 text-sm text-(--primary-light)">
													<AppIcon name="check" className="h-4 w-4 text-emerald-600 mt-0.5" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</div>
								)}

								{mobilePanel === 'form' && (
									<>
										<div className="bg-(--surface) border border-(--border) rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.08)] overflow-hidden">
											<CompletionStepContent
												currentStep={nav.currentStep}
												data={nav.data}
												updateData={nav.updateData}
												toggleWhyXentro={nav.toggleWhyXentro}
											/>
											<div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between border-t border-(--border) bg-(--surface-hover)/65">
												<Button
													type="button"
													variant="secondary"
													onClick={() => { setMobilePanel('form'); nav.handleBack(); }}
													disabled={nav.currentStep === 1 || nav.isSubmitting}
												>
													Back
												</Button>
												<Button
													type="button"
													onClick={() => { setMobilePanel('form'); nav.handleNext(); }}
													disabled={nav.isSubmitting || !nav.canContinue()}
													isLoading={nav.isSubmitting}
												>
													{nav.currentStep === COMPLETION_STEPS.length ? 'Finish Setup' : 'Continue'}
												</Button>
											</div>
										</div>
									</>
								)}
							</div>
						</div>

						<p className="text-center text-xs text-(--secondary) mt-6 sm:mt-7">
							Your progress is automatically saved.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Startup initializing spinner
	if (activeRole === 'startup' && isInitializingFlow) {
		return (
			<div className="min-h-screen bg-linear-to-br from-(--surface-hover) via-background to-(--surface-pressed)/40 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
			</div>
		);
	}

	// --- Shared signup layout for all roles ---
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<OnboardingNavbar />

			<main className="flex-1 py-8 sm:py-12 md:py-16 px-3 sm:px-4" role="main">
				<div className={`${containerWidthClass} mx-auto space-y-6 sm:space-y-8`}>
					<div className="text-center space-y-1.5 sm:space-y-2">
						<h1 className="text-2xl sm:text-3xl font-bold text-(--primary)">
							<OnboardingRoleSelect current={activeRole} onChange={handleRoleChange} className='text-[#3B82F6]' />
						</h1>
						<p className="text-sm sm:text-base text-(--secondary) max-w-2xl mx-auto">
							{ROLE_SUBTITLES[activeRole]}
						</p>
					</div>

					{activeRole === 'startup' && <SignupForm />}

					{activeRole === 'institution' && <InstitutionSignupForm />}

					{activeRole === 'mentor' && <MentorSignupForm />}
				</div>
			</main>
		</div>
	);
}
