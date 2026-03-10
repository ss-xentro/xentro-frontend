import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialStartupData, useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';

describe('useStartupOnboardingStore', () => {
	beforeEach(() => {
		localStorage.clear();
		useStartupOnboardingStore.setState({
			currentStep: 1,
			data: createInitialStartupData(),
		});
	});

	it('resets completion data while preserving signup identity fields', () => {
		const store = useStartupOnboardingStore.getState();

		store.updateData({
			name: 'Acme Labs',
			primaryContactEmail: 'founder@acme.com',
			tagline: 'Build faster',
			logo: 'https://cdn.example.com/logo.png',
			sectors: ['fintech'],
			stage: 'seed_mvp',
			whyXentro: ['access_investors'],
			whyXentroOther: 'Custom reason',
			pitch: 'Pitch deck text',
			location: 'Lagos',
		});
		store.updateFounder(0, { name: 'Jane Founder', email: 'jane@acme.com' });
		store.addFounder();
		store.updateFounder(1, { name: 'John Co', email: 'john@acme.com' });
		store.addTeamMember();
		store.updateTeamMember(0, { name: 'Alex Hire', email: 'alex@acme.com' });
		store.setStep(4);

		useStartupOnboardingStore.getState().resetToSignupDraft();

		const nextState = useStartupOnboardingStore.getState();

		expect(nextState.currentStep).toBe(1);
		expect(nextState.data).toEqual({
			...createInitialStartupData(),
			name: 'Acme Labs',
			primaryContactEmail: 'jane@acme.com',
		});
	});

	it('keeps the primary contact email in sync with the first founder email', () => {
		const store = useStartupOnboardingStore.getState();

		store.updateFounder(0, { email: 'primary@startup.com' });

		expect(useStartupOnboardingStore.getState().data.primaryContactEmail).toBe('primary@startup.com');
	});
});
