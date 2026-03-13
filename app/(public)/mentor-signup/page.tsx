"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { OnboardingWizardLayout } from '@/components/ui/OnboardingWizardLayout';
import { EmailVerificationStep, useEmailVerification } from '@/components/ui/EmailVerificationStep';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const TOTAL_STEPS = 2;

export default function MentorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
  });

  const emailVerification = useEmailVerification({
    email: form.email,
    name: form.name,
    purpose: 'signup',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.name.trim().length > 0;
      case 2: return form.email.trim().length > 0 && emailVerification.verified;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      setFeedback({ type: 'error', message: 'Please complete this step before continuing.' });
      return;
    }

    if (step === 1) {
      setStep((prev) => prev + 1);
      setFeedback(null);
      return;
    }

    // Step 2 complete: create mentor account with minimal identity fields.
    setLoading(true);
    setFeedback(null);
    try {
      const nameParts = form.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const res = await fetch('/api/mentors/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          firstName,
          lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Application failed');

      setFeedback({ type: 'success', message: 'Account created. Continue to login to finish mentor onboarding.' });
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setFeedback(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const renderStep = () => {
    switch (step) {
      // Step 1 - Full name
      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="Full name"
              placeholder="Jordan Patel"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              autoFocus
              required
            />
          </div>
        );

      // Step 2 - Email + verification
      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Work email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              autoFocus
              required
            />
            <EmailVerificationStep
              email={form.email}
              verified={emailVerification.verified}
              magicLinkSent={emailVerification.magicLinkSent}
              loading={emailVerification.loading}
              onSendMagicLink={emailVerification.sendMagicLink}
              onCheckVerification={emailVerification.checkVerification}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Your name', 'Verify email'];
  const isLastStep = step === TOTAL_STEPS;
  const primaryLabel = isLastStep
    ? (loading ? 'Creating account...' : 'Continue to login')
    : 'Continue';

  const combinedFeedback = emailVerification.feedback || feedback;

  return (
    <div className="min-h-screen bg-(--surface) flex flex-col">
      <OnboardingNavbar />

      <OnboardingWizardLayout
        title="Mentor onboarding"
        subtitle={stepTitles[step - 1]}
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        feedback={combinedFeedback}
        onBack={handleBack}
        onNext={handleNext}
        primaryLabel={primaryLabel}
        loading={loading}
        canProceed={canProceed()}
      >
        {renderStep()}
      </OnboardingWizardLayout>
    </div>
  );
}
