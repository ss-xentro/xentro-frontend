'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { toast } from 'sonner';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/contexts/AuthContext';
import { clearAllRoleTokens, syncAuthCookie, setRoleToken, setTokenCookie, normalizeUser } from '@/lib/auth-utils';
import { getApiErrorMessageFromPayload } from '@/lib/error-utils';
import { isStartupOnboardingComplete } from '@/lib/startup-onboarding';
import { isMentorOnboardingComplete } from '@/lib/mentor-onboarding';
import type { User } from '@/lib/types/user';

// Startup/founder users land on /dashboard after login once onboarding is complete.
const DASHBOARD_MAP: Record<string, string> = {
    startup: '/dashboard',
    founder: '/dashboard',
    mentor: '/mentor-dashboard',
    institution: '/institution-dashboard',
    // investor hidden for v1
    admin: '/admin/dashboard',
    explorer: '/explore/institute',
};

const STARTUP_ONBOARDING_PATH = '/startup/onboarding';
const MENTOR_ONBOARDING_PATH = '/mentor/onboarding';

function readStartupOnboarded(rawUser: Record<string, unknown>): boolean | null {
    const value = rawUser.startupOnboarded
        ?? rawUser.startup_onboarded
        ?? rawUser.startupOnboardingComplete
        ?? rawUser.startup_onboarding_complete;

    return typeof value === 'boolean' ? value : null;
}

async function resolveStartupLandingPath(rawUser: Record<string, unknown>, token: string): Promise<string> {
    const explicitStartupOnboarded = readStartupOnboarded(rawUser);
    if (explicitStartupOnboarded === false) return STARTUP_ONBOARDING_PATH;
    if (explicitStartupOnboarded === true) return '/dashboard';

    try {
        const res = await fetch('/api/founder/my-startup', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            return res.status === 404 ? STARTUP_ONBOARDING_PATH : '/dashboard';
        }

        const payload = await res.json();
        const startup = payload.data?.startup;
        const whyXentro = payload.data?.whyXentro ?? [];

        const isComplete = isStartupOnboardingComplete({
            name: startup?.name,
            tagline: startup?.tagline,
            logo: startup?.logo,
            founders: startup?.founders,
            sectors: startup?.sectors,
            stage: startup?.stage,
            whyXentro,
        });

        return isComplete ? '/dashboard' : STARTUP_ONBOARDING_PATH;
    } catch {
        return '/dashboard';
    }
}

async function resolveMentorLandingPath(rawUser: Record<string, unknown>, token: string): Promise<string> {
    const explicitMentorOnboarded = rawUser.mentorOnboarded ?? rawUser.mentor_onboarded;
    if (explicitMentorOnboarded === false) return MENTOR_ONBOARDING_PATH;
    if (explicitMentorOnboarded === true) return '/mentor-dashboard';

    try {
        const res = await fetch('/api/auth/mentor-profile/', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
            return MENTOR_ONBOARDING_PATH;
        }

        if (!res.ok) {
            return '/mentor-dashboard';
        }

        const profile = await res.json();
        return isMentorOnboardingComplete(profile) ? '/mentor-dashboard' : MENTOR_ONBOARDING_PATH;
    } catch {
        return '/mentor-dashboard';
    }
}

async function storeSession(data: { user: Record<string, unknown>; token: string; startupId?: string }) {
    // Clear ALL previous role tokens to prevent stale cross-role access
    clearAllRoleTokens();

    const normalized = normalizeUser(data.user);
    const role = normalized.role || 'explorer';

    // Store role-specific token in cookie
    setRoleToken(role, data.token);

    // Store JWT in HttpOnly cookie — must complete before navigation
    await setTokenCookie(data.token);

    // Store user metadata in readable cookie
    syncAuthCookie(data.user);

    return role;
}

