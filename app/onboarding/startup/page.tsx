'use client';

import { useState, useEffect } from 'react';
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
import { AppIcon } from '@/components/ui/AppIcon';
import { sectorCategoryLabels, SectorCategory } from '@/lib/types';



const STAGE_OPTIONS = [
    { value: 'ideation', label: 'Ideation', description: 'Validating the concept', icon: 'lightbulb' },
    { value: 'pre_seed_prototype', label: 'Pre seed / Prototype', description: 'Building the first version', icon: 'wrench' },
    { value: 'seed_mvp', label: 'Seed / MVP', description: 'Building the MVP', icon: 'code' },
    { value: 'early_traction', label: 'Early Traction', description: 'First users / revenue', icon: 'trending-up' },
    { value: 'growth', label: 'Growth', description: 'Scaling product & team', icon: 'rocket' },
    { value: 'scaling', label: 'Scaling', description: 'Expanding markets', icon: 'globe' },
] as const;

const WHY_XENTRO_OPTIONS = [
    {
        value: 'connect_verified_mentors',
        label: 'To connect with verified mentors who can guide our startup journey',
        title: 'Mentor access',
        description: 'Connect with verified mentors for focused startup guidance.',
        icon: 'handshake',
    },
    {
        value: 'access_investors',
        label: 'To gain access to investors actively looking for early-stage startups',
        title: 'Investor access',
        description: 'Reach investors actively looking at early-stage startups.',
        icon: 'coins',
    },
    {
        value: 'increase_visibility',
        label: 'To increase visibility for our startup within a trusted ecosystem',
        title: 'Startup visibility',
        description: 'Show up inside a more trusted startup ecosystem.',
        icon: 'eye',
    },
    {
        value: 'participate_programs',
        label: 'To participate in incubator and accelerator programs',
        title: 'Programs',
        description: 'Join incubator and accelerator opportunities.',
        icon: 'graduation-cap',
    },
    {
        value: 'validate_idea',
        label: 'To validate our idea through expert feedback',
        title: 'Idea validation',
        description: 'Pressure-test the idea with expert feedback.',
        icon: 'search',
    },
    {
        value: 'build_partnerships',
        label: 'To build strategic partnerships with institutions and industry leaders',
        title: 'Partnerships',
        description: 'Build strategic relationships with institutions and industry.',
        icon: 'briefcase',
    },
    {
        value: 'find_cofounders_team',
        label: 'To find co-founders or key team members',
        title: 'Team building',
        description: 'Find co-founders or key early hires.',
        icon: 'users',
    },
    {
        value: 'prepare_fundraising',
        label: 'To prepare for fundraising (pitch refinement, investor readiness)',
        title: 'Fundraising prep',
        description: 'Refine the pitch and get investor-ready.',
        icon: 'target',
    },
    {
        value: 'access_resources',
        label: 'To access curated resources, tools, and startup support',
        title: 'Resources',
        description: 'Access curated tools, playbooks, and support.',
        icon: 'folder',
    },
    {
        value: 'expand_network',
        label: 'To expand our professional network within the startup ecosystem',
        title: 'Network growth',
        description: 'Expand your network across the startup ecosystem.',
        icon: 'globe',
    },
    {
        value: 'stay_updated',
        label: 'To stay updated on startup opportunities, grants, and competitions',
        title: 'Opportunities',
        description: 'Track grants, competitions, and new opportunities.',
        icon: 'bell',
    },
    {
        value: 'build_credibility',
        label: 'To build credibility through association with Xentro',
        title: 'Credibility',
        description: 'Strengthen trust through the Xentro network.',
        icon: 'star',
    },
    {
        value: 'Other',
        label: 'Other',
        title: 'Other',
        description: 'Tell us what else you want from Xentro.',
        icon: 'pen-square',
    },
];

const COMPLETION_STEPS = [
    { id: 1, title: 'Identity', subtitle: 'Name · Tagline · Logo' },
    { id: 2, title: 'Team', subtitle: 'Founder · Co-founders · Team' },
    { id: 3, title: 'Industry', subtitle: 'Sector · Stage' },
    { id: 4, title: 'Purpose', subtitle: 'Why Xentro?' },
];

const WHY_XENTRO_LABEL_TO_VALUE = WHY_XENTRO_OPTIONS.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.value;
    acc[option.label] = option.value;
    return acc;
}, {});

function getWhyXentroValues(reasons: string[] = []) {
    return reasons.map((reason) => WHY_XENTRO_LABEL_TO_VALUE[reason] ?? reason);
}

