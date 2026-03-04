"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { ProgressIndicator } from '@/components/ui';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { OnboardingWizardLayout } from '@/components/ui/OnboardingWizardLayout';
import { EmailVerificationStep, useEmailVerification } from '@/components/ui/EmailVerificationStep';
import TagInput from '@/components/ui/TagInput';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const TOTAL_STEPS = 5;

const FOCUS_SUGGESTIONS = [
  {
    category: 'Growth & GTM',
    items: ['Product-led Growth (PLG)', 'Go-to-Market Strategy', 'Enterprise Sales'],
  },
  {
    category: 'Fundraising & Finance',
    items: ['Seed Fundraising', 'Pitch Deck Review', 'Financial Modeling'],
  },
  {
    category: 'Product & Tech',
    items: ['MVP Strategy', 'Product Roadmapping', 'AI Productization'],
  },
  {
    category: 'Operations & Scale',
    items: ['Hiring Strategy', 'OKR Implementation', 'ESOP Planning'],
  },
  {
    category: 'Sector Expertise',
    items: ['SaaS', 'FinTech', 'AI / ML'],
  },
  {
    category: 'Special Situations',
    items: ['Pivot Strategy', 'Crisis Management', 'Exit Planning'],
  },
];

export default function MentorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    occupation: '',
  });
  const [focusTags, setFocusTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const emailVerification = useEmailVerification({
    email: form.email,
    name: form.name,
    purpose: 'signup',
  });

  // Auto-submit mentor application when email is verified, then start countdown
  useEffect(() => {
    if (!emailVerification.verified || submitted) return;

    const submitApplication = async () => {
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
            currentRole: form.occupation,
            expertiseAreas: focusTags,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Application failed');

        setSubmitted(true);
        setFeedback({ type: 'success', message: 'Account created! Redirecting to login…' });

        // Start countdown after successful submission
        setCountdown(5);
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownRef.current!);
              router.push('/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        setFeedback({ type: 'error', message: (error as Error).message });
      }
    };

    submitApplication();
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [emailVerification.verified, submitted, form, focusTags, router]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.name.trim().length > 0;
      case 2: return form.occupation.trim().length > 0;
      case 3: return focusTags.length > 0;
      case 4: return form.email.trim().length > 0;
      case 5: return emailVerification.verified;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      setFeedback({ type: 'error', message: 'Please complete this step before continuing.' });
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      setFeedback(null);
      return;
    }

    // Final step — submit mentor application
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
          currentRole: form.occupation,
          expertiseAreas: focusTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Application failed');

      setFeedback({ type: 'success', message: 'Application submitted! Redirecting to login…' });
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
      // Step 1 — Name
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

      // Step 2 — Current Role
      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Current role"
              placeholder="VC Partner, Operator, Coach…"
              value={form.occupation}
              onChange={(e) => updateField('occupation', e.target.value)}
              autoFocus
              required
            />
          </div>
        );

      // Step 3 — Focus Areas (tags)
      case 3:
        return (
          <div className="space-y-4">
            <TagInput
              label="Focus areas"
              tags={focusTags}
              onChange={setFocusTags}
              placeholder="Type a focus area and press Enter…"
              suggestions={FOCUS_SUGGESTIONS}
            />
          </div>
        );

      // Step 4 — Email
      case 4:
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
            <p className="text-xs text-(--secondary)">We&apos;ll send a verification link to confirm this email in the next step.</p>
          </div>
        );

      // Step 5 — Email verification link
      case 5:
        return (
          <EmailVerificationStep
            email={form.email}
            verified={emailVerification.verified}
            magicLinkSent={emailVerification.magicLinkSent}
            loading={emailVerification.loading}
            onSendMagicLink={emailVerification.sendMagicLink}
            onCheckVerification={emailVerification.checkVerification}
            countdown={countdown}
          />
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Your name', 'Current role', 'Focus areas', 'Email', 'Verify email'];
  const isLastStep = step === TOTAL_STEPS;
  const primaryLabel = isLastStep
    ? (emailVerification.verified ? (loading ? 'Submitting…' : 'Submit') : '')
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
