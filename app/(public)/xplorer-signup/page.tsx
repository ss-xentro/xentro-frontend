"use client";

import { useState } from 'react';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

function parseInterests(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
    )
  ).slice(0, 15);
}

export default function XplorerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const interests = parseInterests(interestsInput);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/xplorers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, interests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setMessage('Signup successful. Check your dashboard.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fadeInUp">
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Join as an Xplorer</h1>
          <p className="text-sm text-muted-foreground">Name, email, and your interests (up to 15 topics).</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Interested topics (comma separated, up to 15)</label>
            <Textarea
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              placeholder="AI, fintech, climate, web3"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Currently {interests.length}/15 selected.</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Create Xplorer account'}
          </Button>
          {message && <p className={cn('text-sm', message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600')}>{message}</p>}
        </form>
      </Card>
    </div>
  );
}
