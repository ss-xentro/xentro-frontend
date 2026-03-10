'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { BackButton } from '@/components/ui/BackButton';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'funding' | 'links'>('details');
  const [locationSearch, setLocationSearch] = useState('');
  const [formData, setFormData] = useState<StartupFormData>({ ...EMPTY_STARTUP_FORM });

  useEffect(() => {
    loadStartup();
  }, []);

  const loadStartup = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) { router.push('/institution-login'); return; }

      const res = await fetch(`/api/startups/${startupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load startup');

      const json = await res.json();
      const s = json.data;

      setFormData({
        name: s.name || '',
        tagline: s.tagline || '',
        logo: s.logo || '',
        coverImage: s.coverImage || '',
        pitch: s.pitch || '',
        description: s.description || '',
        stage: s.stage || 'ideation',
        status: s.status || 'private',
        location: s.location || '',
        city: s.city || '',
        country: s.country || '',
        oneLiner: s.oneLiner || '',
        foundedDate: s.foundedDate ? new Date(s.foundedDate).toISOString().split('T')[0] : '',
        fundingRound: s.fundingRound || 'bootstrapped',
        fundsRaised: s.fundsRaised || '',
        fundingCurrency: s.fundingCurrency || 'USD',
        website: s.website || '',
        linkedin: s.linkedin || '',
        twitter: s.twitter || '',
        instagram: s.instagram || '',
        pitchDeckUrl: s.pitchDeckUrl || '',
        demoVideoUrl: s.demoVideoUrl || '',
        industry: s.industry || '',
        primaryContactEmail: s.primaryContactEmail || '',
      });
      setLocationSearch(s.location || '');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { city: string; country: string; countryCode: string; displayName: string }) => {
    setFormData({ ...formData, location: location.displayName, city: location.city, country: location.country });
    setLocationSearch(location.displayName);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required. Please log in again.');

      const payload: Record<string, unknown> = { ...formData };
      if (!payload.foundedDate) payload.foundedDate = null;
      if (!payload.fundsRaised) payload.fundsRaised = null;
      if (!payload.logo) delete payload.logo;
      if (!payload.coverImage) delete payload.coverImage;

      const res = await fetch(`/api/startups/${startupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to update startup');

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Startup</h1>
            <p className="text-sm text-gray-600 mt-1">Update all startup details — same fields as the startup owner sees</p>
          </div>
          <Button onClick={() => handleSubmit()} disabled={saving || !formData.name}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {success && <FeedbackBanner type="success" message="Changes saved successfully!" />}
        {error && <FeedbackBanner type="error" message={error} />}

        <div className="border-b border-gray-200 flex space-x-6">
          {(['details', 'funding', 'links'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !formData.name} className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2">
              {saving ? 'Saving...' : <><span>Save Changes</span> <span>→</span></>}
            </button>
          </div>
        </form>
      </div>
    </DashboardSidebar>
  );
}
