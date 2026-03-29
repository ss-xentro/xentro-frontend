'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter your email and password');
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            router.push('/admin/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-(--surface) flex items-center justify-center p-4" role="main">
            <div className="w-full max-w-md animate-fadeInUp">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-(--primary) text-(--background) mb-6" aria-hidden="true">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-(--primary) mb-2">
                        XENTRO
                    </h1>
                    <p className="text-(--secondary-light)">
                        Admin Portal
                    </p>
                </div>

                {/* Login Card */}
                <Card padding="lg" className="animate-fadeInUp stagger-2">
                    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Admin login form">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold text-(--primary) mb-2">
                                Welcome back
                            </h2>
                            <p className="text-sm text-(--secondary-light)">
                                Sign in to manage institutions and programs
                            </p>
                        </div>

                        {error && (
                            <FeedbackBanner type="error" title="Login failed" message={error} />
                        )}

                        <Input
                            id="email"
                            label="Email address"
                            type="email"
                            placeholder="admin@xentro.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            autoFocus
                            required
                            aria-label="Email address"
                            aria-required="true"
                        />

                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            aria-label="Password"
                            aria-required="true"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            aria-label="Sign in to admin dashboard"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </Card>

                {/* Helper Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-(--secondary-light)">
                        Restricted access for authorized administrators only.
                    </p>
                </div>

                {/* Demo Credentials
                <div className="mt-8 p-4 rounded-lg bg-(--accent-subtle) border border-(--border)">
                    <p className="text-xs font-medium text-(--primary) mb-2">Demo Credentials</p>
                    <p className="text-sm text-(--primary)">
                        Email: <code className="px-1.5 py-0.5 rounded bg-(--accent-subtle)">admin@xentro.io</code>
                    </p>
                    <p className="text-sm text-(--primary) mt-1">
                        Password: <code className="px-1.5 py-0.5 rounded bg-(--accent-subtle)">admin123</code>
                    </p>
                </div> */}
            </div>
        </div>
    );
}
