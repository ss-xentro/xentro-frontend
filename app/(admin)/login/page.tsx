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
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeInUp">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--primary)] text-white mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">
                        XENTRO
                    </h1>
                    <p className="text-[var(--secondary)]">
                        Admin Portal
                    </p>
                </div>

                {/* Login Card */}
                <Card padding="lg" className="animate-fadeInUp stagger-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
                                Welcome back
                            </h2>
                            <p className="text-sm text-[var(--secondary)]">
                                Sign in to manage institutions and programs
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm animate-fadeIn">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="admin@xentro.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            autoFocus
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                        >
                            Login as Admin
                        </Button>
                    </form>
                </Card>

                {/* Helper Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-[var(--secondary)]">
                        🔒 Restricted access. Only authorized administrators can onboard institutions.
                    </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 rounded-[var(--radius-lg)] bg-[var(--accent-subtle)] border border-[var(--accent-light)]">
                    <p className="text-xs font-medium text-[var(--accent)] mb-2">Demo Credentials</p>
                    <p className="text-sm text-[var(--primary)]">
                        Email: <code className="px-1.5 py-0.5 rounded bg-white/50">admin@xentro.io</code>
                    </p>
                    <p className="text-sm text-[var(--primary)] mt-1">
                        Password: <code className="px-1.5 py-0.5 rounded bg-white/50">admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
