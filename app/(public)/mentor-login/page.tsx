"use client";

import { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function MentorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Reuse xplorer password login until dedicated mentor auth exists
      const res = await fetch('/api/xplorers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setMessage('Logged in. If approved, your mentor dashboard is unlocked.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 animate-fadeInUp">
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Mentor Login</h1>
          <p className="text-sm text-muted-foreground">Use the email you applied with. Approval is required to access the dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          {message && <p className={cn('text-sm', message.toLowerCase().includes('logged') ? 'text-green-600' : 'text-red-600')}>{message}</p>}
        </form>
      </Card>
    </div>
  );
}
