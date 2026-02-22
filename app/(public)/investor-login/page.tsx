'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '@/components/ui';

export default function InvestorLoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/investor-auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setSessionId(data.sessionId);
            setStep('otp');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/investor-auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Invalid OTP');
            }

            // Store session token
            localStorage.setItem('investor_token', data.token);

            // Redirect to dashboard
            router.push('/investor-dashboard');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-900 text-white mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-(--primary) mb-2">Investor Login</h1>
                    <p className="text-(--secondary)">Access your investment dashboard</p>
                </div>

                <Card className="p-8">
                    {step === 'email' ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-(--primary)">Enter your email</h2>
                                <p className="text-sm text-(--secondary)">
                                    We'll send you a one-time password to verify your identity
                                </p>
                            </div>

                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="investor@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                aria-label="Email address"
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
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>

                            <p className="text-center text-sm text-(--secondary)">
                                Don't have an account?{' '}
                                <a href="/investor-onboarding" className="text-accent hover:underline font-medium">
                                    Join as Investor
                                </a>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-(--primary)">Enter OTP</h2>
                                <p className="text-sm text-(--secondary)">
                                    We've sent a 6-digit code to <strong>{email}</strong>
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
                                aria-label="OTP code"
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
                                onClick={handleSendOTP}
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
    );
}
