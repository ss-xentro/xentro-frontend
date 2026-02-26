"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Input, Button, ProgressIndicator } from '@/components/ui';
import { OnboardingFormData } from '@/lib/types';

const steps = ['Name', 'Email', 'Verify'];

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
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.name.trim().length > 0;
      case 1:
        return email.trim().length > 3;
      case 2:
        return verified;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step < steps.length - 1 && canProceed()) setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const handleSendLink = async () => {
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/institution-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Failed to send magic link');
      setMagicLink(payload.magicLink as string);
      setMessage('Magic link sent. Check your inbox or verify here.');
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!magicLink) return;
    // Navigate to the magic link — the backend will verify the token,
    // issue a JWT, and redirect to the institution dashboard
    window.location.href = magicLink;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Navbar */}
      <nav className="h-16 border-b border-(--border) bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-(--primary)">Xentro</span>
          </Link>
          <Link
            href="/join"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </Link>
        </div>
      </nav>

    <main className="flex-1 py-16 px-4" role="main">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-accent font-semibold text-sm uppercase tracking-wide">Institution Onboarding</p>
          <h1 className="text-3xl font-bold text-(--primary)">Join Xentro as an Institution</h1>
          <p className="text-(--secondary) max-w-2xl mx-auto">Get verified and start showcasing your programs to aspiring entrepreneurs and innovators.</p>
        </div>

        <Card className="p-6 space-y-6">
          <ProgressIndicator currentStep={step + 1} totalSteps={steps.length} />

          {step === 0 && (
            <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-(--primary)">What&apos;s your institution name?</h2>
                <p className="text-sm text-(--secondary)">This helps us create your verified profile.</p>
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
                  onClick={goNext}
                  disabled={!canProceed()}
                  aria-label="Continue to email verification"
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
                  onClick={handleSendLink}
                  disabled={sending || !email || !form.name}
                  isLoading={sending}
                  aria-label="Send verification link"
                  className="min-h-11"
                >
                  {sending ? 'Sending...' : 'Send Verification Link'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={goPrev}
                  disabled={sending}
                  aria-label="Go back to previous step"
                  className="min-h-11"
                >
                  Back
                </Button>
              </div>

              {magicLink && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-5 animate-fadeIn" role="status" aria-live="polite">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">Verification link sent!</p>
                      <p className="text-green-800 mt-1 text-sm">
                        Check your inbox at <strong>{email}</strong> or verify instantly below.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          size="sm"
                          onClick={() => window.open(magicLink, '_blank')}
                          aria-label="Open verification link in new tab"
                          className="min-h-11"
                        >
                          Open Link
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setStep(2)}
                          aria-label="Verify on this page"
                          className="min-h-11"
                        >
                          Verify Here
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-(--primary)">Check your email</h2>
                <p className="text-(--secondary)">
                  We&apos;ve sent a verification link to <strong>{email}</strong>. Please click the link in the email to verify your account.
                </p>
              </div>
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
              {verified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-fadeIn" role="status" aria-live="polite">
                  <p className="text-green-900 font-medium">✓ Email verified successfully</p>
                  <p className="text-green-800 text-sm mt-1">Redirecting to your dashboard...</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn" role="alert" aria-live="assertive">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-900 font-medium text-sm">Unable to proceed</p>
                  <p className="text-red-800 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          {message && !error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center animate-fadeIn" role="status" aria-live="polite">
              <p className="text-blue-900 text-sm">{message}</p>
            </div>
          )}
        </Card>
      </div>
    </main>
    </div>
  );
}
