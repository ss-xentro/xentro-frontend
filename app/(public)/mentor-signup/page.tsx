"use client";

import { useState } from 'react';
import { Button, Card, Input, ProgressIndicator, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const TOTAL_STEPS = 6;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

type SlotEntry = { day: string; time: string };

export default function MentorSignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    occupation: '',
    expertise: '',
    packages: '',
    rate: '',
    achievements: '',
  });
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  };

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setFeedback(null);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.name.trim() && form.email.trim();
      case 2:
        return form.password.trim().length >= 8;
      case 3:
        return form.occupation.trim() || form.expertise.trim();
      case 4:
        return form.packages.trim();
      case 5:
        return selectedSlots.size > 0;
      case 6:
        return form.achievements.trim();
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) {
      setFeedback({ type: 'error', message: 'Finish the required fields to continue.' });
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    setLoading(true);
    setFeedback(null);

    // Convert selected slots to structured availability
    const availability = Array.from(selectedSlots).map(key => {
      const [day, startTime] = key.split('-');
      const startHour = parseInt(startTime.split(':')[0]);
      const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;
      return `${day} ${startTime}-${endTime}`;
    });

    try {
      const res = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rate: form.rate ? Number(form.rate) : null,
          packages: form.packages ? form.packages.split('\n').filter(Boolean) : undefined,
          availability,
          achievements: form.achievements ? form.achievements.split('\n').filter(Boolean) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Application failed');

      setFeedback({ type: 'success', message: 'Submitted for review. We\u2019ll notify you once approved.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Application failed';
      setFeedback({ type: 'error', message });
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
            <Input
              label="Work email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Create a password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              autoFocus
              required
            />
            <p className="text-sm text-(--secondary)">Secure your mentor login. Keep it unique.</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Input
              label="Current role"
              placeholder="VC Partner, Operator, Coach"
              value={form.occupation}
              onChange={(e) => updateField('occupation', e.target.value)}
              autoFocus
            />
            <Textarea
              label="Focus areas"
              placeholder="Product-led growth, fundraising, GTM"
              rows={3}
              value={form.expertise}
              onChange={(e) => updateField('expertise', e.target.value)}
            />
            <p className="text-sm text-(--secondary)">Share where you drive the most impact.</p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Textarea
              label="Packages & pricing"
              placeholder="Starter: $99 / session"
              rows={3}
              value={form.packages}
              onChange={(e) => updateField('packages', e.target.value)}
              autoFocus
            />
            <Input
              label="Typical rate (USD)"
              type="number"
              placeholder="150"
              value={form.rate}
              onChange={(e) => updateField('rate', e.target.value)}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-(--primary) mb-3">
                Select your available time slots
              </label>
              <p className="text-sm text-(--secondary) mb-4">
                Click on cells to mark when you&apos;re free. Each slot is 1 hour.
              </p>
            </div>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="w-16 p-1.5 text-left text-(--secondary) font-medium">Time</th>
                    {DAYS.map(d => (
                      <th key={d} className="p-1.5 text-center text-(--secondary) font-medium">{d.slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map(time => (
                    <tr key={time}>
                      <td className="p-1.5 text-(--secondary) font-mono text-xs">{time}</td>
                      {DAYS.map(day => {
                        const key = `${day}-${time}`;
                        const selected = selectedSlots.has(key);
                        return (
                          <td key={day} className="p-0.5">
                            <button
                              type="button"
                              onClick={() => toggleSlot(day, time)}
                              className={cn(
                                'w-full h-8 rounded-md border transition-all duration-100 text-xs font-medium',
                                selected
                                  ? 'bg-accent/15 border-accent text-accent'
                                  : 'bg-(--surface) border-(--border) text-(--secondary) hover:bg-(--surface-hover)'
                              )}
                            >
                              {selected ? '✓' : ''}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-(--secondary)">{selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''} selected</p>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <Textarea
              label="Highlights (one per line)"
              placeholder={"Scaled ARR to $10M\nYC alum"}
              rows={4}
              value={form.achievements}
              onChange={(e) => updateField('achievements', e.target.value)}
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  const primaryLabel = step === TOTAL_STEPS ? (loading ? 'Submitting…' : 'Submit for approval') : 'Continue';

  return (
    <main className="min-h-screen bg-(--surface) px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-3xl p-6 md:p-8 space-y-6 shadow-lg bg-white/90 backdrop-blur animate-fadeInUp">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-(--primary)">Mentor onboarding</h1>
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
                ? 'border-success/30 bg-(--success-light) text-success'
                : 'border-error bg-red-50 text-red-700'
            )}
          >
            {feedback.message}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button onClick={handleNext} disabled={loading}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
