"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, ProgressIndicator } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { InstitutionApplication, OnboardingFormData, InstitutionType, OperatingMode, SDGFocus, SectorFocus, Institution } from '@/lib/types';

// Import all slides
import InstitutionTypeSlide from '@/components/onboarding/InstitutionTypeSlide';
import InstitutionNameSlide from '@/components/onboarding/InstitutionNameSlide';
import TaglineSlide from '@/components/onboarding/TaglineSlide';
import LocationSlide from '@/components/onboarding/LocationSlide';
import OperatingModeSlide from '@/components/onboarding/OperatingModeSlide';
import ImpactMetricsSlide from '@/components/onboarding/ImpactMetricsSlide';
import FundingImpactSlide from '@/components/onboarding/FundingImpactSlide';
import SDGFocusSlide from '@/components/onboarding/SDGFocusSlide';
import SectorFocusSlide from '@/components/onboarding/SectorFocusSlide';
import LogoUploadSlide from '@/components/onboarding/LogoUploadSlide';
import WebsiteLinksSlide from '@/components/onboarding/WebsiteLinksSlide';
import ContactDetailsSlide from '@/components/onboarding/ContactDetailsSlide';
import LegalDocumentsSlide from '@/components/onboarding/LegalDocumentsSlide';
import DescriptionSlide from '@/components/onboarding/DescriptionSlide';
import ReviewPublishSlide from '@/components/onboarding/ReviewPublishSlide';

