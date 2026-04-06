'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { BackButton } from '@/components/ui/BackButton';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { EMPTY_STARTUP_FORM } from '../../../_lib/startup-form-constants';
import type { StartupFormData } from '../../../_lib/startup-form-constants';
import { DetailsTab } from './_components/DetailsTab';
import { FundingTab } from './_components/FundingTab';
import { LinksTab } from './_components/LinksTab';

export default function EditStartupPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = params.id as string;

  // --- TanStack Query: load startup ---
  const { data: startupRaw, isLoading: loading } = useApiQuery<{ data: Record<string, unknown> }>(
    queryKeys.institution.startupDetail(startupId),
    `/api/startups/${startupId}`,
    { requestOptions: { role: 'institution' } },
  );

  const [activeTab, setActiveTab] = useState<'details' | 'funding' | 'links'>('details');
  const [locationSearch, setLocationSearch] = useState('');
  const [formData, setFormData] = useState<StartupFormData>({ ...EMPTY_STARTUP_FORM });
  const [formSeeded, setFormSeeded] = useState(false);

  useEffect(() => {
    if (!startupRaw || formSeeded) return;
    const s = startupRaw.data;
    setFormData({
      name: (s.name as string) || '',
      tagline: (s.tagline as string) || '',
      logo: (s.logo as string) || '',
      coverImage: (s.coverImage as string) || '',
      pitch: (s.pitch as string) || '',
      description: (s.description as string) || '',
      stage: (s.stage as string) || 'ideation',
      status: (s.status as string) || 'public',
      location: (s.location as string) || '',
      city: (s.city as string) || '',
      country: (s.country as string) || '',
      oneLiner: (s.oneLiner as string) || '',
      foundedDate: s.foundedDate ? new Date(s.foundedDate as string).toISOString().split('T')[0] : '',
      fundingRound: (s.fundingRound as string) || 'bootstrapped',
      fundsRaised: (s.fundsRaised as string) || '',
      fundingCurrency: (s.fundingCurrency as string) || 'USD',
      website: (s.website as string) || '',
      linkedin: (s.linkedin as string) || '',
      twitter: (s.twitter as string) || '',
      instagram: (s.instagram as string) || '',
      pitchDeckUrl: (s.pitchDeckUrl as string) || '',
      demoVideoUrl: (s.demoVideoUrl as string) || '',
      industry: (s.industry as string) || '',
      primaryContactEmail: (s.primaryContactEmail as string) || '',
    });
    setLocationSearch((s.location as string) || '');
    setFormSeeded(true);
  }, [startupRaw, formSeeded]);

  // --- TanStack Mutation: save startup ---
  const saveMutation = useApiMutation<unknown, Record<string, unknown>>({
    method: 'put',
    path: `/api/startups/${startupId}`,
    invalidateKeys: [queryKeys.institution.startups(), queryKeys.institution.startupDetail(startupId)],
    requestOptions: { role: 'institution' },
    mutationOptions: {
      onSuccess: () => { toast.success('Changes saved successfully!'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      onError: (err) => toast.error(err.message),
    },
  });
  const saving = saveMutation.isPending;

  const handleLocationSelect = (location: { city: string; country: string; countryCode: string; displayName: string }) => {
    setFormData({ ...formData, location: location.displayName, city: location.city, country: location.country });
    setLocationSearch(location.displayName);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const payload: Record<string, unknown> = { ...formData };
    if (!payload.foundedDate) payload.foundedDate = null;
    if (!payload.fundsRaised) payload.fundsRaised = null;
    if (!payload.logo) delete payload.logo;
    if (!payload.coverImage) delete payload.coverImage;

    saveMutation.mutate(payload);
  };

  const set = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <DashboardSidebar>
        <PageSkeleton />
      </DashboardSidebar>
    );
  }

  const TAB_LABELS = { details: 'Company Details', funding: 'Funding & Financials', links: 'Links & Social' } as const;

  return (
    <DashboardSidebar>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <BackButton href={`/institution-dashboard/startups/${startupId}`} label="Back to Details" />
            <h1 className="text-2xl font-bold text-(--primary)">Edit Startup</h1>
            <p className="text-sm text-(--primary-light) mt-1">Update all startup details — same fields as the startup owner sees</p>
          </div>
          <Button onClick={() => handleSubmit()} disabled={saving || !formData.name}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>

        <div className="flex gap-6 border-b border-(--border)">
          {(['details', 'funding', 'links'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                ? 'border-violet-500 text-(--primary)'
                : 'border-transparent text-(--secondary) hover:text-(--primary-light)'
                }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'details' && (
            <DetailsTab formData={formData} locationSearch={locationSearch} onFieldChange={set} onLocationSearchChange={setLocationSearch} onLocationSelect={handleLocationSelect} />
          )}
          {activeTab === 'funding' && <FundingTab formData={formData} onFieldChange={set} />}
          {activeTab === 'links' && <LinksTab formData={formData} onFieldChange={set} />}

          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-(--primary-light) hover:text-(--primary) transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !formData.name} className="px-6 py-3 text-sm font-medium bg-(--primary) text-(--background) rounded-lg hover:bg-(--primary-light) disabled:opacity-50 transition-colors flex items-center gap-2">
              {saving ? 'Saving...' : <><span>Save Changes</span> <span>→</span></>}
            </button>
          </div>
        </form>
      </div>
    </DashboardSidebar>
  );
}
