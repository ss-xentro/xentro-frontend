import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StartupOnboardingPage from '@/app/onboarding/[role]/page';
import { createInitialStartupData, useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';

const router = {
	push: vi.fn(),
	replace: vi.fn(),
};

const getSessionTokenMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => router,
	useParams: () => ({ role: 'startup' }),
	notFound: () => { throw new Error('notFound'); },
}));

vi.mock('@/lib/auth-utils', () => ({
	getSessionToken: (...args: unknown[]) => getSessionTokenMock(...args),
}));

vi.mock('@/components/ui/FileUpload', () => ({
	FileUpload: () => <div data-testid="file-upload" />,
}));

vi.mock('@/components/ui/OnboardingNavbar', () => ({
	OnboardingNavbar: () => <div data-testid="onboarding-navbar" />,
}));

vi.mock('@/components/onboarding/startup/FoundersSection', () => ({
	FoundersSection: () => <div data-testid="founders-section" />,
}));

function mockJsonResponse(body: unknown, ok = true) {
	return Promise.resolve({
		ok,
		json: async () => body,
	} as Response);
}

describe('StartupOnboardingPage', () => {
	beforeEach(() => {
		vi.useRealTimers();
		localStorage.clear();
		router.push.mockReset();
		router.replace.mockReset();
		getSessionTokenMock.mockReset();
		getSessionTokenMock.mockReturnValue(null);
		vi.stubGlobal('fetch', vi.fn());
		useStartupOnboardingStore.setState({
			currentStep: 1,
			data: createInitialStartupData(),
		});
	});

	it('drops stale completion fields when entering signup without a founder session', async () => {
		useStartupOnboardingStore.setState({
			currentStep: 4,
			data: {
				...createInitialStartupData(),
				name: 'Acme Labs',
				primaryContactEmail: 'founder@acme.com',
				tagline: 'Old tagline',
				logo: 'https://cdn.example.com/logo.png',
				sectors: ['fintech'],
				stage: 'seed_mvp',
				whyXentro: ['access_investors'],
				whyXentroOther: 'Legacy reason',
			},
		});

		render(<StartupOnboardingPage />);

		await screen.findByText('Create your Startup Account');

		await waitFor(() => {
			expect(useStartupOnboardingStore.getState().currentStep).toBe(1);
			expect(useStartupOnboardingStore.getState().data).toEqual({
				...createInitialStartupData(),
				name: 'Acme Labs',
				primaryContactEmail: 'founder@acme.com',
			});
		});

		expect(screen.getByDisplayValue('Acme Labs')).toBeInTheDocument();
		expect(screen.getByDisplayValue('founder@acme.com')).toBeInTheDocument();
	});

	it('clears the sent-verification state when the signup email changes', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockImplementation((input) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

			if (url.includes('/api/auth/check-email/')) {
				return mockJsonResponse({ exists: false, canProceed: true });
			}

			if (url.includes('/api/auth/magic-link/send/')) {
				return mockJsonResponse({ success: true });
			}

			throw new Error(`Unexpected fetch: ${url}`);
		});

		render(<StartupOnboardingPage />);

		await screen.findByText('Create your Startup Account');

		fireEvent.change(screen.getByLabelText('Startup Name'), { target: { value: 'Acme Labs' } });
		fireEvent.change(screen.getByLabelText('Company Email'), { target: { value: 'founder@acme.com' } });

		await waitFor(
			() => expect(fetchMock).toHaveBeenCalledWith(
				'/api/auth/check-email/',
				expect.objectContaining({ method: 'POST' })
			),
			{ timeout: 1500 }
		);

		fireEvent.click(await screen.findByRole('button', { name: 'Verify Email' }));

		await screen.findByRole('button', { name: "I've clicked the link" });
		expect(screen.getByText('Check your inbox')).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText('Company Email'), { target: { value: 'new@acme.com' } });

		await waitFor(
			() => {
				expect(screen.getByRole('button', { name: 'Verify Email' })).toBeInTheDocument();
			},
			{ timeout: 1500 }
		);

		expect(screen.queryByRole('button', { name: "I've clicked the link" })).not.toBeInTheDocument();
		expect(screen.queryByText('Check your inbox')).not.toBeInTheDocument();
	});
});
