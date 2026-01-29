'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';

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
            router.push('/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4" role="main">
            <div className="w-full max-w-md animate-fadeInUp">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-(--primary) text-white mb-6" aria-hidden="true">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-(--primary) mb-2">
                        XENTRO
                    </h1>
                    <p className="text-(--secondary)">
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
                            <p className="text-sm text-(--secondary)">
                                Sign in to manage institutions and programs
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-900 text-sm animate-fadeIn" role="alert" aria-live="assertive">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    </svg>
                                    <div>
                                        <p className="font-medium">Login failed</p>
                                        <p className="text-sm mt-0.5">{error}</p>
                                    </div>
                                </div>
                            </div>
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
                    <p className="text-sm text-(--secondary)">
                        🔒 Restricted access for authorized administrators only.
                    </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 rounded-lg bg-(--accent-subtle) border border-(--accent-light)">
                    <p className="text-xs font-medium text-accent mb-2">Demo Credentials</p>
                    <p className="text-sm text-(--primary)">
                        Email: <code className="px-1.5 py-0.5 rounded bg-white/50">admin@xentro.io</code>
                    </p>
                    <p className="text-sm text-(--primary) mt-1">
                        Password: <code className="px-1.5 py-0.5 rounded bg-white/50">admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
