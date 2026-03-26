import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import InstitutionDashboardPage from '@/app/(institution)/institution-dashboard/page';

const router = {
	push: vi.fn(),
	replace: vi.fn(),
};

const getSessionTokenMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => router,
	useSearchParams: () => ({ get: () => null }),
}));

vi.mock('@/lib/auth-utils', () => ({
	getSessionToken: (...args: unknown[]) => getSessionTokenMock(...args),
	syncAuthCookie: vi.fn(),
	setRoleToken: vi.fn(),
	setTokenCookie: vi.fn(),
}));

vi.mock('@/app/(institution)/institution-dashboard/_components/OnboardingWizard', () => ({
	default: () => <div data-testid="onboarding-wizard" />,
}));

vi.mock('@/app/(institution)/institution-dashboard/_components/ApprovedDashboard', () => ({
	default: () => <div data-testid="approved-dashboard" />,
}));

vi.mock('@/app/(institution)/institution-dashboard/_components/PendingApplicationView', () => ({
	default: () => <div data-testid="pending-dashboard" />,
}));

function mockJsonResponse(body: unknown, ok = true) {
	return Promise.resolve({
		ok,
		json: async () => body,
	} as Response);
}

describe('InstitutionDashboardPage regressions', () => {
	beforeEach(() => {
		router.push.mockReset();
		router.replace.mockReset();
		getSessionTokenMock.mockReset();
		getSessionTokenMock.mockReturnValue('institution-token');
		vi.stubGlobal('fetch', vi.fn());
	});

	it('renders approved dashboard for approved + linked institution app', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockImplementation((input) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

			if (url === '/api/institution-applications') {
				return mockJsonResponse({
					data: [
						{
							id: 'app-1',
							name: 'Acme Institution',
							email: 'admin@acme.org',
							status: 'approved',
							verified: true,
							institutionId: 'inst-1',
							description: 'Completed phase 2 profile',
							createdAt: '2026-03-20T10:00:00Z',
							updatedAt: '2026-03-22T10:00:00Z',
						},
					],
				});
			}

			if (url === '/api/startups' || url === '/api/institution-team' || url === '/api/programs') {
				return mockJsonResponse({ data: [] });
			}

			if (url === '/api/auth/me/') {
				return mockJsonResponse({ institution: { id: 'inst-1', slug: 'acme-institution', verified: true } });
			}

			throw new Error(`Unexpected fetch: ${url}`);
		});

		render(<InstitutionDashboardPage />);

		await waitFor(() => {
			expect(screen.getByTestId('approved-dashboard')).toBeInTheDocument();
		});
		expect(screen.queryByTestId('pending-dashboard')).not.toBeInTheDocument();
	});

	it('renders approved dashboard when API returns legacy institution field', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockImplementation((input) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

			if (url === '/api/institution-applications') {
				return mockJsonResponse({
					data: [
						{
							id: 'app-legacy',
							name: 'Legacy Institution',
							email: 'legacy@acme.org',
							status: 'approved',
							verified: true,
							institution: 'inst-legacy',
							description: 'Completed legacy profile',
							createdAt: '2026-03-21T10:00:00Z',
							updatedAt: '2026-03-23T10:00:00Z',
						},
					],
				});
			}

			if (url === '/api/startups' || url === '/api/institution-team' || url === '/api/programs') {
				return mockJsonResponse({ data: [] });
			}

			if (url === '/api/auth/me/') {
				return mockJsonResponse({ institution: { id: 'inst-legacy', slug: 'legacy-institution', verified: true } });
			}

			throw new Error(`Unexpected fetch: ${url}`);
		});

		render(<InstitutionDashboardPage />);

		await waitFor(() => {
			expect(screen.getByTestId('approved-dashboard')).toBeInTheDocument();
		});
		expect(screen.queryByTestId('pending-dashboard')).not.toBeInTheDocument();
	});
});
