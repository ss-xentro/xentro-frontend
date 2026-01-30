"use client";

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

type MentorRow = {
  userId: string;
  name: string | null;
  email: string | null;
  occupation: string | null;
  expertise: string | null;
  rate: string | number | null;
  status: string;
};

export default function MentorApprovalsPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MentorRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchPending() {
    if (!token) {
      setMessage('Set admin token to load approvals.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/mentors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      setRows(data.data || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function act(userId: string, decision: 'approve' | 'reject') {
    if (!token) return setMessage('Set admin token first.');
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/approvals/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorUserId: userId, decision, loginUrl: '/mentor-login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setMessage(`Mentor ${decision}d`);
      await fetchPending();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4 animate-fadeInUp">
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Mentor Approvals</h1>
            <p className="text-sm text-muted-foreground">Approve or reject mentor applications.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Paste admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full md:w-80"
            />
            <Button variant="secondary" onClick={fetchPending} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.userId} className="rounded-xl border bg-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="font-medium">{row.name || 'Unnamed mentor'}</div>
                <div className="text-sm text-muted-foreground">{row.email}</div>
                <div className="text-sm">{row.occupation}</div>
                <div className="text-sm text-muted-foreground">{row.expertise}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => act(row.userId, 'reject')} disabled={loading}>
                  Reject
                </Button>
                <Button onClick={() => act(row.userId, 'approve')} disabled={loading}>
                  Approve
                </Button>
              </div>
            </div>
          ))}
          {!rows.length && <p className="text-sm text-muted-foreground">No pending mentors.</p>}
        </div>
        {message && <p className={cn('text-sm', message.toLowerCase().includes('fail') ? 'text-red-600' : 'text-green-600')}>{message}</p>}
      </Card>
    </div>
  );
}
