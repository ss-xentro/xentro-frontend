import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { getSessionToken } from '@/lib/auth-utils';
import {
	COMPLETION_STEPS, WHY_XENTRO_OPTIONS,
	hasIncompleteMember, isValidEmail,
} from './constants';

interface UseStepNavigationOptions {
	isCompletionFlow: boolean;
	existingStartupId: string | null;
	emailVerified: boolean;
	setFeedback: (val: { type: 'success' | 'error'; message: string } | null) => void;
}

export function useStepNavigation({
	isCompletionFlow,
	existingStartupId,
	emailVerified,
	setFeedback,
}: UseStepNavigationOptions) {
	const router = useRouter();
	const { currentStep, setStep, data, updateData, toggleWhyXentro, reset } = useStartupOnboardingStore();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canContinue = () => {
		if (!isCompletionFlow) {
			return data.name.trim().length > 0 && isValidEmail(data.primaryContactEmail) && emailVerified;
		}
		if (currentStep === 1) return data.name.trim().length > 0 && data.tagline.trim().length > 0 && Boolean(data.logo);
		if (currentStep === 2) {
			return Boolean(data.founders[0]?.name.trim())
				&& !data.founders.some(hasIncompleteMember)
				&& !data.teamMembers.some(hasIncompleteMember)
				&& !data.founders.some(founder => founder.email.trim() && !isValidEmail(founder.email))
				&& !data.teamMembers.some(member => member.email.trim() && !isValidEmail(member.email));
		}
		if (currentStep === 3) return data.sectors.length > 0 && data.stage !== '';
		if (currentStep === 4) return data.whyXentro.length > 0 && (!data.whyXentro.includes('Other') || Boolean(data.whyXentroOther.trim()));
		return true;
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
					.filter(founder => founder.name.trim())
					.map((founder, index) => ({
						id: founder.id,
						name: founder.name.trim(),
						email: founder.email.trim().toLowerCase(),
						role: index === 0 ? 'founder' as const : 'co_founder' as const,
						title: founder.title?.trim() || (index === 0 ? 'Founder' : 'Co-Founder'),
						avatar: founder.avatar || null,
						bio: founder.bio?.trim() || '',
					})),
				teamMembers: data.teamMembers
					.filter(member => member.name.trim())
					.map(member => ({
						id: member.id,
						name: member.name.trim(),
						email: member.email.trim().toLowerCase(),
						role: member.role || 'team_member',
						title: member.title?.trim() || '',
						avatar: member.avatar || null,
						bio: member.bio?.trim() || '',
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
			// Clear onboarding guard cache so it re-verifies next session
			sessionStorage.removeItem('xentro_onboarding_ok');
			router.push(isCompletionFlow ? '/dashboard' : '/login');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Something went wrong.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const validateAndProceed = (step: number): string | null => {
		if (step === 1) {
			if (!data.name.trim()) return 'Please enter your startup name.';
			if (!data.tagline.trim()) return 'Please enter your startup tagline.';
			if (!data.logo) return 'Please upload your startup logo.';
		}
		if (step === 2) {
			if (!data.founders[0]?.name.trim()) return 'Please add one founder name.';
			if (data.founders.some(hasIncompleteMember)) return 'Each founder entry needs a name.';
			if (data.teamMembers.some(hasIncompleteMember)) return 'Each team member entry needs a name.';
			if (data.founders.some(f => f.email.trim() && !isValidEmail(f.email))) return 'Please enter a valid email address for each founder.';
			if (data.teamMembers.some(m => m.email.trim() && !isValidEmail(m.email))) return 'Please enter a valid email address for each team member.';
		}
		if (step === 3) {
			if (data.sectors.length === 0) return 'Select at least one sector.';
			if (!data.stage) return 'Select your current stage.';
		}
		if (step === 4) {
			if (data.whyXentro.length === 0) return 'Please select why you want to join Xentro.';
			if (data.whyXentro.includes('Other') && !data.whyXentroOther.trim()) return 'Please specify your other reason for joining Xentro.';
		}
		return null;
	};

	const handleNext = () => {
		setError(null);
		setFeedback(null);

		if (!isCompletionFlow) {
			if (!data.name.trim()) { setError('Please enter your startup name.'); return; }
			if (!data.primaryContactEmail.trim()) { setError('Please enter your email.'); return; }
			if (!isValidEmail(data.primaryContactEmail)) { setError('Please enter a valid company email address.'); return; }
			if (!emailVerified) { setError('Please verify your email before continuing.'); return; }
			handleSubmit();
			return;
		}

		const validationError = validateAndProceed(currentStep);
		if (validationError) { setError(validationError); return; }

		// Steps 4 (last step) submits
		if (currentStep === 4) { handleSubmit(); return; }

		if (currentStep < COMPLETION_STEPS.length) {
			setStep(currentStep + 1);
			window.scrollTo(0, 0);
		}
	};

	const handleBack = () => {
		setError(null);
		setFeedback(null);
		if (isCompletionFlow && currentStep > 1) {
			setStep(currentStep - 1);
			window.scrollTo(0, 0);
		}
	};

	return {
		currentStep,
		data,
		updateData,
		toggleWhyXentro,
		isSubmitting,
		error,
		setError,
		canContinue,
		handleNext,
		handleBack,
	};
}
