"use client";

import { useEffect, useState } from 'react';
import { Card, Button, Input, Badge, StatusBadge, Textarea } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function InstitutionApprovalsPage() {
  const [applications, setApplications] = useState<InstitutionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<InstitutionApplication | null>(null);
  const [remark, setRemark] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/institution-applications');
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Failed to load applications');
      setApplications(payload.data ?? []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (action: 'approved' | 'rejected', app: InstitutionApplication) => {
    try {
      const res = await fetch(`/api/institution-applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remark }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Update failed');
      setRemark('');
      setSelected(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--primary)">Institution Approvals</h1>
          <p className="text-(--secondary)">Review onboarding submissions and take action.</p>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-(--secondary)">Loading…</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-(--secondary)">Submitted by {app.email}</p>
                <h3 className="text-lg font-semibold text-(--primary)">{app.name}</h3>
                <p className="text-sm text-(--secondary)">{app.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] ?? 'bg-(--surface-hover) text-(--primary)'}`}>
                {app.status}
              </span>
            </div>

            {app.tagline && <p className="text-sm text-(--secondary)">{app.tagline}</p>}
            {app.description && <p className="text-sm text-(--secondary) line-clamp-3">{app.description}</p>}

            <div className="flex items-center gap-3 text-sm text-(--secondary)">
              {app.city && <span>📍 {app.city}{app.country ? `, ${app.country}` : ''}</span>}
              {app.website && (
                <a className="text-accent hover:underline" href={app.website} target="_blank" rel="noreferrer">
                  Visit site
                </a>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-(--secondary)">
              <span>Email verified: <strong className="text-(--primary)">{app.verified ? 'Yes' : 'No'}</strong></span>
              {app.institutionId && <span>Linked: {app.institutionId}</span>}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a remark (optional)"
                value={selected?.id === app.id ? remark : ''}
                onChange={(e) => {
                  setSelected(app);
                  setRemark(e.target.value);
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={app.status !== 'pending' || !app.verified}
                  onClick={() => handleAction('approved', app)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={app.status !== 'pending'}
                  onClick={() => handleAction('rejected', app)}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
