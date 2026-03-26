'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OnboardingNavbar } from '@/components/ui/OnboardingNavbar';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
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
    mentor: '/feed',
    institution: '/institution-dashboard',
    investor: '/feed',
    admin: '/admin/dashboard',
    explorer: '/feed',
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
    if (explicitMentorOnboarded === true) return '/feed';

    try {
        const res = await fetch('/api/auth/mentor-profile/', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
            return MENTOR_ONBOARDING_PATH;
        }

        if (!res.ok) {
            return '/feed';
        }

        const profile = await res.json();
        return isMentorOnboardingComplete(profile) ? '/feed' : MENTOR_ONBOARDING_PATH;
    } catch {
        return '/feed';
    }
}

function storeSession(data: { user: Record<string, unknown>; token: string; startupId?: string }) {
    // Clear ALL previous role tokens to prevent stale cross-role access
    clearAllRoleTokens();

    const normalized = normalizeUser(data.user);
    const role = normalized.role || 'explorer';

    // Store role-specific token in cookie
    setRoleToken(role, data.token);

    // Store JWT in HttpOnly cookie (fire and forget)
    setTokenCookie(data.token);

    // Store user metadata in readable cookie
    syncAuthCookie(data.user);

    return role;
}

export default function UnifiedLoginPage() {
    const OTP_RESEND_COOLDOWN_SECONDS = 30;
    const router = useRouter();
    const { setSession } = useAuth();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        setError(null);

        try {
            const res = await fetch('/api/auth/otp/send/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'USER_NOT_FOUND') {
                    setError('No account found with this email. Please sign up first.');
                    return;
                }
                if (data.code === 'ACCESS_DENIED') {
                    setError(data.error || 'Access restricted. Only startup founders, mentors, investors, institutions, and admins can log in.');
                    return;
                }
                throw new Error(getApiErrorMessageFromPayload(data, 'Failed to send OTP'));
            }

            setSessionId(data.sessionId);
            setStep('otp');
            setOtpCooldown(OTP_RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError((err as Error).message);
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
        setError(null);

        try {
            const res = await fetch('/api/auth/otp/verify/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, otp, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(getApiErrorMessageFromPayload(data, 'Invalid OTP'));
            }

            const role = storeSession(data);
            // Build a proper User object for AuthContext
            const norm = normalizeUser(data.user);
            setSession({ id: norm.id || '', email: norm.email || '', name: norm.name || '', avatar: norm.avatar || '', role: (norm.role || role) as User['role'], unlockedContexts: norm.contexts }, data.token);

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

            router.push(DASHBOARD_MAP[role] || '/feed');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken: string) => {
        setGoogleLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'USER_NOT_FOUND') {
                    setError('No account found with this email. Please sign up first.');
                    return;
                }
                if (data.code === 'ACCESS_DENIED') {
                    setError(data.error || 'Access restricted. Only startup founders, mentors, investors, institutions, and admins can log in.');
                    return;
                }
                throw new Error(getApiErrorMessageFromPayload(data, 'Google login failed'));
            }

            const role = storeSession(data);
            const norm2 = normalizeUser(data.user);
            setSession({ id: norm2.id || '', email: norm2.email || '', name: norm2.name || '', avatar: norm2.avatar || '', role: (norm2.role || role) as User['role'], unlockedContexts: norm2.contexts }, data.token);

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

            router.push(DASHBOARD_MAP[role] || '/feed');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-(--background) flex flex-col">
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
                        {step === 'email' ? (
                            <div className="space-y-6">
                                {/* Google Sign-In */}
                                <GoogleLoginButton
                                    onSuccess={handleGoogleLogin}
                                    onError={(err) => setError(err)}
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
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />

                                    {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

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
                        ) : (
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
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    autoFocus
                                    maxLength={6}
                                />

                                {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

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
                                            setError(null);
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
                    </Card>
                </div>
            </main>
        </div>
    );
}
