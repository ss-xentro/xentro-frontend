'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card'; // Assuming export exists, else verified manually
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Fallback Card if not exported properly (defensive coding)
function DefaultCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-(--surface) border border-(--border) rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export default function FounderLoginPage() {
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
            const res = await fetch('/api/founder-auth/request-otp', {
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
            const res = await fetch('/api/founder-auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Invalid OTP');
            }

            // Store session token
            localStorage.setItem('founder_token', data.token);
            if (data.startupId) {
                localStorage.setItem('startup_id', data.startupId);
            }

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const CardComponent = Card || DefaultCard;

    return (
        <main className="min-h-screen bg-(--background) flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-(--primary) mb-2">Founder Login</h1>
                    <p className="text-(--secondary)">Access your startup dashboard</p>
                </div>

                <CardComponent className="p-8">
                    {step === 'email' ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-(--primary)">Enter your email</h2>
                                <p className="text-sm text-(--secondary)">
                                    We&apos;ll send you a one-time password to verify your identity
                                </p>
                            </div>

                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="founder@startup.com"
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
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>

                            <p className="text-center text-sm text-(--secondary)">
                                Don&apos;t have an account?{' '}
                                <a href="/onboarding/startup" className="text-accent hover:underline font-medium">
                                    Create Startup
                                </a>
                            </p>
                        </form>
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
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full text-sm text-accent hover:underline disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}
                </CardComponent>
            </div>
        </main>
    );
}
