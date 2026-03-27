"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, ProgressIndicator, OnboardingNavbar } from '@/components/ui';
import { toast } from 'sonner';
import { EmailVerificationStep, useEmailVerification } from '@/components/ui/EmailVerificationStep';
import { OnboardingFormData } from '@/lib/types';

const steps = ['Name', 'Admin', 'Email', 'Verify'];

const initialForm: OnboardingFormData = {
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

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingFormData>(initialForm);
  const [email, setEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [appCreating, setAppCreating] = useState(false);

  const emailVerification = useEmailVerification({
    email,
    name: form.name,
    purpose: 'signup',
  });

  // Redirect to login after email verification completes
  useEffect(() => {
    if (emailVerification.verified) {
      const timer = setTimeout(() => {
        router.push('/institution-login');
      }, 2000); // 2 second delay to show the success message
      return () => clearTimeout(timer);
    }
  }, [emailVerification.verified, router]);

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.name.trim().length > 0;
      case 1:
        return adminName.trim().length > 0;
      case 2:
        return email.trim().length > 3;
      case 3:
        return emailVerification.verified;
      default:
        return false;
    }
  };

  const goNext = async () => {
    if (!canProceed()) return;

    // Create institution application when moving from step 2 to step 3
    if (step === 2) {
      setAppCreating(true);
      try {
        const res = await fetch('/api/institution-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: email.trim().toLowerCase(),
            adminName: adminName.trim(),
            adminPhone: adminPhone.trim(),
          }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Failed to create application');

        // Application created, now send magic link
        await emailVerification.sendMagicLink();
        setStep((s) => s + 1);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setAppCreating(false);
      }
      return;
    }

    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Navbar */}
      <OnboardingNavbar />

      <main className="flex-1 py-8 sm:py-12 md:py-16 px-3 sm:px-4" role="main">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <p className="text-accent font-semibold text-xs sm:text-sm uppercase tracking-wide">Institution Onboarding</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--primary)">Join Xentro as an Institution</h1>
            <p className="text-sm sm:text-base text-(--secondary) max-w-2xl mx-auto">Publish your institution profile first. Request the verified badge anytime after setup.</p>
          </div>

          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <ProgressIndicator currentStep={step + 1} totalSteps={steps.length} />

            {step === 0 && (
              <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-semibold text-(--primary)">What&apos;s your institution name?</h2>
                  <p className="text-sm text-(--secondary)">This helps us create your institution profile.</p>
                </div>
                <Input
                  label="Institution Name"
                  placeholder="Y Combinator"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  autoFocus
                  aria-label="Institution name"
                  aria-required="true"
                />
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => goNext()}
                    disabled={!canProceed()}
                    aria-label="Continue to admin details"
                    className="min-w-30 min-h-11"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-semibold text-(--primary)">Tell us about yourself</h2>
                  <p className="text-sm text-(--secondary)">As the institution admin, we need your personal details.</p>
                </div>
                <Input
                  label="Your Full Name"
                  placeholder="Jane Doe"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  autoFocus
                  aria-label="Admin full name"
                  aria-required="true"
                />
                <Input
                  label="Phone Number (optional)"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  aria-label="Admin phone number"
                />
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    onClick={() => goNext()}
                    disabled={!canProceed()}
                    aria-label="Continue to email verification"
                    className="min-w-30 min-h-11"
                  >
                    Continue
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={goPrev}
                    aria-label="Go back to previous step"
                    className="min-h-11"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-semibold text-(--primary)">Verify your email address</h2>
                  <p className="text-sm text-(--secondary)">We&apos;ll send you a secure link to confirm your identity.</p>
                </div>
                <Input
                  label="Work Email Address"
                  type="email"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  aria-label="Work email address"
                  aria-required="true"
                />
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    onClick={goNext}
                    disabled={appCreating || !email || !form.name || !adminName}
                    isLoading={appCreating}
                    aria-label="Send verification link"
                    className="min-h-11"
                  >
                    {appCreating ? 'Sending...' : 'Send Verification Link'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={goPrev}
                    disabled={appCreating}
                    aria-label="Go back to previous step"
                    className="min-h-11"
                  >
                    Back
                  </Button>
                </div>

              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
                <EmailVerificationStep
                  email={email}
                  verified={emailVerification.verified}
                  magicLinkSent={emailVerification.magicLinkSent}
                  loading={emailVerification.loading}
                  onSendMagicLink={emailVerification.sendMagicLink}
                  onCheckVerification={emailVerification.checkVerification}
                />
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={goPrev}
                    aria-label="Go back to previous step"
                    className="min-h-11"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

          </Card>
        </div>
      </main>
    </div>
  );
}
