'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { COMPLETION_STEPS } from './_lib/constants';
import { useFlowInitialization } from './_lib/useFlowInitialization';
import { useEmailVerification } from './_lib/useEmailVerification';
import { useStepNavigation } from './_lib/useStepNavigation';
import { SignupForm } from './_components/SignupForm';
import { StepProgressBar } from './_components/StepProgressBar';
import { CompletionStepContent } from './_components/CompletionStepContent';


export default function StartupOnboardingPage() {
    const {
        flowMode, existingStartupId, isInitializingFlow, isMounted,
        isCompletionFlow, setResetVerificationCallback,
    } = useFlowInitialization();

    const email = useEmailVerification(isCompletionFlow);

    const nav = useStepNavigation({
        isCompletionFlow,
        existingStartupId,
        emailVerified: email.emailVerified,
        setFeedback: email.setFeedback,
    });

    const containerWidthClass = isCompletionFlow ? 'max-w-[1400px]' : 'max-w-2xl';

    // Wire up the reset callback so flow init can clear email state
    useEffect(() => {
        setResetVerificationCallback(email.resetVerificationState);
    }, [setResetVerificationCallback, email.resetVerificationState]);

    if (!isMounted) return null;
    if (isInitializingFlow) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100/70 flex flex-col">
            <OnboardingNavbar showLogout={isCompletionFlow} />

            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 xl:px-10">
                <div className={`${containerWidthClass} mx-auto w-full`}>
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 rounded-2xl border border-(--border) bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--secondary)">Startup Onboarding</p>
                                <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold text-(--primary) tracking-tight leading-tight">
                                    {isCompletionFlow ? 'Complete your Startup Profile' : 'Create your Startup Account'}
                                </h1>
                                <p className="mt-2 text-sm sm:text-base text-(--secondary)">
                                    {isCompletionFlow
                                        ? 'Finish the remaining onboarding steps after login.'
                                        : 'Start with your startup name and email verification. You can finish the rest after login.'}
                                </p>
                            </div>

                            {isCompletionFlow && (
                                <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-slate-100 px-3.5 py-1.5">
                                    <span className="h-2 w-2 rounded-full bg-slate-700" />
                                    <span className="text-xs font-semibold text-slate-800">Step {nav.currentStep} of {COMPLETION_STEPS.length}</span>
                                </div>
                            )}
                        </div>

                        {isCompletionFlow && (
                            <div className="mt-5 border-t border-(--border) pt-5">
                                <StepProgressBar currentStep={nav.currentStep} />
                            </div>
                        )}
                    </div>

                    {/* Card Content */}
                    <div className="bg-white border border-(--border) rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.08)] overflow-hidden">
                        {!isCompletionFlow && (
                            <SignupForm
                                name={nav.data.name}
                                email={nav.data.primaryContactEmail}
                                onNameChange={value => nav.updateData({ name: value })}
                                onEmailChange={email.handleEmailChange}
                                emailExists={email.emailExists}
                                emailChecking={email.emailChecking}
                                magicLinkSent={email.magicLinkSent}
                                emailVerified={email.emailVerified}
                                emailLoading={email.emailLoading}
                                onSendMagicLink={email.handleSendMagicLink}
                                onCheckVerification={email.handleCheckVerification}
                            />
                        )}

                        {isCompletionFlow && (
                            <CompletionStepContent
                                currentStep={nav.currentStep}
                                data={nav.data}
                                updateData={nav.updateData}
                                toggleWhyXentro={nav.toggleWhyXentro}
                            />
                        )}

                        {/* Error / Feedback */}
                        {(nav.error || email.feedback) && (
                            <div className="px-6 md:px-8 pb-4 border-t border-(--border) bg-rose-50/40">
                                {nav.error && <FeedbackBanner type="error" message={nav.error} onDismiss={() => nav.setError(null)} />}
                                {email.feedback && !nav.error && (
                                    <FeedbackBanner type={email.feedback.type} message={email.feedback.message} onDismiss={() => email.setFeedback(null)} />
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="px-6 md:px-8 py-5 md:py-6 flex items-center justify-between border-t border-(--border) bg-slate-50/65">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={nav.handleBack}
                                disabled={!isCompletionFlow || nav.currentStep === 1 || nav.isSubmitting}
                            >
                                Back
                            </Button>

                            {(!isCompletionFlow || nav.currentStep !== COMPLETION_STEPS.length || nav.canContinue()) && (
                                <Button
                                    type="button"
                                    onClick={nav.handleNext}
                                    disabled={nav.isSubmitting || !nav.canContinue()}
                                    isLoading={nav.isSubmitting}
                                >
                                    {!isCompletionFlow ? 'Continue to Login' : nav.currentStep === COMPLETION_STEPS.length ? 'Finish Setup' : 'Continue'}
                                </Button>
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
