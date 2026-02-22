"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';
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
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MentorRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [remark, setRemark] = useState('');

  async function fetchPending() {
    if (!token) return;
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
    if (token) fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleApprove(userId: string) {
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/approvals/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentorUserId: userId, decision: 'approve', loginUrl: '/mentor-login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setMessage('Mentor approved — notification email sent');
      await fetchPending();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(userId: string) {
    if (!remark.trim()) {
      setMessage('Please add a remark before rejecting.');
      return;
    }
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/approvals/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentorUserId: userId, decision: 'reject', reason: remark.trim(), loginUrl: '/mentor-login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setMessage('Mentor rejected — notification email sent');
      setRejectingId(null);
      setRemark('');
      await fetchPending();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 animate-fadeInUp">
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Mentor Approvals</h1>
            <p className="text-sm text-muted-foreground">Approve or reject mentor applications. Rejections require a remark.</p>
          </div>
          <Button variant="secondary" onClick={fetchPending} disabled={loading}>
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.userId} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium">{row.name || 'Unnamed mentor'}</div>
                  <div className="text-sm text-muted-foreground">{row.email}</div>
                  {row.occupation && <div className="text-sm">{row.occupation}</div>}
                  {row.expertise && <div className="text-sm text-muted-foreground">{row.expertise}</div>}
                  {row.rate && <div className="text-xs text-muted-foreground">Rate: ${row.rate}/hr</div>}
                </div>
                <div className="flex gap-2">
                  {rejectingId === row.userId ? (
                    <Button variant="secondary" onClick={() => { setRejectingId(null); setRemark(''); }} disabled={loading}>
                      Cancel
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setRejectingId(row.userId)} disabled={loading}>
                      Reject
                    </Button>
                  )}
                  <Button onClick={() => handleApprove(row.userId)} disabled={loading}>
                    Approve
                  </Button>
                </div>
              </div>
              {rejectingId === row.userId && (
                <div className="flex flex-col gap-2 border-t pt-3">
                  <label className="text-sm font-medium text-gray-700">Rejection remark <span className="text-red-500">*</span></label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    rows={2}
                    placeholder="Explain why this application is being rejected…"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => handleReject(row.userId)} disabled={loading || !remark.trim()}>
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!loading && !rows.length && <p className="text-sm text-muted-foreground">No pending mentors.</p>}
          {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>}
        </div>
        {message && <p className={cn('text-sm', message.toLowerCase().includes('fail') || message.toLowerCase().includes('please') ? 'text-red-600' : 'text-green-600')}>{message}</p>}
      </Card>
    </div>
  );
}
