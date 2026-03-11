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

    // Wire up the reset callback so flow init can clear email state
    useEffect(() => {
        setResetVerificationCallback(email.resetVerificationState);
    }, [setResetVerificationCallback, email.resetVerificationState]);

    if (!isMounted) return null;
    if (isInitializingFlow) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30 flex flex-col">
            <OnboardingNavbar showLogout={isCompletionFlow} />

            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-(--primary) tracking-tight">
                            {isCompletionFlow ? 'Complete your Startup Profile' : 'Create your Startup Account'}
                        </h1>
                        <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-(--secondary)">
                            {isCompletionFlow
                                ? 'Finish the remaining onboarding steps after login.'
                                : 'Start with your startup name and email verification. You can finish the rest after login.'}
                        </p>
                    </div>

                    {isCompletionFlow && <StepProgressBar currentStep={nav.currentStep} />}

                    {/* Card Content */}
                    <div className="bg-white border border-(--border) rounded-2xl shadow-sm overflow-hidden">
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
                            <div className="px-6 md:px-8 pb-4">
                                {nav.error && <FeedbackBanner type="error" message={nav.error} onDismiss={() => nav.setError(null)} />}
                                {email.feedback && !nav.error && (
                                    <FeedbackBanner type={email.feedback.type} message={email.feedback.message} onDismiss={() => email.setFeedback(null)} />
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 flex items-center justify-between border-t border-(--border) mt-2">
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

                    <p className="text-center text-xs text-(--secondary) mt-6">
                        Your progress is automatically saved.
                    </p>
                </div>
            </div>
        </div>
    );
}