const TOTAL_STEPS = 15;

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
  const [application, setApplication] = useState<InstitutionApplication | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ programsCount: 0, teamCount: 0, startupsCount: 0, profileViews: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showOnboarding) return;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (currentStep === TOTAL_STEPS && canProceed()) {
          handlePublish();
        } else if (canProceed()) {
          handleNext();
        }
      }
    };

    if (showOnboarding) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showOnboarding, currentStep, formData, submitting]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('institution_token');
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

        // Pre-fill form with application data if available
        if (latest) {
          setFormData({
            type: latest.type as InstitutionType,
            name: latest.name,
            tagline: latest.tagline ?? '',
            city: latest.city ?? '',
            country: latest.country ?? '',
            countryCode: latest.countryCode ?? '',
            operatingMode: (latest.operatingMode as OperatingMode) ?? null,
            startupsSupported: latest.startupsSupported ?? 0,
            studentsMentored: latest.studentsMentored ?? 0,
            fundingFacilitated: Number(latest.fundingFacilitated ?? 0),
            fundingCurrency: latest.fundingCurrency ?? 'USD',
            sdgFocus: (latest.sdgFocus as SDGFocus[]) ?? [],
            sectorFocus: (latest.sectorFocus as SectorFocus[]) ?? [],
            logo: latest.logo ?? null,
            website: latest.website ?? '',
            linkedin: latest.linkedin ?? '',
            email: latest.email ?? '',
            phone: latest.phone ?? '',
            description: latest.description ?? '',
            legalDocuments: (latest.legalDocuments as string[]) ?? [],
          });

          // If approved, fetch dashboard stats
          if (latest.status === 'approved') {
            const token = localStorage.getItem('institution_token');
            if (token) {
              const [startupsRes, teamRes, programsRes, instRes] = await Promise.all([
                fetch('/api/startups', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/institution-team', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/programs', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/institution-auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
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

  const updateFormData = <K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setDirection('forward');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (!application?.id) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/institution-applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          tagline: formData.tagline,
          city: formData.city,
          country: formData.country,
          countryCode: formData.countryCode,
          operatingMode: formData.operatingMode,
          startupsSupported: formData.startupsSupported,
          studentsMentored: formData.studentsMentored,
          fundingFacilitated: formData.fundingFacilitated,
          fundingCurrency: formData.fundingCurrency,
          sdgFocus: formData.sdgFocus,
          sectorFocus: formData.sectorFocus,
          logo: formData.logo,
          website: formData.website,
          linkedin: formData.linkedin,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          legalDocuments: formData.legalDocuments,
        }),
      });
      if (!res.ok) throw new Error('Failed to save draft');
      alert('Draft saved successfully!');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!application?.id) return;

    // Validate all required fields before submission
    const errors: string[] = [];
    if (!formData.type) errors.push('Institution type');
    if (!formData.name.trim()) errors.push('Institution name');
    if (!formData.tagline.trim()) errors.push('Tagline');
    if (!formData.city.trim()) errors.push('City');
    if (!formData.country.trim()) errors.push('Country');
    if (!formData.description.trim()) errors.push('Description');

    if (errors.length > 0) {
      alert(`Please complete the following required fields:\\n- ${errors.join('\\n- ')}`);
      return;
    }

    try {
      setSubmitting(true);
      // Use POST endpoint for final submission with validation
      const res = await fetch(`/api/institution-applications/${application.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          tagline: formData.tagline,
          city: formData.city,
          country: formData.country,
          countryCode: formData.countryCode,
          operatingMode: formData.operatingMode,
          startupsSupported: formData.startupsSupported,
          studentsMentored: formData.studentsMentored,
          fundingFacilitated: formData.fundingFacilitated,
          fundingCurrency: formData.fundingCurrency,
          sdgFocus: formData.sdgFocus,
          sectorFocus: formData.sectorFocus,
          logo: formData.logo,
          website: formData.website,
          linkedin: formData.linkedin,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          legalDocuments: formData.legalDocuments,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || 'Failed to submit');
      }
      const result = await res.json();
      alert(result.message || 'Application submitted for approval successfully!');
      setShowOnboarding(false);
      // Reload application to show updated status
      const reload = await fetch('/api/institution-applications');
      if (reload.ok) {
        const payload = await reload.json();
        const apps = (payload.data ?? []) as InstitutionApplication[];
        const latest = apps.filter((a) => a.verified).slice(-1)[0] ?? null;
        setApplication(latest);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return formData.type !== null;
      case 2: return formData.name.trim().length > 0;
      case 3: return formData.tagline.trim().length > 0;
      case 4: return formData.city.trim().length > 0 && formData.country.length > 0;
      case 5: return formData.operatingMode !== null;
      case 6: return true;
      case 7: return true;
      case 8: return formData.sdgFocus.length > 0;
      case 9: return formData.sectorFocus.length > 0;
      case 10: return true;
      case 11: return true;
      case 12: return formData.email.trim().length > 0;
      case 13: return true; // Legal documents optional
      case 14: return formData.description.trim().length > 0;
      case 15: return true;
      default: return false;
    }
  };

  const renderSlide = () => {
    const animationClass = direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft';
    const slideProps = { className: animationClass };

    switch (currentStep) {
      case 1:
        return (
          <InstitutionTypeSlide
            {...slideProps}
            value={formData.type}
            onChange={(type: InstitutionType) => updateFormData('type', type)}
          />
        );
      case 2:
        return (
          <InstitutionNameSlide
            {...slideProps}
            value={formData.name}
            onChange={(name: string) => updateFormData('name', name)}
          />
        );
      case 3:
        return (
          <TaglineSlide
            {...slideProps}
            value={formData.tagline}
            onChange={(tagline: string) => updateFormData('tagline', tagline)}
          />
        );
      case 4:
        return (
          <LocationSlide
            {...slideProps}
            city={formData.city}
            countryCode={formData.countryCode}
            onCityChange={(city: string) => updateFormData('city', city)}
            onCountryChange={(country: string, code: string) => {
              updateFormData('country', country);
              updateFormData('countryCode', code);
            }}
          />
        );
      case 5:
        return (
          <OperatingModeSlide
            {...slideProps}
            value={formData.operatingMode}
            onChange={(mode: OperatingMode) => updateFormData('operatingMode', mode)}
          />
        );
      case 6:
        return (
          <ImpactMetricsSlide
            {...slideProps}
            startupsSupported={formData.startupsSupported}
            studentsMentored={formData.studentsMentored}
            onStartupsChange={(val: number) => updateFormData('startupsSupported', val)}
            onStudentsChange={(val: number) => updateFormData('studentsMentored', val)}
          />
        );
      case 7:
        return (
          <FundingImpactSlide
            {...slideProps}
            amount={formData.fundingFacilitated}
            currency={formData.fundingCurrency}
            onAmountChange={(val: number) => updateFormData('fundingFacilitated', val)}
            onCurrencyChange={(val: string) => updateFormData('fundingCurrency', val)}
          />
        );
      case 8:
        return (
          <SDGFocusSlide
            {...slideProps}
            value={formData.sdgFocus}
            onChange={(sdgs: SDGFocus[]) => updateFormData('sdgFocus', sdgs)}
          />
        );
      case 9:
        return (
          <SectorFocusSlide
            {...slideProps}
            value={formData.sectorFocus}
            onChange={(sectors: SectorFocus[]) => updateFormData('sectorFocus', sectors)}
          />
        );
      case 10:
        return (
          <LogoUploadSlide
            {...slideProps}
            value={formData.logo}
            onChange={(logo: string | null) => updateFormData('logo', logo)}
          />
        );
      case 11:
        return (
          <WebsiteLinksSlide
            {...slideProps}
            website={formData.website}
            linkedin={formData.linkedin}
            onWebsiteChange={(val: string) => updateFormData('website', val)}
            onLinkedinChange={(val: string) => updateFormData('linkedin', val)}
          />
        );
      case 12:
        return (
          <ContactDetailsSlide
            {...slideProps}
            email={formData.email}
            phone={formData.phone}
            onEmailChange={(val: string) => updateFormData('email', val)}
            onPhoneChange={(val: string) => updateFormData('phone', val)}
          />
        );
      case 13:
        return (
          <LegalDocumentsSlide
            formData={formData}
            onChange={(updated) => setFormData({ ...formData, ...updated })}
          />
        );
      case 14:
        return (
          <DescriptionSlide
            {...slideProps}
            value={formData.description}
            onChange={(desc: string) => updateFormData('description', desc)}
          />
        );
      case 15:
        return (
          <ReviewPublishSlide
            {...slideProps}
            formData={formData}
            onEdit={(step: number) => setCurrentStep(step)}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        );
      default:
        return null;
    }
  };

  if (showOnboarding) {
    return (
      <main className="min-h-screen bg-background py-8 px-4" role="main">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-wide">Phase 2: Complete Profile</p>
              <h1 className="text-2xl font-bold text-(--primary)">Institution Details</h1>
            </div>
            <Button variant="ghost" onClick={() => setShowOnboarding(false)} aria-label="Back to dashboard">
              ← Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-6 animate-fadeIn">
              <Card className="p-6 space-y-6">
                <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

                <div className="min-h-100">
                  {renderSlide()}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-(--border)">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1 || submitting}
                    aria-label="Go to previous step"
                    className="min-h-11"
                  >
                    ← Back
                  </Button>
                  <div className="flex gap-2">
                    {currentStep < TOTAL_STEPS && (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed() || submitting}
                        aria-label="Go to next step"
                        className="min-h-11"
                      >
                        Next →
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Live Preview Sidebar */}
            <div className="lg:col-span-1 space-y-6 animate-fadeIn stagger-1">
              <Card className="p-6 sticky top-6">
                <h3 className="text-sm font-semibold text-(--secondary) uppercase tracking-wide mb-4">Live Preview</h3>

                <div className="space-y-4">
                  {/* Institution Logo & Name */}
                  <div className="flex items-start gap-3 pb-4 border-b border-(--border)">
                    <div className="w-16 h-16 rounded-lg bg-(--surface) border border-(--border) flex items-center justify-center overflow-hidden shrink-0">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl" aria-hidden="true">🏛️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-(--primary) truncate">
                        {formData.name || 'Institution Name'}
                      </h4>
                      {formData.type && (
                        <p className="text-xs text-(--secondary) mt-1">
                          {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tagline */}
                  {formData.tagline && (
                    <div>
                      <p className="text-xs font-medium text-(--secondary) mb-1">Tagline</p>
                      <p className="text-sm text-(--primary) italic">\"{formData.tagline}\"</p>
                    </div>
                  )}

                  {/* Location */}
                  {(formData.city || formData.country) && (
                    <div>
                      <p className="text-xs font-medium text-(--secondary) mb-1">Location</p>
                      <div className="flex items-center gap-1 text-sm text-(--primary)">
                        <svg className="w-4 h-4 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{[formData.city, formData.country].filter(Boolean).join(', ') || 'Not specified'}</span>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {formData.website && (
                    <div>
                      <p className="text-xs font-medium text-(--secondary) mb-1">Website</p>
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline break-all"
                      >
                        {formData.website}
                      </a>
                    </div>
                  )}

                  {/* Description */}
                  {formData.description && (
                    <div>
                      <p className="text-xs font-medium text-(--secondary) mb-1">Description</p>
                      <p className="text-sm text-(--primary) line-clamp-4">{formData.description}</p>
                    </div>
                  )}

                  {/* SDG Focus */}
                  {formData.sdgFocus.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-(--secondary) mb-2">SDG Focus</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.sdgFocus.map((sdg) => (
                          <span key={sdg} className="text-xs px-2 py-1 rounded-full bg-(--surface-hover) text-(--primary)">
                            {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sector Focus */}
                  {formData.sectorFocus.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-(--secondary) mb-2">Sectors</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.sectorFocus.map((sector) => (
                          <span key={sector} className="text-xs px-2 py-1 rounded-full bg-(--accent-light) text-accent">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion Status */}
                  <div className="pt-4 border-t border-(--border)">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-(--secondary)">Profile Completion</span>
                      <span className="font-semibold text-(--primary)">
                        {Math.round((
                          (formData.type ? 1 : 0) +
                          (formData.name.trim() ? 1 : 0) +
                          (formData.tagline.trim() ? 1 : 0) +
                          (formData.city.trim() ? 1 : 0) +
                          (formData.country.trim() ? 1 : 0) +
                          (formData.description.trim() ? 1 : 0)
                        ) / 6 * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-(--surface-hover) rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{
                          width: `${Math.round((
                            (formData.type ? 1 : 0) +
                            (formData.name.trim() ? 1 : 0) +
                            (formData.tagline.trim() ? 1 : 0) +
                            (formData.city.trim() ? 1 : 0) +
                            (formData.country.trim() ? 1 : 0) +
                            (formData.description.trim() ? 1 : 0)
                          ) / 6 * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // If application is approved, show dashboard with sidebar
  if (application?.status === 'approved' && !showOnboarding) {
    return (
      <DashboardSidebar>
        <div className="p-8 space-y-6 animate-fadeIn">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-(--primary) mb-2">Welcome back! 👋</h1>
            <p className="text-(--secondary)">
              Manage your institution profile, programs, and team members
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="text-sm text-(--secondary)">Active Programs</p>
                  <p className="text-2xl font-bold text-(--primary)">{stats.programsCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-sm text-(--secondary)">Team Members</p>
                  <p className="text-2xl font-bold text-(--primary)">{stats.teamCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <p className="text-sm text-(--secondary)">Portfolio Startups</p>
                  <p className="text-2xl font-bold text-(--primary)">{stats.startupsCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-(--secondary)">Profile Views</p>
                  <p className="text-2xl font-bold text-(--primary)">{stats.profileViews.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Institution Profile Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-(--primary) mb-1">Institution Profile</h2>
                <p className="text-sm text-(--secondary)">Your institution is live on the platform</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                ✓ Published
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                {application.logo && (
                  <div className="w-20 h-20 rounded-lg border border-(--border) bg-(--surface) flex items-center justify-center overflow-hidden shrink-0">
                    <img src={application.logo} alt={application.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-(--primary) text-lg">{application.name}</h3>
                  {application.tagline && (
                    <p className="text-sm text-(--secondary) mb-2">{application.tagline}</p>
                  )}
                  {application.city && application.country && (
                    <p className="text-sm text-(--secondary)">📍 {application.city}, {application.country}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--secondary)">Email</span>
                  <span className="text-sm text-(--primary)">{application.email}</span>
                </div>
                {application.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--secondary)">Phone</span>
                    <span className="text-sm text-(--primary)">{application.phone}</span>
                  </div>
                )}
                {application.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--secondary)">Website</span>
                    <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                      Visit →
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-(--border)">
              <Link href="/institution-edit">
                <Button>Edit Profile</Button>
              </Link>
              {(institution?.slug || application.institutionId) && (
                <>
                  <Link href={`/institution-preview/${application.institutionId}`}>
                    <Button>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview & Edit
                    </Button>
                  </Link>
                  <a href={`/institutions/${institution?.slug || application.institutionId}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Public Profile
                    </Button>
                  </a>
                </>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-(--primary) mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/institution-dashboard/startups" className="p-4 rounded-lg border border-(--border) hover:border-accent hover:bg-(--surface-hover) transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <p className="font-semibold text-(--primary) group-hover:text-accent">Add Startup</p>
                    <p className="text-sm text-(--secondary)">Register startups you're supporting</p>
                  </div>
                </div>
              </Link>

              <Link href="/institution-dashboard/projects" className="p-4 rounded-lg border border-(--border) hover:border-accent hover:bg-(--surface-hover) transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📁</span>
                  <div>
                    <p className="font-semibold text-(--primary) group-hover:text-accent">Add Project</p>
                    <p className="text-sm text-(--secondary)">Showcase your initiatives</p>
                  </div>
                </div>
              </Link>

              <Link href="/institution-dashboard/team" className="p-4 rounded-lg border border-(--border) hover:border-accent hover:bg-(--surface-hover) transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-semibold text-(--primary) group-hover:text-accent">Add Team Member</p>
                    <p className="text-sm text-(--secondary)">Build your team directory</p>
                  </div>
                </div>
              </Link>

              <Link href="/institution-dashboard/analytics" className="p-4 rounded-lg border border-(--border) hover:border-accent hover:bg-(--surface-hover) transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-semibold text-(--primary) group-hover:text-accent">View Analytics</p>
                    <p className="text-sm text-(--secondary)">Track your impact</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4" role="main">
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
        <div>
          <p className="text-accent font-semibold text-sm uppercase tracking-wide">Phase 1 Complete ✓</p>
          <h1 className="text-3xl font-bold text-(--primary)">Institution Dashboard</h1>
          <p className="text-(--secondary)">Your email is verified. Complete Phase 2 by filling in all institution details and submitting for admin approval.</p>
        </div>

        {loading && <p className="text-(--secondary)">Loading your application…</p>}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900" role="alert">
            {error}
          </div>
        )}

        {application && (
          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-(--secondary)">Institution Name</p>
                <h2 className="text-xl font-semibold text-(--primary)">{application.name}</h2>
                <p className="text-xs text-(--secondary) mt-1">Email: {application.email}</p>
              </div>
              <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${application.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : application.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                {application.status === 'approved' ? '✓ Approved' : application.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
              </span>
            </div>

            {application.remark && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded" role="status">
                <p className="text-sm font-semibold text-blue-900">Admin Feedback:</p>
                <p className="text-sm text-blue-800 mt-1">{application.remark}</p>
              </div>
            )}

            <p className="text-(--secondary) text-sm">
              {application.status === 'pending' && !application.description && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Complete Phase 2 onboarding to submit your application for admin review.
                </span>
              )}
              {application.status === 'pending' && application.description && "Your application has been submitted and is being reviewed by our team. You'll be notified once a decision is made."}
              {application.status === 'approved' && 'Congratulations! Your institution has been approved and is now published on the platform.'}
              {application.status === 'rejected' && 'Your application needs updates. Please review the admin feedback above and resubmit.'}
            </p>

            {application.logo && (
              <div className="w-28 h-28 rounded-lg border border-(--border) bg-(--surface) flex items-center justify-center overflow-hidden">
                <img src={application.logo} alt={application.name} className="w-full h-full object-contain" />
              </div>
            )}

            <div className="pt-4 border-t border-(--border) flex gap-3">
              {application.status !== 'approved' && (
                <Button onClick={() => setShowOnboarding(true)} className="min-h-11">
                  {application.status === 'rejected' ? 'Update & Resubmit' : application.description ? 'Edit Details' : '→ Start Phase 2'}
                </Button>
              )}
              {application.status === 'approved' && application.institutionId && (
                <>
                  <a href={`/institutions/${application.institutionId}`} target="_blank" rel="noopener noreferrer">
                    <Button className="min-h-11">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Public Profile
                    </Button>
                  </a>
                  <Button onClick={() => router.push(`/institution-preview/${application.institutionId}`)} variant="secondary" className="min-h-11">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview & Edit
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        {!application && !loading && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-(--surface-hover) flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-(--primary) mb-2">No verified application found</h3>
              <p className="text-(--secondary)">Please complete Phase 1 by verifying your email. If you just verified, try refreshing the page.</p>
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Link href="/">
            <Button variant="ghost">Back home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
