"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InstitutionApplication, OnboardingFormData, InstitutionType, OperatingMode, SDGFocus, SectorFocus, Institution, LegalDocument, operatingModeLabels, sdgLabels, sectorLabels } from '@/lib/types';
import { getSessionToken, syncAuthCookie, setRoleToken, setTokenCookie } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { useApiQuery, queryKeys } from '@/lib/queries';
import OnboardingWizard from './_components/OnboardingWizard';
import ApprovedDashboard from './_components/ApprovedDashboard';
import PendingApplicationView from './_components/PendingApplicationView';

type RawInstitutionApplication = InstitutionApplication & {
  institution?: string | null;
  applicantUser?: string | null;
};

function normalizeApplication(app: RawInstitutionApplication): InstitutionApplication {
  return {
    ...app,
    institutionId: app.institutionId ?? app.institution ?? null,
    applicantUserId: app.applicantUserId ?? app.applicantUser ?? null,
  };
}

function isPhase2Complete(app: InstitutionApplication): boolean {
  return Boolean(app.description?.trim());
}

function pickLatestApplication(apps: InstitutionApplication[]): InstitutionApplication | null {
  if (!apps.length) return null;

  const byUpdated = [...apps].sort((a, b) => {
    const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });

  const withInstitution = byUpdated.filter((app) => Boolean(app.institutionId));

  const latestApprovedWithInstitution = withInstitution.find((app) => app.status === 'approved');
  if (latestApprovedWithInstitution) return latestApprovedWithInstitution;

  const latestCompletedWithInstitution = withInstitution.find((app) => isPhase2Complete(app));
  if (latestCompletedWithInstitution) return latestCompletedWithInstitution;

  const latestVerifiedWithInstitution = withInstitution.find((app) => app.verified);
  if (latestVerifiedWithInstitution) return latestVerifiedWithInstitution;

  const latestCompleted = byUpdated.find((app) => isPhase2Complete(app));
  if (latestCompleted) return latestCompleted;

  const latestVerified = byUpdated.find((app) => app.verified);
  return latestVerified ?? byUpdated[0] ?? null;
}

/** Normalize legal_documents from DB – may be string[] (old) or {url,name}[] (new) */
function normalizeLegalDocs(raw: unknown): LegalDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    if (typeof item === 'string') {
      // Old format: plain URL string – extract filename from URL or fall back
      const segments = item.split('/');
      return { url: item, name: segments[segments.length - 1] || `Document ${i + 1}` };
    }
    if (item && typeof item === 'object' && 'url' in item) {
      return { url: item.url as string, name: (item.name as string) || `Document ${i + 1}` };
    }
    return { url: String(item), name: `Document ${i + 1}` };
  });
}

const initialFormData: OnboardingFormData = {
  type: null,
  name: '',
  tagline: '',
  city: '',
  country: '',
  countryCode: '',
  operatingMode: null,
  startupsSupported: 0,
  studentsMentored: 0,
  fundingFacilitated: 0,
  fundingCurrency: 'USD',
  sdgFocus: [],
  sectorFocus: [],
  logo: null,
  website: '',
  linkedin: '',
  email: '',
  phone: '',
  description: '',
  legalDocuments: [],
};

interface DashboardStats {
  programsCount: number;
  teamCount: number;
  startupsCount: number;
  profileViews: number;
}

