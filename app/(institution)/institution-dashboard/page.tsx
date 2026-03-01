"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InstitutionApplication, OnboardingFormData, InstitutionType, OperatingMode, SDGFocus, SectorFocus, Institution, operatingModeLabels, sdgLabels, sectorLabels } from '@/lib/types';
import { getSessionToken } from '@/lib/auth-utils';
import OnboardingWizard from './_components/OnboardingWizard';
import ApprovedDashboard from './_components/ApprovedDashboard';
import PendingApplicationView from './_components/PendingApplicationView';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);

  // Pick up token from URL query string (magic-link redirect)
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('institution_token', urlToken);

      (async () => {
        try {
          const res = await fetch('/api/auth/me/', {
            headers: { 'Authorization': `Bearer ${urlToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const session = {
              user: { ...data.user, role: 'institution' },
              token: urlToken,
              expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
            };
            localStorage.setItem('xentro_session', JSON.stringify(session));
          } else {
            const session = {
              user: { role: 'institution' },
              token: urlToken,
              expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
            };
            localStorage.setItem('xentro_session', JSON.stringify(session));
          }
        } catch {
          const session = {
            user: { role: 'institution' },
            token: urlToken,
            expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
          };
          localStorage.setItem('xentro_session', JSON.stringify(session));
        }
        router.replace('/institution-dashboard');
      })();
      return;
    }
  }, [searchParams, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = getSessionToken('institution');
        if (!token) {
          router.push('/institution-login');
          return;
        }

        const res = await fetch('/api/institution-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: 'Failed to load your application' }));
          throw new Error(error.message || 'Failed to load your application');
        }
        const payload = await res.json();
        const apps = (payload.data ?? []) as InstitutionApplication[];
        const latest = apps.filter((a) => a.verified).slice(-1)[0] ?? null;
        setApplication(latest);

        if (latest) {
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
            type: latest.type as InstitutionType,
            name: latest.name,
            tagline: latest.tagline ?? '',
            city: latest.city ?? '',
            country: latest.country ?? '',
            countryCode: latest.countryCode ?? '',
            operatingMode: normalizeOperatingMode(latest.operatingMode as string),
            startupsSupported: latest.startupsSupported ?? 0,
            studentsMentored: latest.studentsMentored ?? 0,
            fundingFacilitated: Number(latest.fundingFacilitated ?? 0),
            fundingCurrency: latest.fundingCurrency ?? 'USD',
            sdgFocus: normalizeSDG(latest.sdgFocus as string[]),
            sectorFocus: normalizeSector(latest.sectorFocus as string[]),
            logo: latest.logo ?? null,
            website: latest.website ?? '',
            linkedin: latest.linkedin ?? '',
            email: latest.email ?? '',
            phone: latest.phone ?? '',
            description: latest.description ?? '',
            legalDocuments: (latest.legalDocuments as string[]) ?? [],
          });

          if (latest.status === 'approved') {
            const token = getSessionToken('institution');
            if (token) {
              const [startupsRes, teamRes, programsRes, instRes] = await Promise.all([
                fetch('/api/startups', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/institution-team', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/programs', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/auth/me/', { headers: { 'Authorization': `Bearer ${token}` } }),
              ]);

              const startups = startupsRes.ok ? await startupsRes.json() : { data: [] };
              const team = teamRes.ok ? await teamRes.json() : { data: [] };
              const programs = programsRes.ok ? await programsRes.json() : { data: [] };
              const inst = instRes.ok ? await instRes.json() : { institution: null };

              setStats({
                startupsCount: startups.data?.length || 0,
                teamCount: team.data?.length || 0,
                programsCount: programs.data?.length || 0,
                profileViews: inst.institution?.profileViews || 0,
              });

              if (inst.institution) {
                setInstitution(inst.institution);
              }
            }
          }
        }
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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

  // ── Render: Approved dashboard ──
  if (application?.status === 'approved' && !showOnboarding) {
    return (
      <ApprovedDashboard
        application={application}
        institution={institution}
        stats={stats}
        onEditProfile={() => setShowOnboarding(true)}
      />
    );
  }

  // ── Render: Pending / default view ──
  return (
    <PendingApplicationView
      application={application}
      loading={loading}
      error={error}
      onStartOnboarding={() => setShowOnboarding(true)}
    />
  );
}
