"use client";

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function XplorerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script lazily
    const id = 'google-client';
    if (document.getElementById(id)) return setGoogleReady(true);
    const script = document.createElement('script');
    script.id = id;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setGoogleReady(true);
    document.head.appendChild(script);
  }, []);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/xplorers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setMessage('Logged in successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    if (!(window as any).google || !(window as any).google.accounts?.id) {
      setMessage('Google login not ready.');
      return;
    }
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setMessage('Google client ID missing.');
      return;
    }
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        if (!response.credential) {
          setMessage('Google login cancelled');
          return;
        }
        try {
          const res = await fetch('/api/xplorers/login/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.credential }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Google login failed');
          setMessage('Logged in with Google.');
        } catch (err) {
          setMessage(err instanceof Error ? err.message : 'Google login failed');
        }
      },
    });
    (window as any).google.accounts.id.prompt();
  }

  return (
    <div className="max-w-xl mx-auto p-6 animate-fadeInUp">
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Xplorer Login</h1>
          <p className="text-sm text-muted-foreground">Use password or continue with Google.</p>
        </div>
        <form onSubmit={handlePasswordLogin} className="space-y-4">
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
        </form>
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button variant="secondary" onClick={handleGoogleLogin} disabled={!googleReady} className="w-full">
          Continue with Google
        </Button>
        {message && <p className={cn('text-sm', message.toLowerCase().includes('success') || message.toLowerCase().includes('logged') ? 'text-green-600' : 'text-red-600')}>{message}</p>}
      </Card>
    </div>
  );
}