export default function UnifiedLoginPage() {
    const OTP_RESEND_COOLDOWN_SECONDS = 30;
    const router = useRouter();
    const { setSession } = useAuth();
    const [step, setStep] = useState<'email' | 'otp' | 'unverified'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [otpCooldown, setOtpCooldown] = useState(0);
    const otpSendInFlightRef = useRef(false);

    useEffect(() => {
        if (otpCooldown <= 0) return;
        const timer = setInterval(() => {
            setOtpCooldown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [otpCooldown]);

    const sendOTP = async () => {
        if (otpSendInFlightRef.current) return;
        if (otpCooldown > 0) return;
        otpSendInFlightRef.current = true;
        setLoading(true);

        try {
            const res = await fetch('/api/auth/otp/send/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'USER_NOT_FOUND') {
                    toast.error('No account found with this email');
                    return;
                }
                if (data.code === 'EMAIL_NOT_VERIFIED') {
                    setStep('unverified');
                    return;
                }
                if (data.code === 'ACCESS_DENIED') {
                    toast.error('Sign-in unavailable for this account');
                    return;
                }
                throw new Error(getApiErrorMessageFromPayload(data, 'Failed to send verification code'));
            }

            setSessionId(data.sessionId);
            setStep('otp');
            setOtpCooldown(OTP_RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            otpSendInFlightRef.current = false;
            setLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendOTP();
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/otp/verify/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, otp, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(getApiErrorMessageFromPayload(data, 'Invalid or expired code'));
            }

            const role = await storeSession(data);
            // Build a proper User object for AuthContext
            const norm = normalizeUser(data.user);
            await setSession({ id: norm.id || '', email: norm.email || '', name: norm.name || '', avatar: norm.avatar || '', role: (norm.role || role) as User['role'], unlockedContexts: norm.contexts }, data.token);

            if (role === 'startup' || role === 'founder') {
                const startupLandingPath = await resolveStartupLandingPath(data.user, data.token);
                router.push(startupLandingPath);
                return;
            }

            if (role === 'mentor') {
                const mentorLandingPath = await resolveMentorLandingPath(data.user, data.token);
                router.push(mentorLandingPath);
                return;
            }

            router.push(DASHBOARD_MAP[role] || '/explore/institute');
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken: string, nonce: string) => {
        setGoogleLoading(true);

        try {
            const res = await fetch('/api/auth/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, nonce }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'USER_NOT_FOUND') {
                    toast.error('Invalid email');
                    return;
                }
                if (data.code === 'ACCESS_DENIED') {
                    toast.error('Sign-in unavailable for this account');
                    return;
                }
                throw new Error(getApiErrorMessageFromPayload(data, 'Google sign-in failed'));
            }

            const role = await storeSession(data);
            const norm2 = normalizeUser(data.user);
            await setSession({ id: norm2.id || '', email: norm2.email || '', name: norm2.name || '', avatar: norm2.avatar || '', role: (norm2.role || role) as User['role'], unlockedContexts: norm2.contexts }, data.token);

            if (role === 'startup' || role === 'founder') {
                const startupLandingPath = await resolveStartupLandingPath(data.user, data.token);
                router.push(startupLandingPath);
                return;
            }

            if (role === 'mentor') {
                const mentorLandingPath = await resolveMentorLandingPath(data.user, data.token);
                router.push(mentorLandingPath);
                return;
            }

            router.push(DASHBOARD_MAP[role] || '/explore/institute');
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal Navbar */}
            <OnboardingNavbar showAction={false} />

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 md:py-16">
                <div className="w-full max-w-md space-y-6 sm:space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-(--primary) mb-2">Welcome back</h1>
                        <p className="text-sm sm:text-base text-(--secondary)">Log in to your Xentro account</p>
                    </div>

                    <Card className="p-4 sm:p-6 md:p-8">
                        {step === 'email' && (
                            <div className="space-y-6">
                                {/* Google Sign-In */}
                                <GoogleLoginButton
                                    onSuccess={handleGoogleLogin}
                                    onError={(err) => toast.error(err)}
                                    isLoading={googleLoading}
                                />

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-(--border)" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-(--surface) text-(--secondary)">or continue with email</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSendOTP} className="space-y-6">
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        aria-required="true"
                                        autoComplete="email"
                                        autoFocus
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading || !email || otpCooldown > 0}
                                        isLoading={loading}
                                    >
                                        {loading ? 'Sending...' : otpCooldown > 0 ? `Get OTP (${otpCooldown}s)` : 'Get OTP'}
                                    </Button>

                                    <p className="text-center text-sm text-(--secondary)">
                                        Don&apos;t have an account?{' '}
                                        <Link href="/join" className="text-accent hover:underline font-medium">
                                            Join Xentro
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        )}
                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-(--primary)">Enter OTP</h2>
                                    <p className="text-sm text-(--secondary)">
                                        We&apos;ve sent a 6-digit code to <strong>{email}</strong>
                                    </p>
                                </div>

                                <Input
                                    type="text"
                                    label="One-Time Password"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    aria-required="true"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    autoFocus
                                    maxLength={6}
                                />

                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={loading || otp.length !== 6}
                                        isLoading={loading}
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setStep('email');
                                            setOtp('');
                                        }}
                                    >
                                        Back
                                    </Button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => sendOTP()}
                                    disabled={loading || otpCooldown > 0}
                                    className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                                >
                                    {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
                                </button>
                            </form>
                        )}
                        {step === 'unverified' && (
                            <div className="space-y-6 text-center">
                                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-(--primary)">Verify your email first</h2>
                                    <p className="text-sm text-(--secondary)">
                                        We&apos;ve sent a verification link to <strong>{email}</strong>.<br />
                                        Click the link in your inbox to activate your account, then come back to log in.
                                    </p>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                await fetch('/api/auth/magic-link/send/', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ email, purpose: 'signup' }),
                                                });
                                                toast.success('Verification link resent. Check your inbox.');
                                            } catch {
                                                toast.error('Could not resend link. Please try again.');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Resend verification link'}
                                    </button>
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => { setStep('email'); setOtp(''); }}
                                    >
                                        Back to login
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
