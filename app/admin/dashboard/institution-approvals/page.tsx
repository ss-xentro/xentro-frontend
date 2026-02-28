"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function InstitutionApprovalsPage() {
  const [applications, setApplications] = useState<InstitutionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Filter to show only pending applications that completed Phase 2 (have description filled)
  // Phase 1 applications only have name/email but no description
  const filteredApplications = filter === 'pending'
    ? applications.filter(app => app.status === 'pending' && app.verified && app.description)
    : applications;

  const renderModalField = (label: string, value: string | number | string[] | any) => {
    if (value === null || value === undefined || value === '') return null;
    let displayValue: React.ReactNode = value;
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      displayValue = value.join(', ');
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (label.toLowerCase().includes('logo') && typeof value === 'string' && value.startsWith('http')) {
      displayValue = <img src={value} alt="Logo" className="max-h-16 rounded" />;
    } else if (label.toLowerCase().includes('website') || label.toLowerCase().includes('linkedin')) {
      displayValue = <a href={value as string} target="_blank" rel="noreferrer" className="text-accent hover:underline break-all">{value}</a>;
    }

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-(--secondary) uppercase tracking-wide mb-1">{label}</h4>
        <div className="text-sm text-(--primary)">{displayValue}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
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

            <div className="space-y-4 pt-4 border-t border-(--border)">
              <Link href={`/admin/dashboard/institution-approvals/${app.id}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