function hasPartialMember(entry: { name?: string; email?: string; title?: string; avatar?: string | null }) {
    return Boolean(entry.name?.trim() || entry.email?.trim() || entry.title?.trim() || entry.avatar);
}

function hasIncompleteMember(entry: { name?: string; email?: string; title?: string; avatar?: string | null }) {
    return hasPartialMember(entry) && (!entry.name?.trim() || !entry.email?.trim());
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function StartupOnboardingPage() {
    const router = useRouter();
    const { currentStep, setStep, data, updateData, toggleSector, toggleWhyXentro, reset } = useStartupOnboardingStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailExists, setEmailExists] = useState<{ exists: boolean; message: string } | null>(null);
    const [emailChecking, setEmailChecking] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<SectorCategory | null>(null);
    const categories = Object.entries(sectorCategoryLabels) as [SectorCategory, typeof sectorCategoryLabels[SectorCategory]][];
    const [flowMode, setFlowMode] = useState<'signup' | 'complete'>('signup');
    const [existingStartupId, setExistingStartupId] = useState<string | null>(null);
    const [isInitializingFlow, setIsInitializingFlow] = useState(true);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const isCompletionFlow = flowMode === 'complete';

    useEffect(() => {
        if (!isMounted) return;

        const token = getSessionToken('founder');
        if (!token) {
            setFlowMode('signup');
            setExistingStartupId(null);
            setStep(1);
            setIsInitializingFlow(false);
            return;
        }

        let cancelled = false;

        const loadStartup = async () => {
            try {
                const res = await fetch('/api/founder/my-startup', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    if (!cancelled) {
                        setFlowMode('signup');
                        setExistingStartupId(null);
                    }
                    return;
                }

                const payload = await res.json();
                const startup = payload.data?.startup;
                const whyXentro = getWhyXentroValues(payload.data?.whyXentro ?? []);

                if (!cancelled && startup) {
                    const startupEmail = (startup.primaryContactEmail ?? '').trim().toLowerCase();
                    const localEmail = data.primaryContactEmail.trim().toLowerCase();
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
                    const hasLocalFounders = data.founders.some(hasPartialMember);
                    const hasLocalTeamMembers = data.teamMembers.some(hasPartialMember);
                    const mergedData = {
                        name: shouldReuseLocalDraft && data.name.trim() ? data.name : startup.name ?? '',
                        tagline: shouldReuseLocalDraft && data.tagline.trim() ? data.tagline : startup.tagline ?? '',
                        logo: shouldReuseLocalDraft && data.logo ? data.logo : startup.logo ?? null,
                        founders: shouldReuseLocalDraft && hasLocalFounders ? data.founders : fallbackFounders,
                        teamMembers: shouldReuseLocalDraft && hasLocalTeamMembers ? data.teamMembers : fallbackTeamMembers,
                        sectors: shouldReuseLocalDraft && data.sectors.length ? data.sectors : startup.sectors ?? [],
                        stage: shouldReuseLocalDraft && data.stage ? data.stage : (startup.stage ?? ''),
                        whyXentro: shouldReuseLocalDraft && data.whyXentro.length ? data.whyXentro : whyXentro,
                        whyXentroOther: shouldReuseLocalDraft && data.whyXentroOther.trim() ? data.whyXentroOther : (payload.data?.whyXentroOther ?? ''),
                        primaryContactEmail: shouldReuseLocalDraft && data.primaryContactEmail.trim() ? data.primaryContactEmail : startup.primaryContactEmail ?? '',
                        status: shouldReuseLocalDraft && data.status ? data.status : (startup.status ?? 'private'),
                        location: shouldReuseLocalDraft && data.location.trim() ? data.location : startup.location ?? '',
                        fundingRound: shouldReuseLocalDraft && data.fundingRound ? data.fundingRound : (startup.fundingRound ?? 'bootstrapped'),
                        fundsRaised: shouldReuseLocalDraft && data.fundsRaised ? data.fundsRaised : (startup.fundsRaised ? String(startup.fundsRaised) : ''),
                        fundingCurrency: shouldReuseLocalDraft && data.fundingCurrency ? data.fundingCurrency : (startup.fundingCurrency ?? 'USD'),
                        foundedDate: shouldReuseLocalDraft && data.foundedDate ? data.foundedDate : (startup.foundedDate ?? ''),
                        pitch: shouldReuseLocalDraft && data.pitch.trim() ? data.pitch : startup.pitch ?? '',
                    };

                    updateData(mergedData);

                    setFlowMode('complete');
                    setExistingStartupId(startup.id ?? null);

                    const nextStep = getStartupCompletionStep(mergedData);

                    if (nextStep > COMPLETION_STEPS.length) {
                        router.replace('/feed');
                        return;
                    }

                    setStep(nextStep);
                }
            } catch {
                if (!cancelled) {
                    setFlowMode('signup');
                    setExistingStartupId(null);
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
    }, [isMounted, router, setStep, updateData]);

    // ── Debounced email existence check ──
    useEffect(() => {
        const email = data.primaryContactEmail.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailExists(null);
            setEmailChecking(false);
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
        }, 500);

        return () => clearTimeout(timeout);
    }, [data.primaryContactEmail]);

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
        if (!isCompletionFlow) {
            return data.name.trim().length > 0 && data.primaryContactEmail.trim().length > 0 && emailVerified;
        }
        if (currentStep === 1) return data.name.trim().length > 0 && data.tagline.trim().length > 0 && Boolean(data.logo);
        if (currentStep === 2) return Boolean(data.founders[0]?.name.trim() && data.founders[0]?.email.trim()) && !data.founders.some(hasIncompleteMember) && !data.teamMembers.some(hasIncompleteMember);
        if (currentStep === 3) return data.sectors.length > 0 && data.stage !== '';
        if (currentStep === 4) return data.whyXentro.length > 0;
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
            const submitData = {
                name: data.name,
                tagline: data.tagline || '',
                logo: data.logo || null,
                sectors: data.sectors,
                whyXentro: data.whyXentro.map(opt =>
                    opt === 'Other' ? 'Other' : WHY_XENTRO_OPTIONS.find(o => o.value === opt)?.label || opt
                ),
                whyXentroOther: data.whyXentroOther,
                stage: data.stage,
                primaryContactEmail: data.primaryContactEmail,
                status: data.status || 'private',
                location: data.location || null,
                fundingRound: data.fundingRound || null,
                fundsRaised: data.fundsRaised ? data.fundsRaised : null,
                fundingCurrency: data.fundingCurrency || 'USD',
                foundedDate: data.foundedDate || null,
                pitch: data.pitch || '',
                founders: data.founders
                    .filter(founder => founder.name.trim() && founder.email.trim())
                    .map((founder, index) => ({
                        name: founder.name,
                        email: founder.email,
                        role: index === 0 ? 'founder' as const : 'co_founder' as const,
                        title: founder.title || (index === 0 ? 'Founder' : 'Co-Founder'),
                        avatar: founder.avatar || null,
                    })),
                teamMembers: data.teamMembers
                    .filter(member => member.name.trim() && member.email.trim())
                    .map(member => ({
                        name: member.name,
                        email: member.email,
                        role: member.role || 'team_member',
                        title: member.title || '',
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
                        name: data.name,
                        primaryContactEmail: data.primaryContactEmail,
                        status: 'private',
                        founders: [{ name: data.name, email: data.primaryContactEmail, role: 'founder' as const }],
                    }),
                });
            }

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save startup');

            reset();

            if (isCompletionFlow) {
                router.push('/feed');
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
                            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">Start with your startup name and email</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Verify your email first. The remaining onboarding steps will open after your first login.</p>
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
                                            <p className="text-sm text-(--secondary)">Continue to create your account, then log in to finish onboarding.</p>
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
                                        disabled={emailLoading || !data.name.trim() || !data.primaryContactEmail.trim() || !!emailExists?.exists || emailChecking}
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
                                {/* Sectors */}
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">What sector are you in?</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Select one sub-sector that best describes your startup.</p>
                                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 mt-4">
                                        {categories.map(([catSlug, { label, icon, subSectors }]) => {
                                            const isExpanded = expandedCategory === catSlug;
                                            const selectedCount = subSectors.filter(s => data.sectors.includes(s.slug)).length;

                                            return (
                                                <div key={catSlug} className="rounded-lg border border-(--border) overflow-hidden flex-shrink-0">
                                                    {/* Category Header */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedCategory(expandedCategory === catSlug ? null : catSlug)}
                                                        className={cn(
                                                            'w-full flex items-center gap-3 p-3 text-left transition-colors',
                                                            isExpanded ? 'bg-(--accent-subtle)' : 'bg-(--surface) hover:bg-(--surface-hover)',
                                                        )}
                                                    >
                                                        <AppIcon name={icon} className={cn('w-5 h-5 shrink-0', isExpanded ? 'text-accent' : 'text-(--secondary)')} />
                                                        <span className="font-medium text-sm flex-1 text-(--primary)">{label}</span>
                                                        {selectedCount > 0 && (
                                                            <span className="w-2 h-2 rounded-full bg-accent"></span>
                                                        )}
                                                        <svg
                                                            className={cn('w-4 h-4 text-(--secondary) transition-transform', isExpanded && 'rotate-180')}
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {/* Sub-sectors */}
                                                    {isExpanded && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 bg-(--surface-secondary) border-t border-(--border)">
                                                            {subSectors.map(({ slug, label: subLabel }) => {
                                                                const isSelected = data.sectors.includes(slug);
                                                                return (
                                                                    <button
                                                                        key={slug}
                                                                        type="button"
                                                                        onClick={() => updateData({ sectors: [slug] })}
                                                                        className={cn(
                                                                            'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all text-left',
                                                                            isSelected
                                                                                ? 'border-accent bg-(--accent-subtle) text-accent font-medium'
                                                                                : 'border-(--border) bg-(--surface) text-(--primary) hover:border-(--secondary-light)',
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                                                                            isSelected ? 'border-accent bg-accent' : 'border-(--secondary-light)',
                                                                        )}>
                                                                            {isSelected && (
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                                            )}
                                                                        </div>
                                                                        <span className="flex-1 text-left line-clamp-2">{subLabel}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
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
                                                        <AppIcon name={opt.icon} className="w-6 h-6" />
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

                        {/* ── Card 4: Why Xentro? ── */}
                        {isCompletionFlow && currentStep === 4 && (
                            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-xl font-semibold text-(--primary)">Why are you joining Xentro?</h2>
                                    <p className="text-sm text-(--secondary) mt-1">Select all that apply. This helps us tailor your experience.</p>
                                </div>

                                <div className="rounded-2xl border border-(--border) bg-(--surface-secondary) px-4 py-3">
                                    <p className="text-sm font-medium text-(--primary)">Choose what you want help with</p>
                                    <p className="text-xs text-(--secondary) mt-1">Pick one or more goals. We&apos;ll use these selections to personalize your experience.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {WHY_XENTRO_OPTIONS.map(opt => {
                                        const isSelected = data.whyXentro.includes(opt.value);
                                        const isOther = opt.value === 'Other';
                                        return (
                                            <div key={opt.value} className={cn('flex h-full flex-col', isOther && 'md:col-span-2')}>
                                                <label className={cn(
                                                    'group flex h-full cursor-pointer rounded-xl border p-3 transition-all duration-200',
                                                    isSelected
                                                        ? 'border-accent bg-accent/5 shadow-[0_8px_24px_rgba(16,24,40,0.08)] ring-1 ring-accent/15'
                                                        : 'border-(--border) bg-(--surface) hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]'
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleWhyXentro(opt.value)}
                                                        className="sr-only"
                                                    />

                                                    <div className="flex w-full items-start gap-3">
                                                        <div className={cn(
                                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                                                            isSelected
                                                                ? 'border-accent/20 bg-accent/10 text-accent'
                                                                : 'border-(--border) bg-(--surface-secondary) text-(--secondary) group-hover:text-accent'
                                                        )}>
                                                            <AppIcon name={opt.icon} className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <p className={cn(
                                                                        'text-xs font-semibold',
                                                                        isSelected ? 'text-accent' : 'text-(--primary)'
                                                                    )}>
                                                                        {opt.title}
                                                                    </p>
                                                                    <p className="mt-0.5 text-xs leading-5 text-(--secondary)">{opt.description}</p>
                                                                </div>

                                                                <div className={cn(
                                                                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
                                                                    isSelected
                                                                        ? 'border-accent bg-accent text-white'
                                                                        : 'border-(--secondary-light) bg-white text-transparent'
                                                                )}>
                                                                    <AppIcon name="check" className="h-3 w-3" />
                                                                </div>
                                                            </div>

                                                            {isOther && isSelected && (
                                                                <div className="mt-3 border-t border-(--border) pt-3" onClick={e => e.stopPropagation()}>
                                                                    <Input
                                                                        placeholder="Please specify your reason"
                                                                        value={data.whyXentroOther}
                                                                        onChange={e => updateData({ whyXentroOther: e.target.value })}
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            )}

                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
