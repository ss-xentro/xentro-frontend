'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { FoundersSection } from '@/components/onboarding/startup/FoundersSection';
import { getSessionToken } from '@/lib/auth-utils';
import { getStartupCompletionStep } from '@/lib/startup-onboarding';
import { cn } from '@/lib/utils';
import { SectorCategory } from '@/lib/types';
import {
    COMPLETION_STEPS, WHY_XENTRO_OPTIONS,
    getWhyXentroValues, hasPartialMember, hasIncompleteMember, isValidEmail,
} from './_lib/constants';
import { SectorPicker } from './_components/SectorPicker';
import { StagePicker } from './_components/StagePicker';
import { WhyXentroStep } from './_components/WhyXentroStep';
import { SignupForm } from './_components/SignupForm';



export default function StartupOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep, data, updateData, toggleWhyXentro, resetToSignupDraft, reset } = useStartupOnboardingStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailExists, setEmailExists] = useState<{ exists: boolean; message: string } | null>(null);
    const [emailChecking, setEmailChecking] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<SectorCategory | null>(null);
    const [flowMode, setFlowMode] = useState<'signup' | 'complete'>('signup');
    const [existingStartupId, setExistingStartupId] = useState<string | null>(null);
    const [isInitializingFlow, setIsInitializingFlow] = useState(true);

    const [isMounted, setIsMounted] = useState(false);
    const initialDraftRef = useRef(data);
    useEffect(() => { setIsMounted(true); }, []);

    const isCompletionFlow = flowMode === 'complete';

    const resetSignupVerificationState = () => {
        setMagicLinkSent(false);
        setEmailVerified(false);
        setEmailExists(null);
        setEmailChecking(false);
        setFeedback(null);
    };

    useEffect(() => {
        if (!isMounted) return;

        const token = getSessionToken('founder');
        if (!token) {
            setFlowMode('signup');
            setExistingStartupId(null);
            resetToSignupDraft();
            resetSignupVerificationState();
            setIsInitializingFlow(false);
            return;
        }

        let cancelled = false;
        const draft = initialDraftRef.current;

        const loadStartup = async () => {
            try {
                const res = await fetch('/api/founder/my-startup', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    if (!cancelled) {
                        setFlowMode('signup');
                        setExistingStartupId(null);
                        resetToSignupDraft();
                        resetSignupVerificationState();
                    }
                    return;
                }

                const payload = await res.json();
                const startup = payload.data?.startup;
                const whyXentro = getWhyXentroValues(payload.data?.whyXentro ?? []);

                if (!cancelled && startup) {
                    const startupEmail = (startup.primaryContactEmail ?? '').trim().toLowerCase();
                    const localEmail = draft.primaryContactEmail.trim().toLowerCase();
                    const shouldReuseLocalDraft = !localEmail || localEmail === startupEmail;
                    const fallbackFounders = startup.founders?.length
                        ? startup.founders.map((founder: { name?: string; email?: string; role?: 'founder' | 'co_founder'; title?: string; avatar?: string | null }, index: number) => ({
                            name: founder.name ?? '',
                            email: founder.email ?? '',
                            role: index === 0 ? 'founder' as const : 'co_founder' as const,
                            title: founder.title ?? (index === 0 ? 'Founder' : 'Co-Founder'),
                            avatar: founder.avatar ?? null,
                        }))
                        : [{
                            name: startup.name ?? '',
                            email: startup.primaryContactEmail ?? '',
                            role: 'founder' as const,
                            title: 'Founder',
                            avatar: null,
                        }];
                    const fallbackTeamMembers = (startup.teamMembers ?? []).map((member: { name?: string; email?: string; title?: string; avatar?: string | null }) => ({
                        name: member.name ?? '',
                        email: member.email ?? '',
                        role: 'team_member' as const,
                        title: member.title ?? '',
                        avatar: member.avatar ?? null,
                    }));
                    const hasLocalFounders = draft.founders.some(hasPartialMember);
                    const hasLocalTeamMembers = draft.teamMembers.some(hasPartialMember);
                    const mergedData = {
                        name: shouldReuseLocalDraft && draft.name.trim() ? draft.name : startup.name ?? '',
                        tagline: shouldReuseLocalDraft && draft.tagline.trim() ? draft.tagline : startup.tagline ?? '',
                        logo: shouldReuseLocalDraft && draft.logo ? draft.logo : startup.logo ?? null,
                        founders: shouldReuseLocalDraft && hasLocalFounders ? draft.founders : fallbackFounders,
                        teamMembers: shouldReuseLocalDraft && hasLocalTeamMembers ? draft.teamMembers : fallbackTeamMembers,
                        sectors: shouldReuseLocalDraft && draft.sectors.length ? draft.sectors : startup.sectors ?? [],
                        stage: shouldReuseLocalDraft && draft.stage ? draft.stage : (startup.stage ?? ''),
                        whyXentro: shouldReuseLocalDraft && draft.whyXentro.length ? draft.whyXentro : whyXentro,
                        whyXentroOther: shouldReuseLocalDraft && draft.whyXentroOther.trim() ? draft.whyXentroOther : (payload.data?.whyXentroOther ?? ''),
                        primaryContactEmail: shouldReuseLocalDraft && draft.primaryContactEmail.trim() ? draft.primaryContactEmail : startup.primaryContactEmail ?? '',
                        status: shouldReuseLocalDraft && draft.status ? draft.status : (startup.status ?? 'private'),
                        location: shouldReuseLocalDraft && draft.location.trim() ? draft.location : startup.location ?? '',
                        fundingRound: shouldReuseLocalDraft && draft.fundingRound ? draft.fundingRound : (startup.fundingRound ?? 'bootstrapped'),
                        fundsRaised: shouldReuseLocalDraft && draft.fundsRaised ? draft.fundsRaised : (startup.fundsRaised ? String(startup.fundsRaised) : ''),
                        fundingCurrency: shouldReuseLocalDraft && draft.fundingCurrency ? draft.fundingCurrency : (startup.fundingCurrency ?? 'USD'),
                        foundedDate: shouldReuseLocalDraft && draft.foundedDate ? draft.foundedDate : (startup.foundedDate ?? ''),
                        pitch: shouldReuseLocalDraft && draft.pitch.trim() ? draft.pitch : startup.pitch ?? '',
                    };

                    updateData(mergedData);

                    setFlowMode('complete');
                    setExistingStartupId(startup.id ?? null);

                    const nextStep = getStartupCompletionStep(mergedData);

                    if (nextStep > COMPLETION_STEPS.length) {
                        router.replace('/home');
                        return;
                    }

                    setStep(nextStep);
                }
            } catch {
                if (!cancelled) {
                    setFlowMode('signup');
                    setExistingStartupId(null);
                    resetToSignupDraft();
                    resetSignupVerificationState();
                }
            } finally {
                if (!cancelled) {
                    setIsInitializingFlow(false);
                }
            }
        };

        loadStartup();

        return () => {
            cancelled = true;
        };
    }, [isMounted, resetToSignupDraft, router, setStep, updateData]);

    // ── Debounced email existence check ──
    useEffect(() => {
        if (isCompletionFlow) {
            setEmailExists(null);
            setEmailChecking(false);
            return;
        }

        const email = data.primaryContactEmail.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailExists(null);
            setEmailChecking(false);
            return;
        }

        let isActive = true;
        let abortController: AbortController | null = null;

        setEmailChecking(true);
        const timeout = setTimeout(async () => {
            try {
                abortController = new AbortController();
                const res = await fetch('/api/auth/check-email/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: abortController.signal,
                    body: JSON.stringify({ email }),
                });
                const resData = await res.json();
                if (!isActive) {
                    return;
                }
                if (resData.exists && !resData.canProceed) {
                    setEmailExists({ exists: true, message: resData.message });
                } else {
                    setEmailExists(null);
                }
            } catch (error) {
                if ((error as Error).name === 'AbortError' || !isActive) {
                    return;
                }
                setEmailExists(null);
            } finally {
                if (isActive) {
                    setEmailChecking(false);
                }
            }
        }, 500);

        return () => {
            isActive = false;
            clearTimeout(timeout);
            abortController?.abort();
        };
    }, [data.primaryContactEmail, isCompletionFlow]);

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
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [magicLinkSent, emailVerified, data.primaryContactEmail]);

    // ── Email verification ──
    const handleSendMagicLink = async () => {
        const email = data.primaryContactEmail.trim().toLowerCase();
        if (!data.name.trim()) {
            setFeedback({ type: 'error', message: 'Please enter your startup name first.' });
            return;
        }
        if (!isValidEmail(email)) {
            setFeedback({ type: 'error', message: 'Please enter a valid company email address.' });
            return;
        }

        setEmailLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/send/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: data.name.trim(),
                    purpose: 'signup',
                }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || resData.message || 'Failed to send verification link');
            updateData({ primaryContactEmail: email });
            setMagicLinkSent(true);
            setFeedback({ type: 'success', message: `Verification link sent to ${email}` });
        } catch (err) {
            setFeedback({ type: 'error', message: (err as Error).message });
        } finally {
            setEmailLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        const email = data.primaryContactEmail.trim().toLowerCase();
        if (!isValidEmail(email)) {
            setFeedback({ type: 'error', message: 'Please enter a valid company email address.' });
            return;
        }

        setEmailLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/auth/magic-link/status/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Verification check failed');
            if (resData.verified) {
                updateData({ primaryContactEmail: email });
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
        if (!isCompletionFlow) {
            return data.name.trim().length > 0 && isValidEmail(data.primaryContactEmail) && emailVerified;
        }
        if (currentStep === 1) return data.name.trim().length > 0 && data.tagline.trim().length > 0 && Boolean(data.logo);
        if (currentStep === 2) {
            return Boolean(data.founders[0]?.name.trim() && data.founders[0]?.email.trim())
                && !data.founders.some(hasIncompleteMember)
                && !data.teamMembers.some(hasIncompleteMember)
                && !data.founders.some(founder => founder.email.trim() && !isValidEmail(founder.email))
                && !data.teamMembers.some(member => member.email.trim() && !isValidEmail(member.email));
        }
        if (currentStep === 3) return data.sectors.length > 0 && data.stage !== '';
        if (currentStep === 4) return data.whyXentro.length > 0 && (!data.whyXentro.includes('Other') || Boolean(data.whyXentroOther.trim()));
        return true;
    };

    const handleNext = () => {
        setError(null);
        setFeedback(null);

        if (!isCompletionFlow) {
            if (!data.name.trim()) {
                setError('Please enter your startup name.');
                return;
            }
            if (!data.primaryContactEmail.trim()) {
                setError('Please enter your email.');
                return;
            }
            if (!isValidEmail(data.primaryContactEmail)) {
                setError('Please enter a valid company email address.');
                return;
            }
            if (!emailVerified) {
                setError('Please verify your email before continuing.');
                return;
            }
            handleSubmit();
            return;
        }

        if (currentStep === 1) {
            if (!data.name.trim()) { setError('Please enter your startup name.'); return; }
            if (!data.tagline.trim()) { setError('Please enter your startup tagline.'); return; }
            if (!data.logo) { setError('Please upload your startup logo.'); return; }
        }
        if (currentStep === 2) {
            if (!data.founders[0]?.name.trim() || !data.founders[0]?.email.trim()) {
                setError('Please add one founder with name and email.');
                return;
            }
            if (data.founders.some(hasIncompleteMember)) {
                setError('Each founder entry needs both a name and an email.');
                return;
            }
            if (data.teamMembers.some(hasIncompleteMember)) {
                setError('Each team member entry needs both a name and an email.');
                return;
            }
            if (data.founders.some(founder => founder.email.trim() && !isValidEmail(founder.email))) {
                setError('Please enter a valid email address for each founder.');
                return;
            }
            if (data.teamMembers.some(member => member.email.trim() && !isValidEmail(member.email))) {
                setError('Please enter a valid email address for each team member.');
                return;
            }
        }
        if (currentStep === 3) {
            if (data.sectors.length === 0) { setError('Select at least one sector.'); return; }
            if (!data.stage) { setError('Select your current stage.'); return; }
        }
        if (currentStep === 4) {
            if (data.whyXentro.length === 0) {
                setError('Please select why you want to join Xentro.');
                return;
            }
            if (data.whyXentro.includes('Other') && !data.whyXentroOther.trim()) {
                setError('Please specify your other reason for joining Xentro.');
                return;
            }
            handleSubmit();
            return;
        }

        if (currentStep < COMPLETION_STEPS.length) {
            setStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setError(null);
        setFeedback(null);

        if (!isCompletionFlow) {
            return;
        }

        if (currentStep > 1) {
            setStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const trimmedEmail = data.primaryContactEmail.trim().toLowerCase();
            const submitData = {
                name: data.name.trim(),
                tagline: data.tagline.trim(),
                logo: data.logo || null,
                sectors: data.sectors,
                whyXentro: data.whyXentro.map(opt =>
                    opt === 'Other' ? 'Other' : WHY_XENTRO_OPTIONS.find(o => o.value === opt)?.label || opt
                ),
                whyXentroOther: data.whyXentroOther.trim(),
                stage: data.stage,
                primaryContactEmail: trimmedEmail,
                status: data.status || 'private',
                location: data.location.trim() || null,
                fundingRound: data.fundingRound || null,
                fundsRaised: data.fundsRaised.trim() ? data.fundsRaised.trim() : null,
                fundingCurrency: data.fundingCurrency || 'USD',
                foundedDate: data.foundedDate || null,
                pitch: data.pitch.trim(),
                founders: data.founders
                    .filter(founder => founder.name.trim() && founder.email.trim())
                    .map((founder, index) => ({
                        name: founder.name.trim(),
                        email: founder.email.trim().toLowerCase(),
                        role: index === 0 ? 'founder' as const : 'co_founder' as const,
                        title: founder.title?.trim() || (index === 0 ? 'Founder' : 'Co-Founder'),
                        avatar: founder.avatar || null,
                    })),
                teamMembers: data.teamMembers
                    .filter(member => member.name.trim() && member.email.trim())
                    .map(member => ({
                        name: member.name.trim(),
                        email: member.email.trim().toLowerCase(),
                        role: member.role || 'team_member',
                        title: member.title?.trim() || '',
                        avatar: member.avatar || null,
                    })),
            };

            let response: Response;

            if (isCompletionFlow) {
                const token = getSessionToken('founder');
                if (!token || !existingStartupId) {
                    throw new Error('Please log in again to complete your startup profile.');
                }

                response = await fetch(`/api/founder/startups/${existingStartupId}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(submitData),
                });
            } else {
                response = await fetch('/api/founder/startups/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: data.name.trim(),
                        primaryContactEmail: trimmedEmail,
                        status: 'private',
                        founders: [{ name: data.name.trim(), email: trimmedEmail, role: 'founder' as const }],
                    }),
                });
            }

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save startup');

            reset();

            if (isCompletionFlow) {
                router.push('/home');
                return;
            }

            router.push('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            {/* Minimal Navbar */}
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

                    {isCompletionFlow && (
                        <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-8">
                            {COMPLETION_STEPS.map((step) => {
                                const isActive = step.id === currentStep;
                                const isCompleted = step.id < currentStep;
                                return (
                                    <div key={step.id} className="flex items-center gap-1.5 sm:gap-3">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={cn(
                                                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300',
                                                    isActive
                                                        ? 'bg-accent text-white ring-2 sm:ring-4 ring-accent/20 scale-110'
                                                        : isCompleted
                                                            ? 'bg-accent text-white'
                                                            : 'bg-(--surface-hover) text-(--secondary)'
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    step.id
                                                )}
                                            </div>
                                            <span className={cn(
                                                'mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium',
                                                isActive ? 'text-(--primary)' : 'text-(--secondary)'
                                            )}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {step.id < COMPLETION_STEPS.length && (
                                            <div className={cn(
                                                'w-6 sm:w-12 h-0.5 mt-[-18px] rounded-full transition-colors',
                                                step.id < currentStep ? 'bg-accent' : 'bg-(--border)'
                                            )} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════
                        Card Content — one card per step
                       ══════════════════════════════════════════ */}
                    <div className="bg-white border border-(--border) rounded-2xl shadow-sm overflow-hidden">
                        {!isCompletionFlow && (
                            <SignupForm
                                name={data.name}
                                email={data.primaryContactEmail}
                                onNameChange={value => updateData({ name: value })}
                                onEmailChange={value => {
                                    updateData({ primaryContactEmail: value });
                                    if (emailVerified || magicLinkSent) {
                                        setEmailVerified(false);
                                        setMagicLinkSent(false);
                                        setFeedback(null);
                                    }
                                    setEmailExists(null);
                                }}
                                emailExists={emailExists}
                                emailChecking={emailChecking}
                                magicLinkSent={magicLinkSent}
                                emailVerified={emailVerified}
                                emailLoading={emailLoading}
                                onSendMagicLink={handleSendMagicLink}
                                onCheckVerification={handleCheckVerification}
                            />
                        )}

                        {/* ── Card 1: Name · Tagline · Logo ── */}
                        {isCompletionFlow && currentStep === 1 && (
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

                        {/* ── Card 2: Founder + Team ── */}
                        {isCompletionFlow && currentStep === 2 && (
                            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">Who is building this startup?</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Add one founder, then any co-founders or team members you want to show on the public profile.</p>
                                </div>

                                <FoundersSection />
                            </div>
                        )}

                        {/* ── Card 3: Sectors + Stage ── */}
                        {isCompletionFlow && currentStep === 3 && (
                            <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">What sector are you in?</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Select one sub-sector that best describes your startup.</p>
                                    <SectorPicker
                                        selectedSectors={data.sectors}
                                        onSelect={sectors => updateData({ sectors })}
                                        expandedCategory={expandedCategory}
                                        onToggleCategory={setExpandedCategory}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-(--primary)">Current Stage</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Where is your startup right now?</p>
                                    <StagePicker
                                        selectedStage={data.stage}
                                        onSelect={stage => updateData({ stage })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Card 4: Why Xentro? ── */}
                        {isCompletionFlow && currentStep === 4 && (
                            <WhyXentroStep
                                selectedValues={data.whyXentro}
                                otherText={data.whyXentroOther}
                                onToggle={toggleWhyXentro}
                                onOtherChange={value => updateData({ whyXentroOther: value })}
                            />
                        )}

                        {/* Error / Feedback */}
                        {(error || feedback) && (
                            <div className="px-6 md:px-8 pb-4">
                                {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}
                                {feedback && !error && (
                                    <FeedbackBanner type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 flex items-center justify-between border-t border-(--border) mt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleBack}
                                disabled={!isCompletionFlow || currentStep === 1 || isSubmitting}
                            >
                                Back
                            </Button>

                            {(!isCompletionFlow || currentStep !== COMPLETION_STEPS.length || canContinue()) && (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isSubmitting || !canContinue()}
                                    isLoading={isSubmitting}
                                >
                                    {!isCompletionFlow ? 'Continue to Login' : currentStep === COMPLETION_STEPS.length ? 'Finish Setup' : 'Continue'}
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
