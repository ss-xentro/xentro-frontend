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


const TOTAL_STEPS = 2;

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
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);

	const [occupation, setOccupation] = useState('');
	const [focusTags, setFocusTags] = useState<string[]>([]);

	const authUser = useMemo(() => getAuthCookie(), []);

	useEffect(() => {
		const token = getSessionToken('mentor');
		if (!token) {
			router.replace('/login');
			return;
		}

		let isActive = true;

		const hydrateProfile = async () => {
			try {
				const res = await fetch('/api/auth/mentor-profile/', {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!isActive) return;

				if (res.status === 404) {
					setIsBootstrapping(false);
					return;
				}

				if (!res.ok) {
					toast.error('Could not load mentor onboarding details.');
					setIsBootstrapping(false);
					return;
				}

				const data = await res.json();
				if (isMentorOnboardingComplete(data)) {
					router.replace('/mentor-dashboard');
					return;
				}

				setOccupation(data.occupation || '');
				setFocusTags(toTagArray(data.expertise));
			} catch {
				if (!isActive) return;
				toast.error('Could not load mentor onboarding details.');
			} finally {
				if (isActive) setIsBootstrapping(false);
			}
		};

		hydrateProfile();

		return () => {
			isActive = false;
		};
	}, [router]);

	const canProceed = () => {
		if (step === 1) return occupation.trim().length > 0;
		if (step === 2) return focusTags.length > 0;
		return false;
	};

	const handleBack = () => {
		setStep((prev) => Math.max(1, prev - 1));
	};

	const handleSubmit = async () => {
		const token = getSessionToken('mentor');
		if (!token) {
			router.replace('/login');
			return;
		}

		setLoading(true);

		try {
			const displayName = (authUser?.name || '').trim();
			const nameParts = displayName ? displayName.split(/\s+/) : [];
			const firstName = nameParts[0] || '';
			const lastName = nameParts.slice(1).join(' ');

			const response = await fetch('/api/mentors/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					email: authUser?.email || '',
					display_name: displayName,
					firstName,
					lastName,
					currentRole: occupation.trim(),
					expertiseAreas: focusTags,
				}),
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.message || 'Failed to save mentor onboarding details.');
			}

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

	const stepTitles = ['Current role', 'Focus areas'];

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
				) : (
					<TagInput
						label="Focus areas"
						tags={focusTags}
						onChange={(tags) => {
							setFocusTags(tags);
						}}
						placeholder="Type a focus area and press Enter..."
						suggestions={FOCUS_SUGGESTIONS}
					/>
				)}
			</OnboardingWizardLayout>
		</div>
	);
}
