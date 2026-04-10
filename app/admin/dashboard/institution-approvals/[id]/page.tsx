"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Textarea } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { use } from 'react';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-200',
  approved: 'bg-green-500/20 text-green-600 dark:text-green-200',
  rejected: 'bg-red-500/20 text-red-600 dark:text-red-200',
};

export default function InstitutionApprovalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: appRaw, isLoading: loading, error: queryError } = useApiQuery<{ data: InstitutionApplication[] }>(
    queryKeys.admin.applicationDetail(resolvedParams.id),
    '/api/institution-applications',
    { requestOptions: { role: 'admin' } },
  );
  const app = (appRaw?.data ?? []).find((a) => a.id === resolvedParams.id) ?? null;
  const error = actionError ?? queryError?.message ?? (!loading && !app ? 'Application not found' : null);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!app) return;
    if (!remark.trim()) {
      setActionError('A message is required.');
      return;
    }
    try {
      setSubmitting(true);
      await api.patch(`/api/institution-applications/${app.id}/`, {
        role: 'admin',
        json: { action, remark },
      });
      alert(`Verification ${action === 'approved' ? 'approved' : 'denied'} successfully.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.applications() });
      router.push('/admin/dashboard/institution-approvals');
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
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
      <div className="mb-6 bg-(--surface) p-4 rounded-lg border border-(--border)">
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
          <h1 className="text-2xl font-bold text-(--primary)">Verification Request: {app.name}</h1>
          <p className="text-(--secondary)">Review and approve or deny verification.</p>
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
              {renderField('Funding Facilitated', formatCurrency(Number(app.fundingFacilitated || 0), app.fundingCurrency || 'USD'))}
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
            <h3 className="text-lg font-bold border-b border-(--border) pb-4 mb-4">Verification Decision</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-(--primary) mb-2">Admin Message (Required)</label>
                <Textarea
                  placeholder="Message shown to the institution for this decision..."
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
                    {submitting ? 'Processing...' : 'Approve Verified Badge'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-500/15 border border-red-500/30"
                    disabled={submitting}
                    onClick={() => handleAction('rejected')}
                  >
                    Deny Verified Badge
                  </Button>
                  {!app.verified && (
                    <p className="text-xs flex text-red-500 text-center mt-2">
                      Cannot approve until email is verified.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-(--accent-subtle) rounded-lg text-center border border-(--border-light) mt-4">
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
