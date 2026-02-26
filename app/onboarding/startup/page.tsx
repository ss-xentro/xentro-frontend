'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStartupOnboardingStore, WhyXentroOption } from '@/stores/useStartupOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { cn } from '@/lib/utils';

const SECTOR_OPTIONS = [
    'Manufacturing', 'Pharmacy', 'Electric', 'Mining', 'IT',
    'Communication', 'Healthcare', 'EdTech', 'FinTech', 'AgriTech',
    'CleanTech', 'AI / ML', 'SaaS', 'E-Commerce', 'Logistics',
    'Social Impact', 'Media', 'Gaming', 'Food & Beverage', 'Real Estate',
];

const STAGE_OPTIONS = [
    { value: 'idea', label: 'Ideation', description: 'Validating the concept', emoji: '💡' },
    { value: 'mvp', label: 'Pre-Seed / MVP', description: 'Building the first version', emoji: '🛠️' },
    { value: 'early_traction', label: 'Early Traction', description: 'First users / revenue', emoji: '📈' },
    { value: 'growth', label: 'Growth', description: 'Scaling product & team', emoji: '🚀' },
    { value: 'scale', label: 'Scaling', description: 'Expanding markets', emoji: '🌍' },
] as const;

const WHY_XENTRO_OPTIONS: { value: WhyXentroOption; label: string; icon: string; description: string }[] = [
    { value: 'mentorship', label: 'Mentorship', icon: '🧭', description: 'Get guidance from industry experts' },
    { value: 'invest', label: 'To Invest', icon: '💼', description: 'Discover investment opportunities' },
    { value: 'raise_funding', label: 'Raise Funding', icon: '💰', description: 'Connect with investors & VCs' },
    { value: 'networking', label: 'Networking', icon: '🤝', description: 'Build your startup community' },
];

const STEPS = [
    { id: 1, title: 'Identity', subtitle: 'Name · Tagline · Logo' },
    { id: 2, title: 'Industry', subtitle: 'Sector · Stage' },
    { id: 3, title: 'Purpose', subtitle: 'Why Xentro?' },
    { id: 4, title: 'Verify', subtitle: 'Email' },
];

