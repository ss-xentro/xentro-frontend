"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { OnboardingWizardLayout } from '@/components/ui/OnboardingWizardLayout';
import TagInput from '@/components/ui/TagInput';
import { getAuthCookie, getSessionToken, syncAuthCookie } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { isMentorOnboardingComplete } from '@/lib/mentor-onboarding';
import { WhyMentorStep } from './_components/WhyMentorStep';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import api from '@/lib/api-client';


const TOTAL_STEPS = 3;

const FOCUS_SUGGESTIONS = [
	{
		category: 'Growth & GTM',
		items: ['Product-led Growth (PLG)', 'Go-to-Market Strategy', 'Enterprise Sales'],
	},
	{
		category: 'Fundraising & Finance',
		items: ['Seed Fundraising', 'Pitch Deck Review', 'Financial Modeling'],
	},
	{
		category: 'Product & Tech',
		items: ['MVP Strategy', 'Product Roadmapping', 'AI Productization'],
	},
	{
		category: 'Operations & Scale',
		items: ['Hiring Strategy', 'OKR Implementation', 'ESOP Planning'],
	},
	{
		category: 'Sector Expertise',
		items: ['SaaS', 'FinTech', 'AI / ML'],
	},
	{
		category: 'Special Situations',
		items: ['Pivot Strategy', 'Crisis Management', 'Exit Planning'],
	},
];

function toTagArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.map((item) => String(item).trim())
			.filter(Boolean);
	}

	if (typeof value !== 'string') return [];

	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

export default function MentorOnboardingPage() {
	const router = useRouter();
	const [hydrated, setHydrated] = useState(false);
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);

	const [occupation, setOccupation] = useState('');
	const [focusTags, setFocusTags] = useState<string[]>([]);
	const [motivation, setMotivation] = useState<string[]>([]);
	const [motivationOther, setMotivationOther] = useState('');

	const authUser = useMemo(() => getAuthCookie(), []);
	const mentorToken = useMemo(() => getSessionToken('mentor'), []);

	// Redirect if no token
	useEffect(() => {
		if (!mentorToken) router.replace('/login');
	}, [mentorToken, router]);

	// Hydrate mentor profile
	const { data: profileData, isLoading: isBootstrapping } = useApiQuery<Record<string, unknown>>(
		queryKeys.onboarding.mentorProfile(),
		'/api/auth/mentor-profile/',
		{
			requestOptions: { role: 'mentor' },
			enabled: !!mentorToken,
			retry: false,
			refetchOnWindowFocus: false,
		},
	);

	// Seed form state from query data
	useEffect(() => {
		if (hydrated || !profileData) return;
		if (isMentorOnboardingComplete(profileData)) {
			router.replace('/mentor-dashboard');
			return;
		}
		setOccupation((profileData.occupation as string) || '');
		setFocusTags(toTagArray(profileData.expertise));
		if (Array.isArray(profileData.motivation)) setMotivation(profileData.motivation as string[]);
		if (profileData.motivation_other) setMotivationOther(profileData.motivation_other as string);
		setHydrated(true);
	}, [profileData, hydrated, router]);

	const canProceed = () => {
		if (step === 1) return occupation.trim().length > 0;
		if (step === 2) return focusTags.length > 0;
		if (step === 3) return motivation.length > 0;
		return false;
	};

	const handleBack = () => {
		setStep((prev) => Math.max(1, prev - 1));
	};

	const handleSubmit = async () => {
		if (!mentorToken) {
			router.replace('/login');
			return;
		}

		setLoading(true);

		try {
			const displayName = (authUser?.name || '').trim();
			const nameParts = displayName ? displayName.split(/\s+/) : [];
			const firstName = nameParts[0] || '';
			const lastName = nameParts.slice(1).join(' ');

			await api.post('/api/mentors/', {
				role: 'mentor',
				json: {
					email: authUser?.email || '',
					display_name: displayName,
					firstName,
					lastName,
					currentRole: occupation.trim(),
					expertiseAreas: focusTags,
					motivation,
					motivationOther: motivationOther.trim(),
				},
			});

			syncAuthCookie({
				...(authUser ?? {}),
				mentorOnboarded: true,
				mentor_onboarded: true,
			});
			sessionStorage.setItem('xentro_mentor_onboarding_ok', 'true');

			toast.success('Mentor onboarding saved. Redirecting...');
			setTimeout(() => router.push('/mentor-dashboard'), 1200);
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleNext = async () => {
		if (!canProceed()) {
			toast.error('Complete this step first.');
			return;
		}

		if (step < TOTAL_STEPS) {
			setStep((prev) => prev + 1);
			return;
		}

		await handleSubmit();
	};

	if (isBootstrapping) {
		return (
			<div className="min-h-screen bg-(--surface) flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
			</div>
		);
	}

	const stepTitles = ['Current role', 'Focus areas', 'Motivation'];

	return (
		<div className="min-h-screen bg-(--surface) flex flex-col">
			<OnboardingNavbar showLogout />

			<OnboardingWizardLayout
				title="Mentor onboarding"
				subtitle={stepTitles[step - 1]}
				currentStep={step}
				totalSteps={TOTAL_STEPS}
				onBack={handleBack}
				onNext={handleNext}
				primaryLabel={step === TOTAL_STEPS ? (loading ? 'Saving...' : 'Finish onboarding') : 'Continue'}
				loading={loading}
				canProceed={canProceed()}
			>
				{step === 1 ? (
					<Input
						label="Current role"
						placeholder="VC Partner, Operator, Coach..."
						value={occupation}
						onChange={(e) => {
							setOccupation(e.target.value);
						}}
						autoFocus
						required
					/>
				) : step === 2 ? (
					<TagInput
						label="Focus areas"
						tags={focusTags}
						onChange={(tags) => {
							setFocusTags(tags);
						}}
						placeholder="Type a focus area and press Enter..."
						suggestions={FOCUS_SUGGESTIONS}
					/>
				) : (
					<WhyMentorStep
						selectedValues={motivation}
						otherText={motivationOther}
						onToggle={(value) => {
							setMotivation((prev) =>
								prev.includes(value)
									? prev.filter((v) => v !== value)
									: [...prev, value]
							);
						}}
						onOtherChange={setMotivationOther}
					/>
				)}
			</OnboardingWizardLayout>
		</div>
	);
}
