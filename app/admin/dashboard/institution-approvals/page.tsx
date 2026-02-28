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
  const [viewingApp, setViewingApp] = useState<InstitutionApplication | null>(null);
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
      setViewingApp(null);
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setViewingApp(app)}
                >
                  View Details
                </Button>
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
            </div>
          </Card>
        ))}
      </div>

      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingApp(null)} />
          <div className="bg-(--surface) border border-(--border) rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-(--border) shrink-0">
              <div>
                <h2 className="text-xl font-bold text-(--primary)">Institution Details</h2>
                <p className="text-sm text-(--secondary)">Review the full application profile for {viewingApp.name}</p>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="p-2 text-(--secondary) hover:text-(--primary) rounded-lg hover:bg-(--surface-hover) transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <div className="col-span-1 sm:col-span-2">
                {renderModalField('Logo', viewingApp.logo)}
              </div>
              {renderModalField('Name', viewingApp.name)}
              {renderModalField('Email', viewingApp.email)}
              {renderModalField('Type', viewingApp.type)}
              {renderModalField('Status', viewingApp.status)}

              <div className="col-span-1 sm:col-span-2">
                {renderModalField('Tagline', viewingApp.tagline)}
              </div>
              <div className="col-span-1 sm:col-span-2">
                {renderModalField('Description', viewingApp.description)}
              </div>

              {renderModalField('City', viewingApp.city)}
              {renderModalField('Country', viewingApp.country)}
              {renderModalField('Phone', viewingApp.phone)}

              {renderModalField('Website', viewingApp.website)}
              {renderModalField('LinkedIn', viewingApp.linkedin)}

              {renderModalField('Operating Mode', viewingApp.operatingMode)}
              {renderModalField('Startups Supported', viewingApp.startupsSupported)}
              {renderModalField('Students Mentored', viewingApp.studentsMentored)}
              {renderModalField('Funding Facilitated', `${viewingApp.fundingCurrency || ''} ${formatNumber(Number(viewingApp.fundingFacilitated || 0))}`)}

              <div className="col-span-1 sm:col-span-2 mt-2">
                {renderModalField('Sector Focus', viewingApp.sectorFocus)}
              </div>
              <div className="col-span-1 sm:col-span-2">
                {renderModalField('SDG Focus', viewingApp.sdgFocus)}
              </div>
            </div>

            {viewingApp.status === 'pending' && (
              <div className="p-6 border-t border-(--border) bg-gray-50 shrink-0 flex items-start gap-4 flex-col sm:flex-row">
                <Textarea
                  placeholder="Add a remark (optional)"
                  value={selected?.id === viewingApp.id ? remark : ''}
                  onChange={(e) => {
                    setSelected(viewingApp);
                    setRemark(e.target.value);
                  }}
                  className="w-full sm:w-auto flex-1 min-h-[44px]"
                />
                <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    size="sm"
                    onClick={() => handleAction('approved', viewingApp)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction('rejected', viewingApp)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