export default function StartupOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep, data, updateData, toggleSector, reset } = useStartupOnboardingStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailExists, setEmailExists] = useState<{ exists: boolean; message: string } | null>(null);
    const [emailChecking, setEmailChecking] = useState(false);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // ── Debounced email existence check ──
    useEffect(() => {
        const email = data.primaryContactEmail.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailExists(null);
            return;
        }

        setEmailChecking(true);
        const timeout = setTimeout(async () => {
            try {
                const res = await fetch('/api/auth/check-email/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const resData = await res.json();
                if (resData.exists && !resData.canProceed) {
                    setEmailExists({ exists: true, message: resData.message });
                } else {
                    setEmailExists(null);
                }
            } catch {
                setEmailExists(null);
            } finally {
                setEmailChecking(false);
            }
        }, 600);

        return () => {
            clearTimeout(timeout);
            setEmailChecking(false);
        };
    }, [data.primaryContactEmail]);

    // ── Auto-poll verification status after magic link is sent ──
    useEffect(() => {
        if (!magicLinkSent || emailVerified) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/auth/magic-link/status/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.primaryContactEmail }),
                });
                const resData = await res.json();
                if (res.ok && resData.verified) {
                    setEmailVerified(true);
                    setFeedback({ type: 'success', message: 'Email verified!' });
                    clearInterval(pollInterval);
                }
            } catch {
                // Silently retry on next interval
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [magicLinkSent, emailVerified, data.primaryContactEmail]);

    // ── Email verification ──
    const handleSendMagicLink = async () => {
        setEmailLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/send/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.primaryContactEmail,
                    name: data.name,
                    purpose: 'signup',
                }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || resData.message || 'Failed to send verification link');
            setMagicLinkSent(true);
            setFeedback({ type: 'success', message: `Verification link sent to ${data.primaryContactEmail}` });
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
                body: JSON.stringify({ email: data.primaryContactEmail }),
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

    // ── Navigation ──
    const canContinue = () => {
        if (currentStep === 1) return data.name.trim().length > 0;
        if (currentStep === 2) return data.sectors.length > 0 && data.stage !== '';
        if (currentStep === 3) return data.whyXentro !== '';
        if (currentStep === 4) return emailVerified;
        return true;
    };

    const handleNext = () => {
        setError(null);
        setFeedback(null);

        if (currentStep === 1 && !data.name.trim()) {
            setError('Please enter your startup name.');
            return;
        }
        if (currentStep === 2) {
            if (data.sectors.length === 0) { setError('Select at least one sector.'); return; }
            if (!data.stage) { setError('Select your current stage.'); return; }
        }
        if (currentStep === 3 && !data.whyXentro) {
            setError('Please select why you want to join Xentro.');
            return;
        }
        if (currentStep === 4) {
            if (!data.primaryContactEmail.trim()) { setError('Please enter your email.'); return; }
            if (!emailVerified) { setError('Please verify your email before continuing.'); return; }
            // Final step — submit
            handleSubmit();
            return;
        }

        if (currentStep < 4) {
            setStep(currentStep + 1);
            window.scrollTo(0, 0);
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
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Build clean submission data — convert empty strings to null for optional fields
            const submitData = {
                name: data.name,
                tagline: data.tagline || '',
                logo: data.logo || null,
                sectors: data.sectors,
                stage: data.stage,
                primaryContactEmail: data.primaryContactEmail,
                status: data.status || 'active',
                location: data.location || null,
                fundingRound: data.fundingRound || null,
                fundsRaised: data.fundsRaised ? data.fundsRaised : null,
                fundingCurrency: data.fundingCurrency || 'USD',
                foundedDate: data.foundedDate || null,
                pitch: data.pitch || '',
                founders: [{ name: data.name, email: data.primaryContactEmail, role: 'founder' as const }],
            };

            const response = await fetch('/api/founder/startups/', {
                method: 'POST',
                headers,
                body: JSON.stringify(submitData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create startup');

            reset();
            router.push('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50/30 flex flex-col">
            {/* Minimal Navbar */}
            <nav className="h-16 border-b border-(--border) bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
                        <span className="text-lg font-bold text-(--primary)">Xentro</span>
                    </Link>
                    <Link href="/join" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Exit
                    </Link>
                </div>
            </nav>

            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-(--primary) tracking-tight">
                            Create your Startup Profile
                        </h1>
                        <p className="mt-2 text-(--secondary)">
                            Launch your presence on XENTRO in minutes.
                        </p>
                    </div>

                    {/* Step Indicators — 4 dots */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        {STEPS.map((step) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;
                            return (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                                                isActive
                                                    ? 'bg-accent text-white ring-4 ring-accent/20 scale-110'
                                                    : isCompleted
                                                        ? 'bg-accent text-white'
                                                        : 'bg-(--surface-hover) text-(--secondary)'
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
                                        <span className={cn(
                                            'mt-1.5 text-xs font-medium',
                                            isActive ? 'text-(--primary)' : 'text-(--secondary)'
                                        )}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {step.id < 4 && (
                                        <div className={cn(
                                            'w-12 h-0.5 mt-[-18px] rounded-full transition-colors',
                                            step.id < currentStep ? 'bg-accent' : 'bg-(--border)'
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ══════════════════════════════════════════
                        Card Content — one card per step
                       ══════════════════════════════════════════ */}
                    <div className="bg-white border border-(--border) rounded-2xl shadow-sm overflow-hidden">
                        {/* ── Card 1: Name · Tagline · Logo ── */}
                        {currentStep === 1 && (
                            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">Tell us about your startup</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Start with the basics — you can always update later.</p>
                                </div>

                                <Input
                                    label="Startup Name"
                                    placeholder="e.g. Acme Technologies"
                                    value={data.name}
                                    onChange={e => updateData({ name: e.target.value })}
                                    autoFocus
                                    required
                                />

                                <Input
                                    label="Tagline"
                                    placeholder="A short line describing what you do"
                                    value={data.tagline}
                                    onChange={e => updateData({ tagline: e.target.value })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Logo</label>
                                    <FileUpload
                                        value={data.logo}
                                        onChange={url => updateData({ logo: url })}
                                        folder="startup-logos"
                                        accept="image/*"
                                        enableCrop
                                        aspectRatio={1}
                                    />
                                    <p className="text-xs text-(--secondary) mt-1.5">Square image recommended (512×512 or larger)</p>
                                </div>
                            </div>
                        )}

                        {/* ── Card 2: Sectors + Stage ── */}
                        {currentStep === 2 && (
                            <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
                                {/* Sectors */}
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">What sector are you in?</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Select all that apply.</p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {SECTOR_OPTIONS.map(sector => {
                                            const isSelected = data.sectors.includes(sector);
                                            return (
                                                <button
                                                    key={sector}
                                                    type="button"
                                                    onClick={() => toggleSector(sector)}
                                                    className={cn(
                                                        'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200',
                                                        isSelected
                                                            ? 'bg-accent text-white border-accent shadow-sm'
                                                            : 'bg-white text-(--secondary) border-(--border) hover:border-accent/40 hover:text-(--primary)'
                                                    )}
                                                >
                                                    {sector}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Stage */}
                                <div>
                                    <h2 className="text-lg font-semibold text-(--primary)">Current Stage</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Where is your startup right now?</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                        {STAGE_OPTIONS.map(opt => {
                                            const isSelected = data.stage === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => updateData({ stage: opt.value })}
                                                    className={cn(
                                                        'p-4 rounded-xl border text-left transition-all duration-200 group',
                                                        isSelected
                                                            ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                                                            : 'border-(--border) hover:border-accent/30 hover:bg-(--surface-hover)'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{opt.emoji}</span>
                                                        <div>
                                                            <p className={cn(
                                                                'font-semibold text-sm',
                                                                isSelected ? 'text-accent' : 'text-(--primary)'
                                                            )}>{opt.label}</p>
                                                            <p className="text-xs text-(--secondary)">{opt.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Card 3: Why Xentro? ── */}
                        {currentStep === 3 && (
                            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">Why are you joining Xentro?</h2>
                                    <p className="text-sm text-(--secondary) mt-1">This helps us tailor your experience.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {WHY_XENTRO_OPTIONS.map(opt => {
                                        const isSelected = data.whyXentro === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => updateData({ whyXentro: opt.value })}
                                                className={cn(
                                                    'p-5 rounded-xl border text-left transition-all duration-200 group',
                                                    isSelected
                                                        ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                                                        : 'border-(--border) hover:border-accent/30 hover:bg-(--surface-hover)'
                                                )}
                                            >
                                                <span className="text-3xl block mb-3">{opt.icon}</span>
                                                <p className={cn(
                                                    'font-semibold text-sm mb-1',
                                                    isSelected ? 'text-accent' : 'text-(--primary)'
                                                )}>{opt.label}</p>
                                                <p className="text-xs text-(--secondary)">{opt.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Card 4: Email Verification ── */}
                        {currentStep === 4 && (
                            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">Verify your company email</h2>
                                    <p className="text-sm text-(--secondary) mt-1">We&apos;ll send a verification link to confirm your identity.</p>
                                </div>

                                <Input
                                    label="Company Email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={data.primaryContactEmail}
                                    onChange={e => {
                                        updateData({ primaryContactEmail: e.target.value });
                                        if (emailVerified || magicLinkSent) {
                                            setEmailVerified(false);
                                            setMagicLinkSent(false);
                                            setFeedback(null);
                                        }
                                        setEmailExists(null);
                                    }}
                                    disabled={emailVerified}
                                    required
                                />

                                {/* Email already registered warning */}
                                {emailExists?.exists && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-amber-800">{emailExists.message}</p>
                                            <a href="/login" className="text-sm text-accent hover:underline font-medium mt-1 inline-block">
                                                Go to Login &rarr;
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {emailChecking && (
                                    <p className="text-xs text-(--secondary) animate-pulse">Checking email...</p>
                                )}

                                {/* Status display */}
                                <div className="text-center py-4">
                                    <div className={cn(
                                        'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
                                        emailVerified ? 'bg-green-100' : 'bg-accent/10'
                                    )}>
                                        {emailVerified ? (
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>

                                    {emailVerified ? (
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-700 mb-1">Email verified!</h3>
                                            <p className="text-sm text-(--secondary)">Click &quot;Create Startup&quot; to finish.</p>
                                        </div>
                                    ) : magicLinkSent ? (
                                        <div>
                                            <h3 className="text-lg font-semibold text-(--primary) mb-1">Check your inbox</h3>
                                            <p className="text-sm text-(--secondary)">
                                                We sent a verification link to <strong>{data.primaryContactEmail}</strong>.<br />
                                                Click the link in the email, then come back here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-lg font-semibold text-(--primary) mb-1">Verify your email</h3>
                                            <p className="text-sm text-(--secondary)">
                                                We&apos;ll send a link to <strong>{data.primaryContactEmail || 'your email'}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                {emailVerified ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Verified
                                    </div>
                                ) : !magicLinkSent ? (
                                    <Button
                                        onClick={handleSendMagicLink}
                                        disabled={emailLoading || !data.primaryContactEmail.trim() || !!emailExists?.exists || emailChecking}
                                        isLoading={emailLoading}
                                        className="w-full"
                                    >
                                        {emailLoading ? 'Sending...' : 'Send verification link'}
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleCheckVerification}
                                            disabled={emailLoading}
                                            isLoading={emailLoading}
                                            className="w-full"
                                        >
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
                        )}

                        {/* Error / Feedback */}
                        {(error || feedback) && (
                            <div className="px-6 md:px-8 pb-4">
                                {error && (
                                    <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                                {feedback && !error && (
                                    <div className={cn(
                                        'p-3 rounded-lg text-sm border',
                                        feedback.type === 'success'
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : 'border-red-200 bg-red-50 text-red-700'
                                    )}>
                                        {feedback.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 flex items-center justify-between border-t border-(--border) mt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleBack}
                                disabled={currentStep === 1 || isSubmitting}
                            >
                                Back
                            </Button>

                            {(currentStep !== 4 || emailVerified) && (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isSubmitting || !canContinue()}
                                    isLoading={isSubmitting}
                                >
                                    {currentStep === 4 ? 'Create Startup' : 'Continue'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-xs text-(--secondary) mt-6">
                        Your progress is automatically saved.
                    </p>
                    <p className="text-center text-sm text-(--secondary) mt-3">
                        Already have a founder account?{' '}
                        <a href="/login" className="text-accent hover:underline font-medium">
                            Access Dashboard
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
