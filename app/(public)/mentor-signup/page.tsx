"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Card, Input } from '@/components/ui';
import { ProgressIndicator } from '@/components/ui';
import TagInput from '@/components/ui/TagInput';
import { cn } from '@/lib/utils';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const TOTAL_STEPS = 5;

const FOCUS_SUGGESTIONS = [
  {
    category: '🚀 Growth & GTM',
    items: ['Product-led Growth (PLG)', 'Go-to-Market Strategy', 'Enterprise Sales'],
  },
  {
    category: '💰 Fundraising & Finance',
    items: ['Seed Fundraising', 'Pitch Deck Review', 'Financial Modeling'],
  },
  {
    category: '🧠 Product & Tech',
    items: ['MVP Strategy', 'Product Roadmapping', 'AI Productization'],
  },
  {
    category: '🏢 Operations & Scale',
    items: ['Hiring Strategy', 'OKR Implementation', 'ESOP Planning'],
  },
  {
    category: '🌍 Sector Expertise',
    items: ['SaaS', 'FinTech', 'AI / ML'],
  },
  {
    category: '🧩 Special Situations',
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
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-submit mentor application when email is verified, then start countdown
  useEffect(() => {
    if (!verified || submitted) return;

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
  }, [verified, submitted, form, focusTags, router]);

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
      case 5: return verified;
      default: return false;
    }
  };

  const handleSendMagicLink = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/auth/magic-link/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          purpose: 'signup',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to send verification link');
      setMagicLinkSent(true);
      setFeedback({ type: 'success', message: `Verification link sent to ${form.email}` });
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/auth/magic-link/status/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification check failed');

      if (data.verified) {
        setVerified(true);
        setFeedback({ type: 'success', message: 'Email verified!' });
      } else {
        setFeedback({ type: 'error', message: 'Not verified yet. Check your email and click the link.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
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
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                {verified ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {verified ? (
                <>
                  <h3 className="text-lg font-semibold text-green-700 mb-1">Email verified!</h3>
                  <p className="text-sm text-(--secondary)">
                    Redirecting to login in <strong>{countdown ?? 0}</strong> second{countdown !== 1 ? 's' : ''}…
                  </p>
                </>
              ) : magicLinkSent ? (
                <>
                  <h3 className="text-lg font-semibold text-(--primary) mb-1">Check your inbox</h3>
                  <p className="text-sm text-(--secondary)">
                    We sent a verification link to <strong>{form.email}</strong>.<br />
                    Click the link in the email, then come back here.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-(--primary) mb-1">Verify your email</h3>
                  <p className="text-sm text-(--secondary)">
                    We&apos;ll send a verification link to <strong>{form.email}</strong>
                  </p>
                </>
              )}
            </div>

            {verified ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </div>
                <div className="w-full bg-(--border) rounded-full h-1.5 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${((countdown ?? 0) / 5) * 100}%` }} />
                </div>
              </div>
            ) : !magicLinkSent ? (
              <Button onClick={handleSendMagicLink} disabled={loading} isLoading={loading} className="w-full">
                {loading ? 'Sending…' : 'Send verification link'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button onClick={handleCheckVerification} disabled={loading} isLoading={loading} className="w-full">
                  {loading ? 'Checking…' : 'I\'ve clicked the link'}
                </Button>
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  disabled={loading}
                  className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                >
                  Resend verification link
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Your name', 'Current role', 'Focus areas', 'Email', 'Verify email'];
  const isLastStep = step === TOTAL_STEPS;
  const primaryLabel = isLastStep
    ? (verified ? (loading ? 'Submitting…' : 'Submit for approval') : '')
    : 'Continue';

  return (
    <div className="min-h-screen bg-(--surface) flex flex-col">
      {/* Minimal Navbar */}
      <nav className="h-16 border-b border-(--border) bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-(--primary)">Xentro</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-3xl p-6 md:p-8 space-y-6 shadow-lg bg-white/90 backdrop-blur animate-fadeInUp">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-(--primary)">Mentor onboarding</h1>
            <p className="text-sm text-(--secondary)">{stepTitles[step - 1]}</p>
          </div>

          <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

          <div className="bg-(--surface-hover) border border-(--border) rounded-lg p-5 md:p-6 space-y-4">
            {renderStep()}
          </div>

          {feedback && (
            <div
              className={cn(
                'rounded-lg px-4 py-3 text-sm border',
                feedback.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              )}
            >
              {feedback.message}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading}>
              Back
            </Button>
            {/* Hide the main action button on step 5 until verified */}
            {(step < TOTAL_STEPS || verified) && (
              <Button onClick={handleNext} disabled={loading || !canProceed()}>
                {primaryLabel}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
