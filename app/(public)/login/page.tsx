'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useAuth } from '@/contexts/AuthContext';

// All logins redirect to /feed — users navigate to their dashboard from there
const DASHBOARD_MAP: Record<string, string> = {
    startup: '/feed',
    mentor: '/feed',
    institution: '/feed',
    investor: '/feed',
    admin: '/admin/dashboard',
    explorer: '/feed',
};

function storeSession(data: { user: Record<string, unknown>; token: string; startupId?: string }) {
    const role = (data.user?.account_type || data.user?.role || data.user?.accountType || 'explorer') as string;
    const tokenKey = role === 'mentor' ? 'mentor_token'
        : role === 'institution' ? 'institution_token'
            : role === 'investor' ? 'investor_token'
                : 'founder_token';

    localStorage.setItem(tokenKey, data.token);

    if (data.startupId) {
        localStorage.setItem('startup_id', data.startupId);
    }

    // Also store in xentro_session for AuthContext
    const session = {
        user: { ...data.user, role },
        token: data.token,
        expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem('xentro_session', JSON.stringify(session));

    return role;
}

export default function UnifiedLoginPage() {
    const router = useRouter();
    const { setSession } = useAuth();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const sendOTP = async () => {
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
                throw new Error(data.error || data.message || 'Failed to send OTP');
            }

            setSessionId(data.sessionId);
            setStep('otp');
        } catch (err) {
            setError((err as Error).message);
        } finally {
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
                body: JSON.stringify({ sessionId, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Invalid OTP');
            }

            const role = storeSession(data);
            // Update AuthContext so AuthGuard sees the user as authenticated
            setSession(data.user as any, data.token);
            const destination = DASHBOARD_MAP[role] || '/feed';
            router.push(destination);
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
                throw new Error(data.error || data.message || 'Google login failed');
            }

            const role = storeSession(data);
            setSession(data.user as any, data.token);
            const destination = DASHBOARD_MAP[role] || '/feed';
            router.push(destination);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-(--background) flex flex-col">
            {/* Minimal Navbar */}
            <nav className="h-16 border-b border-(--border) bg-(--surface)/80 backdrop-blur-md sticky top-0 z-50">
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

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-(--primary) mb-2">Welcome back</h1>
                        <p className="text-(--secondary)">Log in to your Xentro account</p>
                    </div>

                    <Card className="p-8">
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
                                        <span className="px-4 bg-white text-(--secondary)">or continue with email</span>
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

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading || !email}
                                        isLoading={loading}
                                    >
                                        {loading ? 'Sending...' : 'Get OTP'}
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

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900 text-sm">
                                        {error}
                                    </div>
                                )}

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
                                    disabled={loading}
                                    className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                                >
                                    Resend OTP
                                </button>
                            </form>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