export default function InstitutionDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [application, setApplication] = useState<InstitutionApplication | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ programsCount: 0, teamCount: 0, startupsCount: 0, profileViews: 0 });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);

  const handleNudgeVerification = async (message: string) => {
    if (!application) return;
    const token = getSessionToken('institution');
    if (!token) return;

    try {
      const res = await fetch(`/api/institution-applications/${application.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'pending', remark: message?.trim() ?? '' }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || 'Failed to submit verification request');
      }
      setApplication(payload.data ?? payload);
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  };

  // Pick up token from URL query string (magic-link redirect)
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setRoleToken('institution', urlToken);
      setTokenCookie(urlToken);

      (async () => {
        try {
          const res = await fetch('/api/auth/me/', {
            headers: { 'Authorization': `Bearer ${urlToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            syncAuthCookie({ ...data.user, role: 'institution' });
          } else {
            syncAuthCookie({ role: 'institution' });
          }
        } catch {
          syncAuthCookie({ role: 'institution' });
        }
        router.replace('/institution-dashboard');
      })();
      return;
    }
  }, [searchParams, router]);

  // ── Fetch applications via TanStack Query ──
  const hasToken = Boolean(getSessionToken('institution'));
  const { data: appsPayload, isLoading: appsLoading } = useApiQuery<any>(
    queryKeys.institution.applications(),
    '/api/institution-applications',
    {
      enabled: hasToken && !searchParams.get('token'),
      requestOptions: { role: 'institution' },
    },
  );

  // Derive application from query data
  const latestApp = (() => {
    if (!appsPayload) return null;
    const apps = ((appsPayload.data ?? []) as RawInstitutionApplication[]).map(normalizeApplication);
    return pickLatestApplication(apps);
  })();

  // Sync application + formData when query data changes
  useEffect(() => {
    if (!latestApp) return;
    setApplication(latestApp);

    const normalizeOperatingMode = (mode: string | null | undefined): OperatingMode | null => {
      if (!mode) return null;
      const modeLower = mode.toLowerCase();
      const validKeys = Object.keys(operatingModeLabels) as OperatingMode[];
      if (validKeys.includes(modeLower as OperatingMode)) return modeLower as OperatingMode;
      return null;
    };

    const normalizeSDG = (sdgs: string[] | null | undefined): SDGFocus[] => {
      if (!Array.isArray(sdgs)) return [];
      return sdgs.map(sdgLabel => {
        if (Object.keys(sdgLabels).includes(sdgLabel)) return sdgLabel as SDGFocus;
        const entry = Object.entries(sdgLabels).find(([, value]) => value.fullName.toLowerCase() === sdgLabel.toLowerCase());
        return entry ? (entry[0] as SDGFocus) : null;
      }).filter(Boolean) as SDGFocus[];
    };

    const normalizeSector = (sectors: string[] | null | undefined): SectorFocus[] => {
      if (!Array.isArray(sectors)) return [];
      return sectors.map(sectorLabel => {
        if (Object.keys(sectorLabels).includes(sectorLabel)) return sectorLabel as SectorFocus;
        const entry = Object.entries(sectorLabels).find(([, value]) => value.label.toLowerCase() === sectorLabel.toLowerCase() || sectorLabel.toLowerCase() === value.label.toLowerCase().replace(' & ', ''));
        return entry ? (entry[0] as SectorFocus) : (sectorLabel.toLowerCase().replace(/ & /g, '').replace(/ /g, '-') as SectorFocus);
      }).filter(s => Object.keys(sectorLabels).includes(s)) as SectorFocus[];
    };

    setFormData({
      type: latestApp.type as InstitutionType,
      name: latestApp.name,
      tagline: latestApp.tagline ?? '',
      city: latestApp.city ?? '',
      country: latestApp.country ?? '',
      countryCode: latestApp.countryCode ?? '',
      operatingMode: normalizeOperatingMode(latestApp.operatingMode as string),
      startupsSupported: latestApp.startupsSupported ?? 0,
      studentsMentored: latestApp.studentsMentored ?? 0,
      fundingFacilitated: Number(latestApp.fundingFacilitated ?? 0),
      fundingCurrency: latestApp.fundingCurrency ?? 'USD',
      sdgFocus: normalizeSDG(latestApp.sdgFocus as string[]),
      sectorFocus: normalizeSector(latestApp.sectorFocus as string[]),
      logo: latestApp.logo ?? null,
      website: latestApp.website ?? '',
      linkedin: latestApp.linkedin ?? '',
      email: latestApp.email ?? '',
      phone: latestApp.phone ?? '',
      description: latestApp.description ?? '',
      legalDocuments: normalizeLegalDocs(latestApp.legalDocuments),
    });
  }, [latestApp?.id, latestApp?.updatedAt]);

  // ── Fetch dashboard stats (dependent on application) ──
  const canLoadDashboardData = Boolean(latestApp?.institutionId) || latestApp?.status === 'approved';

  const { data: startupsData } = useApiQuery<any>(
    [...queryKeys.institution.startups(), 'stats'],
    '/api/startups',
    { enabled: hasToken && canLoadDashboardData, requestOptions: { role: 'institution' } },
  );
  const { data: teamData } = useApiQuery<any>(
    [...queryKeys.institution.team(), 'stats'],
    '/api/institution-team',
    { enabled: hasToken && canLoadDashboardData, requestOptions: { role: 'institution' } },
  );
  const { data: programsData } = useApiQuery<any>(
    [...queryKeys.institution.programs(), 'stats'],
    '/api/programs',
    { enabled: hasToken && canLoadDashboardData, requestOptions: { role: 'institution' } },
  );
  const { data: meData } = useApiQuery<any>(
    queryKeys.auth.me(),
    '/api/auth/me/',
    { enabled: hasToken && canLoadDashboardData, requestOptions: { role: 'institution' } },
  );

  // Sync stats + institution from parallel queries
  useEffect(() => {
    if (!canLoadDashboardData) return;

    setStats({
      startupsCount: startupsData?.data?.length || 0,
      teamCount: teamData?.data?.length || 0,
      programsCount: programsData?.data?.length || 0,
      profileViews: meData?.institution?.profileViews || 0,
    });

    if (meData?.institution) {
      setInstitution(meData.institution);
    }
  }, [canLoadDashboardData, startupsData, teamData, programsData, meData]);

  // ── Render: Onboarding wizard ──
  if (showOnboarding && application) {
    return (
      <OnboardingWizard
        application={application}
        formData={formData}
        setFormData={setFormData}
        onBack={() => setShowOnboarding(false)}
        onApplicationUpdate={setApplication}
      />
    );
  }

  // ── Render: Active institution dashboard ──
  if (application && (application.institutionId || institution?.id) && !showOnboarding) {
    return (
      <ApprovedDashboard
        application={application}
        institution={institution}
        stats={stats}
        onEditProfile={() => setShowOnboarding(true)}
        onNudgeVerification={handleNudgeVerification}
      />
    );
  }

  // ── Render: Pending / default view ──
  return (
    <PendingApplicationView
      application={application}
      loading={appsLoading}
      onStartOnboarding={() => setShowOnboarding(true)}
    />
  );
}
