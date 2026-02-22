"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function MentorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Store session token
      localStorage.setItem('mentor_token', data.token || 'authenticated');

      // Redirect to mentor dashboard
      router.push('/mentor-dashboard');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-900 text-white mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-(--primary) mb-2">Mentor Login</h1>
          <p className="text-(--secondary)">Access your mentor dashboard</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-(--primary)">Sign in</h2>
              <p className="text-sm text-(--secondary)">
                Use the email you applied with. Approval is required to access the dashboard.
              </p>
            </div>

            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              aria-label="Email address"
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              aria-label="Password"
            />

            {message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900 text-sm">
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" isLoading={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-(--secondary)">
              Don&apos;t have an account?{' '}
              <a href="/mentor-signup" className="text-accent hover:underline font-medium">
                Apply as Mentor
              </a>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}

