"use client";

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

type Purpose = 'startup' | 'mentor' | 'institution' | null;

interface JoinState {
  name: string;
  email: string;
  otp: string;
  dob: string;
  interests: string[];
  purpose: Purpose;
  verified: boolean;
  step: number;
}

interface Step {
  title: string;
  description: string;
  body: ReactNode;
  onNext: () => boolean;
}

const STORAGE_KEY = 'xentro_join_state_v2';

const PURPOSE_DESTINATIONS: Record<Exclude<Purpose, null>, string> = {
  startup: '/onboarding/startup',
  mentor: '/mentor-signup',
  institution: '/institution-onboarding',
};

const interestPresets = ['AI', 'ClimateTech', 'FinTech', 'SaaS', 'EdTech', 'HealthTech', 'Web3', 'DeepTech'];

function loadState(): JoinState {
  if (typeof window === 'undefined') {
    return {
      name: '',
      email: '',
      otp: '',
      dob: '',
      interests: [],
      purpose: null,
      verified: false,
      step: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('missing');
    const parsed = JSON.parse(raw) as JoinState;
    return {
      name: parsed.name || '',
      email: parsed.email || '',
      otp: '',
      dob: parsed.dob || '',
      interests: parsed.interests || [],
      purpose: parsed.purpose ?? null,
      verified: parsed.verified ?? false,
      step: parsed.step ?? 0,
    };
  } catch (_err) {
    return {
      name: '',
      email: '',
      otp: '',
      dob: '',
      interests: [],
      purpose: null,
      verified: false,
      step: 0,
    };
  }
}

function saveState(state: JoinState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, otp: '' }));
}

