'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ProgressIndicator } from '@/components/ui';
import { OnboardingFormData, InstitutionType, OperatingMode, SDGFocus, SectorFocus } from '@/lib/types';

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

export default function AddInstitutionPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [, setSubmitting] = useState(false);

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

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return formData.type !== null;
            case 2: return formData.name.trim().length > 0;
            case 3: return formData.tagline.trim().length > 0;
            case 4: return formData.city.trim().length > 0 && formData.country.length > 0;
            case 5: return formData.operatingMode !== null;
            case 6: return true; // Optional
            case 7: return true; // Optional
            case 8: return formData.sdgFocus.length > 0;
            case 9: return formData.sectorFocus.length > 0;
            case 10: return true; // Logo optional
            case 11: return true; // Links optional
            case 12: return formData.description.trim().length > 0;
            case 13: return true;
            default: return false;
        }
    };

    const handleSaveDraft = () => {
        // Save to localStorage or API
        console.log('Saving draft:', formData);
        alert('Draft saved successfully!');
    };

    const handlePublish = async () => {
        try {
            setSubmitting(true);
            const response = await fetch('/api/institutions', {
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
                    logo: formData.logo,
                    website: formData.website,
                    linkedin: formData.linkedin,
                    description: formData.description,
                    status: 'published',
                    verified: false,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.message ?? 'Failed to publish institution');
            }

            alert('Institution published successfully!');
            router.push('/dashboard/institutions');
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (currentStep === TOTAL_STEPS && canProceed()) {
                    handlePublish();
                } else if (canProceed()) {
                    handleNext();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStep, formData]);

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

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
                <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </div>

            {/* Slide Content */}
            <div className="min-h-100 flex flex-col">
                <div className="flex-1" key={currentStep}>
                    {renderSlide()}
                </div>
            </div>

            {/* Navigation */}
            {currentStep < 13 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-(--border)">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        Continue
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            )}
        </div>
    );
}
