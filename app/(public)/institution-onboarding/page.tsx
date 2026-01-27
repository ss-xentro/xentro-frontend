"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  description: '',
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
    setSending(true);
    setError(null);
    try {
      const res = await fetch(magicLink);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Verification failed');
      setVerified(true);
      setMessage('Email verified. Redirecting to your dashboard…');
      router.push('/institution-dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-accent font-semibold text-sm">Institution Onboarding</p>
          <h1 className="text-3xl font-bold text-(--primary)">Verify your institution</h1>
          <p className="text-(--secondary)">Enter your institution name, send a magic link, verify, and we will take you to your dashboard.</p>
        </div>

        <Card className="p-6 space-y-6">
          <ProgressIndicator currentStep={step + 1} totalSteps={steps.length} />

          {step === 0 && (
            <div className="space-y-4 animate-fadeIn max-w-xl mx-auto">
              <Input
                label="Institution name"
                placeholder="e.g., X Combinator"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <div className="flex justify-end">
                <Button onClick={goNext} disabled={!canProceed()}>
                  Continue to email
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fadeIn max-w-xl mx-auto">
              <Input label="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSendLink} disabled={sending || !email || !form.name}>
                  {sending ? 'Sending…' : 'Send magic link'}
                </Button>
                <Button variant="ghost" onClick={goPrev} disabled={sending}>
                  Back
                </Button>
              </div>

              {magicLink && (
                <div className="bg-(--surface-hover) border border-(--border) rounded-lg p-4 text-sm">
                  <p className="font-semibold text-(--primary)">Magic link generated</p>
                  <p className="text-(--secondary) mt-1">
                    Check your inbox to verify, or click below to verify instantly.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button size="sm" onClick={() => window.open(magicLink, '_blank')}>
                      Open magic link
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setStep(2)}>
                      Verify here
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn max-w-xl mx-auto">
              <p className="text-(--secondary)">We sent a magic link to your email. You can also verify from here.</p>
              <div className="flex gap-3">
                <Button onClick={handleVerify} disabled={sending || !magicLink}>
                  {sending ? 'Verifying…' : 'Verify now'}
                </Button>
                <Button variant="ghost" onClick={goPrev} disabled={sending}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-sm text-(--secondary)">{message}</p>}
        </Card>
      </div>
    </main>
  );
}
