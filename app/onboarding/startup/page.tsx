'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { StartupIdentitySection } from '@/components/onboarding/startup/StartupIdentitySection';
import { CompanyDetailsSection } from '@/components/onboarding/startup/CompanyDetailsSection';
import { FoundersSection } from '@/components/onboarding/startup/FoundersSection';
import { FundingSection } from '@/components/onboarding/startup/FundingSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils'; // Assuming this exists

const onboardingSteps = [
    { id: 1, title: 'Account', description: 'Your Name' },
    { id: 2, title: 'Email', description: 'Verify Email' },
    { id: 3, title: 'Identity', description: 'Name & Pitch' },
    { id: 4, title: 'Details', description: 'Stage & Status' },
    { id: 5, title: 'Founders', description: 'Team & Roles' },
    { id: 6, title: 'Funding', description: 'History & Investors' },
];

export default function StartupOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep, data, updateData, reset } = useStartupOnboardingStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Account step state
    const [founderName, setFounderName] = useState('');
    const [founderEmail, setFounderEmail] = useState('');

    // Email verification state
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);

    // Hydration fix for Zustand persist
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync founder name/email with store on mount
    useEffect(() => {
        if (isMounted && data.founders[0]) {
            if (data.founders[0].name) setFounderName(data.founders[0].name);
            if (data.founders[0].email) setFounderEmail(data.founders[0].email);
        }
    }, [isMounted]);

    const handleSendMagicLink = async () => {
        setEmailLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/send/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: founderEmail,
                    name: founderName,
                    purpose: 'signup',
                }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || resData.message || 'Failed to send verification link');
            setMagicLinkSent(true);
            setFeedback({ type: 'success', message: `Verification link sent to ${founderEmail}` });
        } catch (err) {
            setFeedback({ type: 'error', message: (err as Error).message });
        } finally {
            setEmailLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setEmailLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/status/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: founderEmail }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Verification check failed');

            if (resData.verified) {
                setEmailVerified(true);
                setFeedback({ type: 'success', message: 'Email verified!' });
            } else {
                setFeedback({ type: 'error', message: 'Not verified yet. Check your email and click the link.' });
            }
        } catch (err) {
            setFeedback({ type: 'error', message: (err as Error).message });
        } finally {
            setEmailLoading(false);
        }
    };

    const handleNext = () => {
        setError(null);
        setFeedback(null);

        if (currentStep === 1) {
            // Validate name
            if (!founderName.trim()) {
                setError('Please enter your name.');
                return;
            }
            setStep(currentStep + 1);
            window.scrollTo(0, 0);
            return;
        }

        if (currentStep === 2) {
            // Validate email + verification
            if (!founderEmail.trim()) {
                setError('Please enter your email.');
                return;
            }
            if (!emailVerified) {
                setError('Please verify your email before continuing.');
                return;
            }
            // Sync to store
            updateData({ primaryContactEmail: founderEmail });
            if (data.founders.length > 0) {
                // Update the first founder's name and email
                const updatedFounders = [...data.founders];
                updatedFounders[0] = {
                    ...updatedFounders[0],
                    name: founderName,
                    email: founderEmail,
                };
                updateData({ founders: updatedFounders });
            }
            setStep(currentStep + 1);
            window.scrollTo(0, 0);
            return;
        }

        if (currentStep < onboardingSteps.length) {
            setStep(currentStep + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        setError(null);
        setFeedback(null);
        if (currentStep > 1) {
            setStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('founder_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/founder/startups', {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create startup');
            }

            // Success
            reset(); // Clear store
            router.push('/login'); // Redirect to login after creation
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            console.error('Startup creation error:', err);
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null; // Prevent hydration mismatch

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <Input
                            label="Your Full Name"
                            placeholder="Jordan Patel"
                            value={founderName}
                            onChange={(e) => setFounderName(e.target.value)}
                            autoFocus
                            required
                        />
                        <p className="text-xs text-(--secondary)">This will be used as the primary founder name.</p>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-5 animate-fadeIn">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={founderEmail}
                            onChange={(e) => {
                                setFounderEmail(e.target.value);
                                // Reset verification if email changes
                                if (emailVerified || magicLinkSent) {
                                    setEmailVerified(false);
                                    setMagicLinkSent(false);
                                    setFeedback(null);
                                }
                            }}
                            disabled={emailVerified}
                            required
                        />

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                                {emailVerified ? (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>

                            {emailVerified ? (
                                <div>
                                    <h3 className="text-lg font-semibold text-green-700 mb-1">Email verified!</h3>
                                    <p className="text-sm text-(--secondary)">Click Continue to proceed with your startup profile.</p>
                                </div>
                            ) : magicLinkSent ? (
                                <div>
                                    <h3 className="text-lg font-semibold text-(--primary) mb-1">Check your inbox</h3>
                                    <p className="text-sm text-(--secondary)">
                                        We sent a verification link to <strong>{founderEmail}</strong>.<br />
                                        Click the link in the email, then come back here.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold text-(--primary) mb-1">Verify your email</h3>
                                    <p className="text-sm text-(--secondary)">
                                        We&apos;ll send a verification link to <strong>{founderEmail || 'your email'}</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        {emailVerified ? (
                            <div className="flex flex-col items-center gap-3 py-2">
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Verified
                                </div>
                            </div>
                        ) : !magicLinkSent ? (
                            <Button onClick={handleSendMagicLink} disabled={emailLoading || !founderEmail.trim()} isLoading={emailLoading} className="w-full">
                                {emailLoading ? 'Sending...' : 'Send verification link'}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button onClick={handleCheckVerification} disabled={emailLoading} isLoading={emailLoading} className="w-full">
                                    {emailLoading ? 'Checking...' : "I've clicked the link"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={handleSendMagicLink}
                                    disabled={emailLoading}
                                    className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                                >
                                    Resend verification link
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 3:
                return <StartupIdentitySection />;
            case 4:
                return <CompanyDetailsSection />;
            case 5:
                return <FoundersSection />;
            case 6:
                return <FundingSection />;
            default:
                return null;
        }
    };

    const isLastStep = currentStep === onboardingSteps.length;
    const canContinue = () => {
        if (currentStep === 1) return founderName.trim().length > 0;
        if (currentStep === 2) return emailVerified;
        return true; // other steps validated by the sections themselves
    };

    return (
        <div className="min-h-screen bg-(--background) flex flex-col">
          {/* Minimal Navbar */}
          <nav className="h-16 border-b border-(--border) bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold text-(--primary)">Xentro</span>
              </Link>
              <Link
                href="/join"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit
              </Link>
            </div>
          </nav>

        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
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
                        {onboardingSteps.map((step) => {
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
                        {onboardingSteps[currentStep - 1].description}
                    </h2>

                    {renderStep()}

                    {error && (
                        <div className="mt-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {feedback && (
                        <div
                            className={cn(
                                'mt-4 rounded-lg px-4 py-3 text-sm border',
                                feedback.type === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            )}
                        >
                            {feedback.message}
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

                        {/* Hide Continue on step 2 unless verified */}
                        {(currentStep !== 2 || emailVerified) && (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={isSubmitting || !canContinue()}
                                isLoading={isSubmitting}
                            >
                                {isLastStep ? 'Create Startup' : 'Continue'}
                            </Button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-(--secondary) mt-6">
                    Your progress is automatically saved.
                </p>

                <p className="text-center text-sm text-(--secondary) mt-4">
                    Already have a founder account on XENTRO?{' '}
                    <a href="/login" className="text-accent hover:underline font-medium">
                        Access Dashboard
                    </a>
                </p>
            </div>
        </div>
        </div>
    );
}
