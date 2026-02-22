"use client";

import { useState } from 'react';
import { Button, Card, Input, ProgressIndicator, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const TOTAL_STEPS = 5;

export default function InvestorOnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
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

    const canProceed = () => {
        switch (step) {
            case 1:
                return form.name.trim() && form.email.trim();
            case 2:
                return form.password.trim().length >= 8;
            case 3:
                return form.investmentStages.trim() || form.sectors.trim();
            case 4:
                return true; // Portfolio is optional
            case 5:
                return true; // Preferences are optional
            default:
                return false;
        }
    };

    const handleNext = async () => {
        if (!canProceed()) {
            setFeedback({ type: 'error', message: 'Please complete the required fields to continue.' });
            return;
        }

        if (step < TOTAL_STEPS) {
            setStep((prev) => prev + 1);
            return;
        }

        setLoading(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/investors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    checkSizeMin: form.checkSizeMin ? Number(form.checkSizeMin) : null,
                    checkSizeMax: form.checkSizeMax ? Number(form.checkSizeMax) : null,
                    investmentStages: form.investmentStages ? form.investmentStages.split(',').map(s => s.trim()).filter(Boolean) : [],
                    sectors: form.sectors ? form.sectors.split(',').map(s => s.trim()).filter(Boolean) : [],
                    portfolioCompanies: form.portfolioCompanies ? form.portfolioCompanies.split('\n').filter(Boolean) : [],
                    notableInvestments: form.notableInvestments ? form.notableInvestments.split('\n').filter(Boolean) : [],
                }),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Server is not ready yet. Please try again later.');
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            setFeedback({ type: 'success', message: 'Application submitted! We\'ll review and notify you once approved.' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            setFeedback({ type: 'error', message });
        } finally {
            setLoading(false);
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
                            <h2 className="text-xl font-semibold text-(--primary)">Create a password</h2>
                            <p className="text-sm text-(--secondary)">Secure your investor account. Keep it unique.</p>
                        </div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="At least 8 characters"
                            value={form.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                );
            case 3:
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
                        <div className="grid grid-cols-2 gap-4">
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
            case 4:
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
            case 5:
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
            default:
                return null;
        }
    };

    const primaryLabel = step === TOTAL_STEPS ? (loading ? 'Submitting…' : 'Submit for review') : 'Continue';

    return (
        <main className="min-h-screen bg-(--surface) px-4 py-10 flex items-center justify-center">
            <Card className="w-full max-w-3xl p-6 md:p-8 space-y-6 shadow-lg bg-white/90 backdrop-blur animate-fadeInUp">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-(--primary)">Investor onboarding</h1>
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
                                ? 'border-success/30 bg-(--success-light) text-success'
                                : 'border-error bg-red-50 text-red-700'
                        )}
                    >
                        {feedback.message}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading}>
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button onClick={handleNext} disabled={loading}>
                            {primaryLabel}
                        </Button>
                    </div>
                </div>

                <p className="text-center text-sm text-(--secondary)">
                    Already have an account?{' '}
                    <a href="/investor-login" className="text-accent hover:underline font-medium">
                        Sign in
                    </a>
                </p>
            </Card>
        </main>
    );
}
