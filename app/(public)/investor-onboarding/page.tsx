"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Textarea } from '@/components/ui';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { OnboardingWizardLayout } from '@/components/ui/OnboardingWizardLayout';
import { EmailVerificationStep, useEmailVerification } from '@/components/ui/EmailVerificationStep';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;

export default function InvestorOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
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
    };

    const emailVerification = useEmailVerification({
        email: form.email,
        name: form.name,
        purpose: 'signup',
    });

    // Auto-submit investor application when email is verified
    useEffect(() => {
        if (!emailVerification.verified || submitted) return;

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
                toast.success('Application submitted! Redirecting to login…');

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
                toast.error((error as Error).message);
            }
        };

        submitApplication();
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [emailVerification.verified, submitted, form, router]);

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
                return emailVerification.verified;
            default:
                return false;
        }
    };

    const handleNext = async () => {
        if (!canProceed()) {
            toast.error('Please complete the required fields to continue.');
            return;
        }

        if (step < TOTAL_STEPS) {
            setStep((prev) => prev + 1);
            return;
        }
    };

    const handleBack = () => {
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
                    <EmailVerificationStep
                        email={form.email}
                        verified={emailVerification.verified}
                        magicLinkSent={emailVerification.magicLinkSent}
                        loading={emailVerification.loading}
                        onSendMagicLink={emailVerification.sendMagicLink}
                        onCheckVerification={emailVerification.checkVerification}
                        countdown={countdown}
                    />
                );
            default:
                return null;
        }
    };

    const stepTitles = ['Your basics', 'Investment profile', 'Portfolio', 'Preferences', 'Verify email'];
    const isLastStep = step === TOTAL_STEPS;
    const primaryLabel = isLastStep
        ? (emailVerification.verified ? (loading ? 'Submitting…' : 'Submit for review') : '')
        : 'Continue';

    const combinedFeedback = emailVerification.feedback || null;

    return (
        <div className="min-h-screen bg-(--surface) flex flex-col">
            <OnboardingNavbar />

            <OnboardingWizardLayout
                title="Investor onboarding"
                subtitle={stepTitles[step - 1]}
                currentStep={step}
                totalSteps={TOTAL_STEPS}
                feedback={combinedFeedback}
                onBack={handleBack}
                onNext={handleNext}
                primaryLabel={primaryLabel}
                loading={loading}
                canProceed={!!canProceed()}
                footer={
                    <p className="text-center text-sm text-(--secondary)">
                        Already have an account?{' '}
                        <a href="/login" className="text-accent hover:underline font-medium">
                            Sign in
                        </a>
                    </p>
                }
            >
                {renderStep()}
            </OnboardingWizardLayout>
        </div>
    );
}
