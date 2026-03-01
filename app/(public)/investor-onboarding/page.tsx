"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Input, ProgressIndicator, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const TOTAL_STEPS = 5;

export default function InvestorOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        firmName: '',
        investmentStages: '',
        checkSizeMin: '',
        checkSizeMax: '',
        sectors: '',
        portfolioCompanies: '',
        notableInvestments: '',
        dealFlowPreferences: '',
        linkedinUrl: '',
    });

    const updateField = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setFeedback(null);
    };

    // Auto-submit investor application when email is verified
    useEffect(() => {
        if (!verified || submitted) return;

        const submitApplication = async () => {
            try {
                const nameParts = form.name.trim().split(/\s+/);
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const res = await fetch('/api/investors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: form.email,
                        firstName,
                        lastName,
                        firmName: form.firmName || null,
                        checkSizeMin: form.checkSizeMin ? Number(form.checkSizeMin) : null,
                        checkSizeMax: form.checkSizeMax ? Number(form.checkSizeMax) : null,
                        investmentStages: form.investmentStages
                            ? form.investmentStages.split(',').map(s => s.trim()).filter(Boolean)
                            : [],
                        sectors: form.sectors
                            ? form.sectors.split(',').map(s => s.trim()).filter(Boolean)
                            : [],
                        portfolioCompanies: form.portfolioCompanies
                            ? form.portfolioCompanies.split('\n').filter(Boolean)
                            : [],
                        notableInvestments: form.notableInvestments
                            ? form.notableInvestments.split('\n').filter(Boolean)
                            : [],
                        dealFlowPreferences: form.dealFlowPreferences || null,
                        linkedinUrl: form.linkedinUrl || null,
                    }),
                });

                const contentType = res.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    throw new Error('Server is not ready yet. Please try again later.');
                }

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Registration failed');

                setSubmitted(true);
                setFeedback({ type: 'success', message: 'Application submitted! Redirecting to login…' });

                // Start countdown after successful submission
                setCountdown(5);
                countdownRef.current = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev === null || prev <= 1) {
                            clearInterval(countdownRef.current!);
                            router.push('/login');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (error) {
                setFeedback({ type: 'error', message: (error as Error).message });
            }
        };

        submitApplication();
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [verified, submitted, form, router]);

    const canProceed = () => {
        switch (step) {
            case 1:
                return form.name.trim() && form.email.trim();
            case 2:
                return form.investmentStages.trim() || form.sectors.trim();
            case 3:
                return true; // Portfolio is optional
            case 4:
                return true; // Preferences are optional
            case 5:
                return verified;
            default:
                return false;
        }
    };

    const handleSendMagicLink = async () => {
        setLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/send/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    name: form.name,
                    purpose: 'signup',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Failed to send verification link');
            setMagicLinkSent(true);
            setFeedback({ type: 'success', message: `Verification link sent to ${form.email}` });
        } catch (error) {
            setFeedback({ type: 'error', message: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/status/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verification check failed');

            if (data.verified) {
                setVerified(true);
                setFeedback({ type: 'success', message: 'Email verified!' });
            } else {
                setFeedback({ type: 'error', message: 'Not verified yet. Check your email and click the link.' });
            }
        } catch (error) {
            setFeedback({ type: 'error', message: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (!canProceed()) {
            setFeedback({ type: 'error', message: 'Please complete the required fields to continue.' });
            return;
        }

        if (step < TOTAL_STEPS) {
            setStep((prev) => prev + 1);
            setFeedback(null);
            return;
        }
    };

    const handleBack = () => {
        setFeedback(null);
        setStep((prev) => Math.max(1, prev - 1));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-1 mb-2">
                            <h2 className="text-xl font-semibold text-(--primary)">Your basics</h2>
                            <p className="text-sm text-(--secondary)">Let us know who you are.</p>
                        </div>
                        <Input
                            label="Full name"
                            placeholder="Alex Morgan"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            autoFocus
                            required
                        />
                        <Input
                            label="Work email"
                            type="email"
                            placeholder="you@firm.com"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            required
                        />
                        <Input
                            label="Firm / Fund name (optional)"
                            placeholder="Sequoia Capital"
                            value={form.firmName}
                            onChange={(e) => updateField('firmName', e.target.value)}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-1 mb-2">
                            <h2 className="text-xl font-semibold text-(--primary)">Investment profile</h2>
                            <p className="text-sm text-(--secondary)">Tell us about your investment thesis.</p>
                        </div>
                        <Input
                            label="Investment stages"
                            placeholder="Pre-seed, Seed, Series A"
                            value={form.investmentStages}
                            onChange={(e) => updateField('investmentStages', e.target.value)}
                            autoFocus
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Min check size (USD)"
                                type="number"
                                placeholder="25000"
                                value={form.checkSizeMin}
                                onChange={(e) => updateField('checkSizeMin', e.target.value)}
                            />
                            <Input
                                label="Max check size (USD)"
                                type="number"
                                placeholder="500000"
                                value={form.checkSizeMax}
                                onChange={(e) => updateField('checkSizeMax', e.target.value)}
                            />
                        </div>
                        <Input
                            label="Focus sectors"
                            placeholder="SaaS, FinTech, HealthTech, AI/ML"
                            value={form.sectors}
                            onChange={(e) => updateField('sectors', e.target.value)}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="space-y-1 mb-2">
                            <h2 className="text-xl font-semibold text-(--primary)">Portfolio highlights</h2>
                            <p className="text-sm text-(--secondary)">Share your track record (optional).</p>
                        </div>
                        <Textarea
                            label="Portfolio companies (one per line)"
                            placeholder="Stripe — Series A, 2019&#10;Notion — Seed, 2018"
                            rows={4}
                            value={form.portfolioCompanies}
                            onChange={(e) => updateField('portfolioCompanies', e.target.value)}
                            autoFocus
                        />
                        <Textarea
                            label="Notable investments / exits"
                            placeholder="Led $5M Series A for Acme Corp (10x return)"
                            rows={3}
                            value={form.notableInvestments}
                            onChange={(e) => updateField('notableInvestments', e.target.value)}
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="space-y-1 mb-2">
                            <h2 className="text-xl font-semibold text-(--primary)">Preferences</h2>
                            <p className="text-sm text-(--secondary)">Help us curate the best deal flow for you.</p>
                        </div>
                        <Textarea
                            label="Deal flow preferences"
                            placeholder="Looking for B2B SaaS with $1M+ ARR, strong founder-market fit"
                            rows={3}
                            value={form.dealFlowPreferences}
                            onChange={(e) => updateField('dealFlowPreferences', e.target.value)}
                            autoFocus
                        />
                        <Input
                            label="LinkedIn profile URL"
                            placeholder="https://linkedin.com/in/yourname"
                            value={form.linkedinUrl}
                            onChange={(e) => updateField('linkedinUrl', e.target.value)}
                        />
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-5">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                                {verified ? (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>

                            {verified ? (
                                <>
                                    <h3 className="text-lg font-semibold text-green-700 mb-1">Email verified!</h3>
                                    <p className="text-sm text-(--secondary)">
                                        Redirecting to login in <strong>{countdown ?? 0}</strong> second{countdown !== 1 ? 's' : ''}…
                                    </p>
                                </>
                            ) : magicLinkSent ? (
                                <>
                                    <h3 className="text-lg font-semibold text-(--primary) mb-1">Check your inbox</h3>
                                    <p className="text-sm text-(--secondary)">
                                        We sent a verification link to <strong>{form.email}</strong>.<br />
                                        Click the link in the email, then come back here.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-(--primary) mb-1">Verify your email</h3>
                                    <p className="text-sm text-(--secondary)">
                                        We&apos;ll send a verification link to <strong>{form.email}</strong>
                                    </p>
                                </>
                            )}
                        </div>

                        {verified ? (
                            <div className="flex flex-col items-center gap-3 py-2">
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Verified
                                </div>
                                <div className="w-full bg-(--border) rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${((countdown ?? 0) / 5) * 100}%` }} />
                                </div>
                            </div>
                        ) : !magicLinkSent ? (
                            <Button onClick={handleSendMagicLink} disabled={loading} isLoading={loading} className="w-full">
                                {loading ? 'Sending…' : 'Send verification link'}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button onClick={handleCheckVerification} disabled={loading} isLoading={loading} className="w-full">
                                    {loading ? 'Checking…' : 'I\'ve clicked the link'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={handleSendMagicLink}
                                    disabled={loading}
                                    className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                                >
                                    Resend verification link
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const stepTitles = ['Your basics', 'Investment profile', 'Portfolio', 'Preferences', 'Verify email'];
    const isLastStep = step === TOTAL_STEPS;
    const primaryLabel = isLastStep
        ? (verified ? (loading ? 'Submitting…' : 'Submit for review') : '')
        : 'Continue';

    return (
        <div className="min-h-screen bg-(--surface) flex flex-col">
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

            <main className="flex-1 px-4 py-10 flex items-center justify-center">
                <Card className="w-full max-w-3xl p-6 md:p-8 space-y-6 shadow-lg bg-white/90 backdrop-blur animate-fadeInUp">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-(--primary)">Investor onboarding</h1>
                        <p className="text-sm text-(--secondary)">{stepTitles[step - 1]}</p>
                    </div>

                    <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

                    <div className="bg-(--surface-hover) border border-(--border) rounded-lg p-5 md:p-6 space-y-4">
                        {renderStep()}
                    </div>

                    {feedback && (
                        <div
                            className={cn(
                                'rounded-lg px-4 py-3 text-sm border',
                                feedback.type === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            )}
                        >
                            {feedback.message}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading}>
                            Back
                        </Button>
                        {/* Hide the main action button on step 5 until verified */}
                        {(step < TOTAL_STEPS || verified) && (
                            <Button onClick={handleNext} disabled={loading || !canProceed()}>
                                {primaryLabel}
                            </Button>
                        )}
                    </div>

                    <p className="text-center text-sm text-(--secondary)">
                        Already have an account?{' '}
                        <a href="/login" className="text-accent hover:underline font-medium">
                            Sign in
                        </a>
                    </p>
                </Card>
            </main>
        </div>
    );
}
