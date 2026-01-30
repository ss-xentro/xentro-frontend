'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { StartupIdentitySection } from '@/components/onboarding/startup/StartupIdentitySection';
import { CompanyDetailsSection } from '@/components/onboarding/startup/CompanyDetailsSection';
import { FoundersSection } from '@/components/onboarding/startup/FoundersSection';
import { FundingSection } from '@/components/onboarding/startup/FundingSection';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils'; // Assuming this exists

const steps = [
    { id: 1, title: 'Identity', description: 'Name & Pitch' },
    { id: 2, title: 'Details', description: 'Stage & Status' },
    { id: 3, title: 'Founders', description: 'Team & Roles' },
    { id: 4, title: 'Funding', description: 'History & Investors' },
];

export default function StartupOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep, data, reset } = useStartupOnboardingStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hydration fix for Zustand persist
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length) {
            setStep(currentStep + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/founder/startups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create startup');
            }

            // Success
            reset(); // Clear store
            router.push('/dashboard'); // Redirect to dashboard
        } catch (err: any) {
            console.error('Startup creation error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null; // Prevent hydration mismatch

    return (
        <div className="min-h-screen bg-(--background) py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-(--primary) tracking-tight">
                        Create your Startup Profile
                    </h1>
                    <p className="mt-2 text-lg text-(--secondary)">
                        Launch your presence on XENTRO in minutes.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-(--border) -z-10" />
                    <div className="flex justify-between">
                        {steps.map((step) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center bg-(--background) px-2">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-200",
                                            isActive
                                                ? "bg-accent text-white ring-4 ring-(--accent-subtle)"
                                                : isCompleted
                                                    ? "bg-accent text-white"
                                                    : "bg-(--surface-hover) text-(--secondary)"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "mt-2 text-xs font-medium transition-colors duration-200",
                                            isActive ? "text-(--primary)" : "text-(--secondary)"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* content Card */}
                <div className="bg-(--surface) border border-(--border) rounded-2xl shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6 text-(--primary)">
                        {steps[currentStep - 1].description}
                    </h2>

                    {currentStep === 1 && <StartupIdentitySection />}
                    {currentStep === 2 && <CompanyDetailsSection />}
                    {currentStep === 3 && <FoundersSection />}
                    {currentStep === 4 && <FundingSection />}

                    {error && (
                        <div className="mt-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Navigation Actions */}
                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-(--border)">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleBack}
                            disabled={currentStep === 1 || isSubmitting}
                        >
                            Back
                        </Button>

                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            {currentStep === steps.length ? 'Create Startup' : 'Continue'}
                        </Button>
                    </div>
                </div>

                <p className="text-center text-xs text-(--secondary) mt-6">
                    Your progress is automatically saved.
                </p>
            </div>
        </div>
    );
}
