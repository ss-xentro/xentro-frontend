import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { getSessionToken } from '@/lib/auth-utils';
import { getStartupCompletionStep } from '@/lib/startup-onboarding';
import { COMPLETION_STEPS, getWhyXentroValues, hasPartialMember } from './constants';

export function useFlowInitialization() {
	const router = useRouter();
	const { data, updateData, setStep, resetToSignupDraft } = useStartupOnboardingStore();

	const [flowMode, setFlowMode] = useState<'signup' | 'complete'>('signup');
	const [existingStartupId, setExistingStartupId] = useState<string | null>(null);
	const [isInitializingFlow, setIsInitializingFlow] = useState(true);
	const [isMounted, setIsMounted] = useState(false);

	const initialDraftRef = useRef(data);

	useEffect(() => { setIsMounted(true); }, []);

	const resetVerificationState = useRef<(() => void) | null>(null);

	/** Must be called by the consumer to pass the reset callback */
	const setResetVerificationCallback = (fn: () => void) => {
		resetVerificationState.current = fn;
	};

	useEffect(() => {
		if (!isMounted) return;

		const token = getSessionToken('founder');
		if (!token) {
			setFlowMode('signup');
			setExistingStartupId(null);
			resetToSignupDraft();
			resetVerificationState.current?.();
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
						// If 404 (no startup), user genuinely needs to create one — stay in signup mode
						// For other errors (403, 500), redirect to dashboard rather than trapping them here
						if (res.status === 404) {
							setFlowMode('signup');
							setExistingStartupId(null);
							resetToSignupDraft();
							resetVerificationState.current?.();
						} else {
							router.replace('/dashboard');
							return;
						}
					}
					return;
				}

				const payload = await res.json();
				const startup = payload.data?.startup;
				const whyXentro = getWhyXentroValues(payload.data?.whyXentro ?? []);

				if (!cancelled && startup) {
					// Check completion against SERVER data first — if already complete, redirect immediately
					const serverWhyXentro = getWhyXentroValues(payload.data?.whyXentro ?? []);
					const serverStep = getStartupCompletionStep({
						name: startup.name,
						tagline: startup.tagline,
						logo: startup.logo,
						founders: startup.founders,
						sectors: startup.sectors,
						stage: startup.stage,
						whyXentro: serverWhyXentro,
					});

					if (serverStep > COMPLETION_STEPS.length) {
						router.replace('/dashboard');
						return;
					}

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
					setStep(nextStep);
				}
			} catch {
				if (!cancelled) {
					// Network error — redirect to dashboard rather than showing broken onboarding
					router.replace('/dashboard');
					return;
				}
			} finally {
				if (!cancelled) setIsInitializingFlow(false);
			}
		};

		loadStartup();
		return () => { cancelled = true; };
	}, [isMounted, resetToSignupDraft, router, setStep, updateData]);

	return {
		flowMode,
		existingStartupId,
		isInitializingFlow,
		isMounted,
		isCompletionFlow: flowMode === 'complete',
		setResetVerificationCallback,
	};
}
