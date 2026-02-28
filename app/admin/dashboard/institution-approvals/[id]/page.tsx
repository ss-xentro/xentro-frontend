"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Textarea } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function InstitutionApprovalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const [app, setApp] = useState<InstitutionApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // We reuse the existing list endpoint, but in a real app you'd add a detail GET endpoint
        const res = await fetch('/api/institution-applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Failed to load application');
        const apps = payload.data ?? [];
        const found = apps.find((a: InstitutionApplication) => a.id === resolvedParams.id);
        if (!found) throw new Error('Application not found');
        setApp(found);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!app) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/institution-applications/${app.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, remark }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Update failed');
      alert(`Institution ${action === 'approved' ? 'approved' : 'rejected'} successfully!`);
      router.push('/admin/dashboard/institution-approvals');
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  const renderField = (label: string, value: string | number | string[] | any) => {
    if (value === null || value === undefined || value === '') return null;
    let displayValue: React.ReactNode = value;
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      displayValue = value.join(', ');
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (label.toLowerCase().includes('logo') && typeof value === 'string' && value.startsWith('http')) {
      displayValue = <img src={value} alt="Logo" className="max-h-24 rounded shadow-sm border border-(--border)" />;
    } else if (label.toLowerCase().includes('website') || label.toLowerCase().includes('linkedin')) {
      displayValue = <a href={value as string} target="_blank" rel="noreferrer" className="text-accent hover:underline break-all">{value}</a>;
    }

    return (
      <div className="mb-6 bg-white p-4 rounded-lg border border-(--border)">
        <h4 className="text-xs font-bold text-(--secondary) uppercase tracking-wider mb-2">{label}</h4>
        <div className="text-base text-(--primary)">{displayValue}</div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-(--secondary)">Loading application details...</div>;
  if (error || !app) return <div className="p-8 text-center text-red-600">{error || 'Not found'}</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard/institution-approvals">
          <Button variant="ghost" className="px-3" aria-label="Go back">
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-(--primary)">Application Details: {app.name}</h1>
          <p className="text-(--secondary)">Review the full submitted profile below.</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[app.status] ?? 'bg-(--surface-hover) text-(--primary)'}`}>
            {app.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold border-b border-(--border) pb-4 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">{renderField('Logo', app.logo)}</div>
              {renderField('Institution Name', app.name)}
              {renderField('Contact Email', app.email)}
              {renderField('Type', app.type)}
              {renderField('Operating Mode', app.operatingMode)}
              <div className="sm:col-span-2">{renderField('Tagline', app.tagline)}</div>
              <div className="sm:col-span-2">{renderField('Description', app.description)}</div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold border-b border-(--border) pb-4 mb-4">Focus & Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('Startups Supported', app.startupsSupported)}
              {renderField('Students Mentored', app.studentsMentored)}
              {renderField('Funding Facilitated', `${app.fundingCurrency || ''} ${formatNumber(Number(app.fundingFacilitated || 0))}`)}
              <div className="sm:col-span-2">{renderField('Sector Focus', app.sectorFocus)}</div>
              <div className="sm:col-span-2">{renderField('SDG Focus', app.sdgFocus)}</div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold border-b border-(--border) pb-4 mb-4">Contact & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField('City', app.city)}
              {renderField('Country', app.country)}
              {renderField('Phone Number', app.phone)}
              <div className="sm:col-span-2">{renderField('Website', app.website)}</div>
              <div className="sm:col-span-2">{renderField('LinkedIn', app.linkedin)}</div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-bold border-b border-(--border) pb-4 mb-4">Action</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-(--primary) mb-2">Administrator Remarks (Optional)</label>
                <Textarea
                  placeholder="Notes for the institution on why they were approved/rejected..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full min-h-[120px]"
                  disabled={app.status !== 'pending' || submitting}
                />
              </div>

              {app.status === 'pending' ? (
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    className="w-full py-6 text-lg"
                    disabled={!app.verified || submitting}
                    onClick={() => handleAction('approved')}
                  >
                    {submitting ? 'Processing...' : 'Approve Institution'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                    disabled={submitting}
                    onClick={() => handleAction('rejected')}
                  >
                    Reject Application
                  </Button>
                  {!app.verified && (
                    <p className="text-xs flex text-red-500 text-center mt-2">
                      Cannot approve until email is verified.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100 mt-4">
                  <p className="text-sm text-(--secondary)">This application has already been processed.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
