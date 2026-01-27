"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, ProgressIndicator } from '@/components/ui';
import { InstitutionApplication, OnboardingFormData, InstitutionType, OperatingMode, SDGFocus, SectorFocus } from '@/lib/types';

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
import DescriptionSlide from '@/components/onboarding/DescriptionSlide';
import ReviewPublishSlide from '@/components/onboarding/ReviewPublishSlide';

const TOTAL_STEPS = 13;

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
  description: '',
};

export default function InstitutionDashboardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<InstitutionApplication | null>(null);
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
        const res = await fetch('/api/institution-applications');
        if (!res.ok) throw new Error('Failed to load your application');
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
            countryCode: '',
            operatingMode: null,
            startupsSupported: 0,
            studentsMentored: 0,
            fundingFacilitated: 0,
            fundingCurrency: 'USD',
            sdgFocus: [],
            sectorFocus: [],
            logo: latest.logo ?? null,
            website: latest.website ?? '',
            linkedin: '',
            description: latest.description ?? '',
          });
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
          website: formData.website,
          description: formData.description,
          logo: formData.logo,
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
          website: formData.website,
          description: formData.description,
          logo: formData.logo,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || 'Failed to submit');
      }
      alert('Institution details submitted for admin review!');
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
      case 12: return formData.description.trim().length > 0;
      case 13: return true;
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
            country={formData.country}
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
          <DescriptionSlide
            {...slideProps}
            value={formData.description}
            onChange={(desc: string) => updateFormData('description', desc)}
          />
        );
      case 13:
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
      <main className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent font-semibold text-sm">Complete Your Profile</p>
              <h1 className="text-2xl font-bold text-(--primary)">Institution Details</h1>
            </div>
            <Button variant="ghost" onClick={() => setShowOnboarding(false)}>
              Back to dashboard
            </Button>
          </div>

          <Card className="p-6 space-y-6">
            <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            
            <div className="min-h-[400px]">
              {renderSlide()}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-(--border)">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || submitting}
              >
                Back
              </Button>
              <div className="flex gap-2">
                {currentStep < TOTAL_STEPS && (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || submitting}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
        <div>
          <p className="text-accent font-semibold text-sm">Institution Dashboard</p>
          <h1 className="text-3xl font-bold text-(--primary)">Welcome, institution manager</h1>
          <p className="text-(--secondary)">Your email is verified. Complete your institution details and submit for admin approval to get listed on the platform.</p>
        </div>

        {loading && <p className="text-(--secondary)">Loading your application…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {application && (
          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-(--secondary)">Institution</p>
                <h2 className="text-xl font-semibold text-(--primary)">{application.name}</h2>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                application.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : application.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {application.status === 'approved' ? '✓ Approved' : application.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
              </span>
            </div>
            
            {application.remark && (
              <div className="bg-(--surface-hover) border-l-4 border-accent p-3 rounded">
                <p className="text-sm font-semibold text-(--primary)">Admin Remark:</p>
                <p className="text-sm text-(--secondary)">{application.remark}</p>
              </div>
            )}
            
            <p className="text-(--secondary) text-sm">
              {application.status === 'pending' && 'Your application is being reviewed by our team.'}
              {application.status === 'approved' && 'Your institution has been approved and will appear on the platform soon.'}
              {application.status === 'rejected' && 'Please review the feedback and update your application.'}
            </p>
            
            {application.logo && (
              <div className="w-28 h-28 rounded-lg border border-(--border) bg-(--surface) flex items-center justify-center">
                <img src={application.logo} alt={application.name} className="w-full h-full object-contain" />
              </div>
            )}
            
            <div className="pt-4 border-t border-(--border) flex gap-3">
              {application.status !== 'approved' && (
                <Button onClick={() => setShowOnboarding(true)}>
                  {application.status === 'rejected' ? 'Update & Resubmit' : 'Complete Institution Details'}
                </Button>
              )}
              {application.status === 'approved' && application.institutionId && (
                <Button onClick={() => router.push(`/institutions/${application.institutionId}`)}>
                  View Public Profile
                </Button>
              )}
            </div>
          </Card>
        )}

        {!application && !loading && (
          <Card className="p-6">
            <p className="text-(--secondary)">We could not find a verified application yet. If you just verified, try refreshing in a moment.</p>
          </Card>
        )}

        <div className="flex gap-3">
          <Link href="/mentor-login">
            <Button variant="secondary">Go to mentor tools</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Back home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