function sanitizeInterest(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export default function JoinWizard() {
  const router = useRouter();
  const [state, setState] = useState<JoinState>(() => loadState());
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interestDraft, setInterestDraft] = useState('');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentStep = state.step;

  const progress = useMemo(() => Math.round(((currentStep + 1) / 6) * 100), [currentStep]);

  function nextStep() {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 5) }));
  }

  function prevStep() {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }));
  }

  function update<K extends keyof JoinState>(key: K, value: JoinState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSendOtp() {
    if (!state.email) {
      setError('Please enter your email first');
      return;
    }
    setSendingOtp(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
      setMessage('Verification code sent to your email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!state.email || !state.otp) {
      setError('Enter the 6-digit code to verify');
      return;
    }
    setVerifyingOtp(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, otp: state.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem('xentro_token', data.token);
      localStorage.setItem('xentro_user', JSON.stringify(data.user));
      setMessage('Email verified! You can finish your profile now or later.');
      setState((prev) => ({ ...prev, verified: true, step: Math.max(prev.step, 3), otp: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  }

  function addInterest(value: string) {
    const cleaned = sanitizeInterest(value);
    if (!cleaned) return;
    setState((prev) => {
      if (prev.interests.includes(cleaned)) return prev;
      const nextInterests = [...prev.interests, cleaned].slice(0, 8);
      return { ...prev, interests: nextInterests };
    });
  }

  function removeInterest(value: string) {
    setState((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== value) }));
  }

  function handlePurposeSelection(purpose: Exclude<Purpose, null>) {
    setState((prev) => ({ ...prev, purpose }));
  }

  function handleFinish() {
    if (state.purpose && PURPOSE_DESTINATIONS[state.purpose]) {
      router.push(PURPOSE_DESTINATIONS[state.purpose]);
    } else {
      router.push('/feed');
    }
  }

  function resetWizard() {
    const fresh: JoinState = {
      name: '',
      email: '',
      otp: '',
      dob: '',
      interests: [],
      purpose: null,
      verified: false,
      step: 0,
    };
    setState(fresh);
    saveState(fresh);
    setMessage(null);
    setError(null);
  }

  const stepContent: Step[] = [
    {
      title: 'Your name',
      description: 'We will use this on your profile and dashboards.',
      body: (
        <div className="space-y-3">
          <label className="text-sm font-medium" aria-label="Full name">Full name</label>
          <Input
            aria-required
            value={state.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Alex Doe"
          />
        </div>
      ),
      onNext: () => {
        if (!state.name.trim()) {
          setError('Please enter your name');
          return false;
        }
        return true;
      },
    },
    {
      title: 'Email verification',
      description: 'Enter your email to get a verification link/code.',
      body: (
        <div className="space-y-3">
          <label className="text-sm font-medium" aria-label="Email">Email</label>
          <Input
            aria-required
            type="email"
            value={state.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
          />
          <Button onClick={handleSendOtp} disabled={sendingOtp} className="w-full min-h-[44px]">
            {sendingOtp ? 'Sending…' : 'Send verification code'}
          </Button>
          <p className="text-xs text-(--secondary)">We use one secure code—no separate emails for institutes or startups.</p>
        </div>
      ),
      onNext: () => {
        if (!state.email.includes('@')) {
          setError('Enter a valid email');
          return false;
        }
        return true;
      },
    },
    {
      title: 'Verify your email',
      description: 'Check your inbox for the code. You can resume later if you need.',
      body: (
        <div className="space-y-3">
          <label className="text-sm font-medium" aria-label="Verification code">6-digit code</label>
          <Input
            inputMode="numeric"
            maxLength={6}
            value={state.otp}
            onChange={(e) => update('otp', e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="123456"
          />
          <div className="flex gap-3">
            <Button onClick={handleVerifyOtp} disabled={verifyingOtp || !state.otp} className="flex-1 min-h-[44px]">
              {verifyingOtp ? 'Verifying…' : 'Verify & continue'}
            </Button>
            <Button variant="secondary" onClick={handleSendOtp} disabled={sendingOtp} className="min-h-[44px]">
              Resend
            </Button>
          </div>
          {state.verified && <Badge className="bg-green-100 text-green-700">Email verified</Badge>}
        </div>
      ),
      onNext: () => {
        if (!state.verified) {
          setError('Verify your email to continue');
          return false;
        }
        return true;
      },
    },
    {
      title: 'Date of birth (optional)',
      description: 'We only use this to personalize your experience. You can skip now.',
      body: (
        <div className="space-y-3">
          <label className="text-sm font-medium" aria-label="Date of birth">Date of birth</label>
          <Input
            type="date"
            value={state.dob}
            onChange={(e) => update('dob', e.target.value)}
          />
          <p className="text-xs text-(--secondary)">You can complete this later from your profile.</p>
        </div>
      ),
      onNext: () => true,
    },
    {
      title: 'Fields of interest',
      description: 'Pick a few so we can tailor your feed. You can edit later.',
      body: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Add an interest and press Enter"
              value={interestDraft}
              onChange={(e) => setInterestDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInterest(interestDraft);
                  setInterestDraft('');
                }
              }}
              aria-label="Add interest"
            />
            <Button
              variant="secondary"
              className="min-h-[44px]"
              type="button"
              onClick={(e) => {
                if (interestDraft) {
                  addInterest(interestDraft);
                  setInterestDraft('');
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interestPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                className={cn(
                  'px-3 py-1 rounded-full text-sm border border-(--border) transition-colors',
                  state.interests.includes(preset) ? 'bg-(--accent-light) text-accent border-accent' : 'bg-white hover:bg-(--surface)'
                )}
                onClick={() => {
                  if (state.interests.includes(preset)) {
                    removeInterest(preset);
                  } else {
                    addInterest(preset);
                  }
                }}
                aria-pressed={state.interests.includes(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
          {state.interests.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Selected interests">
              {state.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 bg-(--surface) border border-(--border) rounded-full text-sm flex items-center gap-2">
                  {interest}
                  <button
                    type="button"
                    className="text-(--secondary) hover:text-(--primary)"
                    aria-label={`Remove ${interest}`}
                    onClick={() => removeInterest(interest)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      ),
      onNext: () => true,
    },
    {
      title: 'Where should we take you?',
      description: 'Pick a path now. You can switch contexts later.',
      body: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              { key: 'startup', label: 'Startup', desc: 'Launch or manage your venture', icon: '🚀' },
              { key: 'mentor', label: 'Mentor', desc: 'Coach founders and students', icon: '🎯' },
              { key: 'institution', label: 'Institution', desc: 'Onboard your programs', icon: '🏛️' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handlePurposeSelection(item.key)}
              className={cn(
                'h-full text-left p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                state.purpose === item.key
                  ? 'border-accent bg-(--accent-light)/30'
                  : 'border-(--border) hover:border-accent/70 hover:shadow-sm'
              )}
              aria-pressed={state.purpose === item.key}
            >
              <div className="text-2xl" aria-hidden="true">{item.icon}</div>
              <div className="font-semibold mt-2">{item.label}</div>
              <p className="text-sm text-(--secondary)">{item.desc}</p>
            </button>
          ))}
        </div>
      ),
      onNext: () => true,
    },
  ];

  const canContinue = stepContent[currentStep]?.onNext ?? (() => true);

  return (
    <main className="min-h-screen bg-linear-to-b from-(--surface) via-white to-(--surface-hover) text-(--primary)" role="main">
      <div className="container mx-auto px-4 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <p className="text-sm font-semibold text-accent mb-2 uppercase tracking-wide">Welcome to XENTRO</p>
          <h1 className="text-4xl font-bold mb-3">Start with one simple flow</h1>
          <p className="text-base text-(--secondary)">Single verification email, then finish your profile now or later. No more separate startup/institute emails.</p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          <Card className="p-4 md:col-span-2 shadow-sm border-(--border)">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-(--secondary)">Step {currentStep + 1} of 6</p>
                <h2 className="text-xl font-semibold">{stepContent[currentStep].title}</h2>
                <p className="text-sm text-(--secondary)">{stepContent[currentStep].description}</p>
              </div>
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium">Progress</div>
                <div className="w-36 h-2 bg-(--surface) rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-(--border) rounded-lg p-4">{stepContent[currentStep].body}</div>

            {(error || message) && (
              <div className={cn('mt-4 text-sm rounded-md p-3', error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200')}>
                {error || message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {currentStep > 0 && (
                <Button variant="secondary" onClick={prevStep} className="min-h-[44px]">Back</Button>
              )}
              {currentStep < stepContent.length - 1 && (
                <Button
                  onClick={() => {
                    const ok = canContinue();
                    if (ok !== false) nextStep();
                  }}
                  className="min-h-[44px]"
                >
                  Continue
                </Button>
              )}
              {currentStep === stepContent.length - 1 && (
                <Button onClick={handleFinish} className="min-h-[44px]">Finish & go</Button>
              )}
              {currentStep >= 2 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMessage('Progress saved. You can finish anytime after login.');
                  }}
                  className="min-h-[44px]"
                >
                  Save & finish later
                </Button>
              )}
              <Button variant="ghost" onClick={resetWizard} className="min-h-[44px]">Start over</Button>
            </div>
          </Card>

          <Card className="p-4 space-y-4 shadow-sm border-(--border)">
            <div>
              <h3 className="text-base font-semibold">Quick links</h3>
              <p className="text-sm text-(--secondary)">Jump directly if you already know where to go.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/feed"><Button variant="secondary" className="w-full min-h-[44px]">Explore Feed</Button></Link>
              <Link href="/onboarding/startup"><Button variant="ghost" className="w-full min-h-[44px]">Startup Onboarding</Button></Link>
              <Link href="/mentor-signup"><Button variant="ghost" className="w-full min-h-[44px]">Mentor Onboarding</Button></Link>
              <Link href="/institution-onboarding"><Button variant="ghost" className="w-full min-h-[44px]">Institution Onboarding</Button></Link>
              <Link href="/dashboard"><Button variant="ghost" className="w-full min-h-[44px]">Founder Dashboard</Button></Link>
              <Link href="/institution-dashboard"><Button variant="ghost" className="w-full min-h-[44px]">Institution Dashboard</Button></Link>
              <Link href="/admin/login"><Button variant="ghost" className="w-full min-h-[44px]">Admin Console</Button></Link>
            </div>
            <div className="rounded-md bg-(--surface) border border-(--border) p-3 text-xs text-(--secondary)">
              Verified already? You can skip to the last step and pick your path. Your progress is saved in this browser.
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
