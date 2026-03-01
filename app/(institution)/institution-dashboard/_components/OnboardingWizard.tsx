"use client";

import { useState, useRef } from 'react';
import { Card, Button, ProgressIndicator } from '@/components/ui';
import { OnboardingFormData, InstitutionType, OperatingMode, SDGFocus, SectorFocus } from '@/lib/types';
import { InstitutionApplication } from '@/lib/types';
import { getSessionToken } from '@/lib/auth-utils';

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
import OnboardingPreviewSidebar from './OnboardingPreviewSidebar';

const TOTAL_STEPS = 15;

interface OnboardingWizardProps {
	application: InstitutionApplication;
	formData: OnboardingFormData;
	setFormData: (data: OnboardingFormData) => void;
	onBack: () => void;
	onApplicationUpdate: (app: InstitutionApplication) => void;
}

export default function OnboardingWizard({
	application,
	formData,
	setFormData,
	onBack,
	onApplicationUpdate,
}: OnboardingWizardProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Keep a ref to the latest formData to avoid stale closures in callbacks
	const formDataRef = useRef(formData);
	formDataRef.current = formData;

	const updateFormData = <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => {
		setFormData({ ...formDataRef.current, [key]: value });
	};

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			setDirection('forward');
			setCurrentStep((s) => s + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setDirection('backward');
			setCurrentStep((s) => s - 1);
		}
	};

	const handleSaveDraft = async () => {
		if (!application) return;
		try {
			const token = getSessionToken('institution');
			const res = await fetch(`/api/institution-applications/${application.id}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					type: formData.type,
					name: formData.name,
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
		} catch (err) {
			setError((err as Error).message);
		}
	};

	const handlePublish = async () => {
		if (submitting || !application) return;
		setSubmitting(true);

		const errors: string[] = [];
		if (!formData.type) errors.push('Institution type is required');
		if (!formData.name.trim()) errors.push('Name is required');
		if (!formData.tagline.trim()) errors.push('Tagline is required');
		if (!formData.city.trim()) errors.push('City is required');
		if (!formData.sdgFocus.length) errors.push('At least one SDG focus');
		if (!formData.sectorFocus.length) errors.push('At least one sector');
		if (!formData.email.trim()) errors.push('Contact email is required');
		if (!formData.description.trim()) errors.push('Description is required');

		if (errors.length) {
			setError(errors.join(', '));
			setSubmitting(false);
			return;
		}

		try {
			const token = getSessionToken('institution');
			const res = await fetch(`/api/institution-applications/${application.id}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					type: formData.type,
					name: formData.name,
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
					status: 'pending',
				}),
			});

			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.message || 'Failed to submit');
			}

			const result = await res.json();
			onApplicationUpdate(result.data ?? result);

			// Reload application
			const reload = await fetch('/api/institution-applications', {
				headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
			});
			if (reload.ok) {
				const payload = await reload.json();
				const apps = (payload.data ?? []) as InstitutionApplication[];
				const latest = apps.filter((a) => a.verified).slice(-1)[0] ?? null;
				if (latest) onApplicationUpdate(latest);
			}

			onBack();
		} catch (err) {
			setError((err as Error).message);
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
			case 13: return true;
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
				return <InstitutionTypeSlide {...slideProps} value={formData.type} onChange={(type: InstitutionType) => updateFormData('type', type)} />;
			case 2:
				return <InstitutionNameSlide {...slideProps} value={formData.name} onChange={(name: string) => updateFormData('name', name)} />;
			case 3:
				return <TaglineSlide {...slideProps} value={formData.tagline} onChange={(tagline: string) => updateFormData('tagline', tagline)} />;
			case 4:
				return (
					<LocationSlide
						{...slideProps}
						city={formData.city}
						countryCode={formData.countryCode}
						onCityChange={(city: string) => updateFormData('city', city)}
						onCountryChange={(country: string, code: string) => { setFormData({ ...formDataRef.current, country, countryCode: code }); }}
					/>
				);
			case 5:
				return <OperatingModeSlide {...slideProps} value={formData.operatingMode} onChange={(mode: OperatingMode) => updateFormData('operatingMode', mode)} />;
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
				return <SDGFocusSlide {...slideProps} value={formData.sdgFocus} onChange={(sdgs: SDGFocus[]) => updateFormData('sdgFocus', sdgs)} />;
			case 9:
				return <SectorFocusSlide {...slideProps} value={formData.sectorFocus} onChange={(sectors: SectorFocus[]) => updateFormData('sectorFocus', sectors)} />;
			case 10:
				return <LogoUploadSlide {...slideProps} value={formData.logo} onChange={(logo: string | null) => updateFormData('logo', logo)} />;
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
				return <LegalDocumentsSlide formData={formData} onChange={(updated) => setFormData({ ...formData, ...updated })} />;
			case 14:
				return <DescriptionSlide {...slideProps} value={formData.description} onChange={(desc: string) => updateFormData('description', desc)} />;
			case 15:
				return <ReviewPublishSlide {...slideProps} formData={formData} onEdit={(step: number) => setCurrentStep(step)} onSaveDraft={handleSaveDraft} onPublish={handlePublish} />;
			default:
				return null;
		}
	};

	return (
		<main className="min-h-screen bg-background py-8 px-4" role="main">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<div>
						<p className="text-accent font-semibold text-sm uppercase tracking-wide">Phase 2: Complete Profile</p>
						<h1 className="text-2xl font-bold text-(--primary)">Institution Details</h1>
					</div>
					<Button variant="ghost" onClick={onBack} aria-label="Back to dashboard">
						← Back to Dashboard
					</Button>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900 mb-4" role="alert">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Form Area */}
					<div className="lg:col-span-2 space-y-6 animate-fadeIn">
						<Card className="p-6 space-y-6">
							<ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
							<div className="min-h-100">{renderSlide()}</div>
							<div className="flex items-center justify-between pt-4 border-t border-(--border)">
								<Button variant="ghost" onClick={handleBack} disabled={currentStep === 1 || submitting} aria-label="Go to previous step" className="min-h-11">
									← Back
								</Button>
								<div className="flex gap-2">
									{currentStep < TOTAL_STEPS && (
										<Button onClick={handleNext} disabled={!canProceed() || submitting} aria-label="Go to next step" className="min-h-11">
											Next →
										</Button>
									)}
								</div>
							</div>
						</Card>
					</div>

					{/* Live Preview Sidebar */}
					<div className="lg:col-span-1 space-y-6 animate-fadeIn stagger-1">
						<OnboardingPreviewSidebar formData={formData} />
					</div>
				</div>
			</div>
		</main>
	);
}
