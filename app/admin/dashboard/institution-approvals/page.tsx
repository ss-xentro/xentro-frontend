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
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

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
      alert(`Institution ${action === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Filter to show only pending applications that completed Phase 2 (have description filled)
  // Phase 1 applications only have name/email but no description
  const filteredApplications = filter === 'pending' 
    ? applications.filter(app => app.status === 'pending' && app.verified && app.description)
    : applications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--primary)">Institution Approvals</h1>
          <p className="text-(--secondary)">Review submitted applications from Phase 2 onboarding.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'pending' | 'all')}
            className="h-10 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
          >
            <option value="pending">Pending Only</option>
            <option value="all">All Applications</option>
          </select>
          <Button variant="ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900" role="alert">
          {error}
        </div>
      )}
      
      {loading && <p className="text-(--secondary)">Loading applications…</p>}

      {!loading && filteredApplications.length === 0 && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-(--surface-hover) flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No pending applications</h3>
            <p className="text-(--secondary)">All applications have been reviewed. New submissions will appear here.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredApplications.map((app) => (
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
