'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Select, Button } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { BackButton } from '@/components/ui/BackButton';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

const stageOptions = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'MVP (Pre-Revenue)' },
  { value: 'early_traction', label: 'Early Traction' },
  { value: 'growth', label: 'Growth' },
  { value: 'scale', label: 'Scale' },
];

const statusOptions = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

const fundingRoundOptions = [
  { value: 'bootstrapped', label: 'Bootstrapped' },
  { value: 'pre_seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b_plus', label: 'Series B+' },
  { value: 'unicorn', label: 'Unicorn' },
];

export default function EditStartupPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'funding' | 'links'>('details');

  // Location autocomplete
  const [locationSearch, setLocationSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    logo: '',
    coverImage: '',
    pitch: '',
    description: '',
    stage: 'idea',
    status: 'private',
    location: '',
    city: '',
    country: '',
    oneLiner: '',
    foundedDate: '',
    fundingRound: 'bootstrapped',
    fundsRaised: '',
    fundingCurrency: 'USD',
    website: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    pitchDeckUrl: '',
    demoVideoUrl: '',
    industry: '',
    primaryContactEmail: '',
  });

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
        stage: s.stage || 'idea',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required. Please log in again.');

      const payload: Record<string, unknown> = { ...formData };
      // Convert empty strings to null for optional fields
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

  return (
    <DashboardSidebar>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <BackButton href={`/institution-dashboard/startups/${startupId}`} label="Back to Details" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Startup</h1>
            <p className="text-sm text-gray-600 mt-1">Update all startup details — same fields as the startup owner sees</p>
          </div>
          <Button onClick={handleSubmit} disabled={saving || !formData.name}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {success && (
          <FeedbackBanner type="success" message="Changes saved successfully!" />
        )}

        {error && (
          <FeedbackBanner type="error" message={error} />
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 flex space-x-6">
          {(['details', 'funding', 'links'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'details' ? 'Company Details' : tab === 'funding' ? 'Funding & Financials' : 'Links & Social'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Identity */}
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Identity</h3>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => set('tagline', e.target.value)}
                    maxLength={280}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    placeholder="Short tagline for your startup"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">One-Line Pitch</label>
                  <textarea
                    value={formData.oneLiner}
                    onChange={(e) => set('oneLiner', e.target.value)}
                    rows={2}
                    maxLength={280}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
                    placeholder="Describe what you&#39;re building in one sentence"
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.oneLiner.length} / 280</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Pitch (160 chars)</label>
                  <textarea
                    value={formData.pitch}
                    onChange={(e) => set('pitch', e.target.value)}
                    rows={2}
                    maxLength={160}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
                    placeholder="Elevator pitch"
                  />
                  <p className="text-xs text-gray-400 mt-1">{formData.pitch.length} / 160</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
                    placeholder="Detailed description of the startup"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => set('industry', e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    placeholder="e.g., FinTech, HealthTech"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => set('logo', e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Cover Image URL</label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => set('coverImage', e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </Card>

              {/* Status & Location */}
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Status & Location</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Stage</label>
                    <Select
                      value={formData.stage}
                      onChange={(val) => set('stage', val)}
                      options={stageOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                    <Select
                      value={formData.status}
                      onChange={(val) => set('status', val)}
                      options={statusOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Founded Date</label>
                    <input
                      type="date"
                      value={formData.foundedDate}
                      onChange={(e) => set('foundedDate', e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                  <LocationAutocomplete
                    value={locationSearch}
                    onInputChange={setLocationSearch}
                    onSelect={handleLocationSelect}
                    label="Location"
                    placeholder="Start typing city..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Primary Contact Email</label>
                  <input
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={(e) => set('primaryContactEmail', e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    placeholder="contact@startup.com"
                  />
                </div>
              </Card>
            </>
          )}

          {activeTab === 'funding' && (
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Funding Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Latest Round</label>
                  <Select
                    value={formData.fundingRound}
                    onChange={(val) => set('fundingRound', val)}
                    options={fundingRoundOptions}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Currency</label>
                  <input
                    type="text"
                    value={formData.fundingCurrency}
                    onChange={(e) => set('fundingCurrency', e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    placeholder="USD"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Total Funds Raised</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={formData.fundsRaised}
                    onChange={(e) => set('fundsRaised', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'links' && (
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Links & Social</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Website</label>
                  <input type="url" value={formData.website} onChange={(e) => set('website', e.target.value)} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">LinkedIn</label>
                  <input type="url" value={formData.linkedin} onChange={(e) => set('linkedin', e.target.value)} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none" placeholder="https://linkedin.com/..." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Twitter</label>
                  <input type="url" value={formData.twitter} onChange={(e) => set('twitter', e.target.value)} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none" placeholder="https://twitter.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Instagram</label>
                  <input type="url" value={formData.instagram} onChange={(e) => set('instagram', e.target.value)} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none" placeholder="https://instagram.com/..." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Pitch Deck URL</label>
                  <input type="url" value={formData.pitchDeckUrl} onChange={(e) => set('pitchDeckUrl', e.target.value)} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Demo Video URL</label>
                  <input type="url" value={formData.demoVideoUrl} onChange={(e) => set('demoVideoUrl', e.target.value)} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none" placeholder="https://youtube.com/..." />
                </div>
              </div>
            </Card>
          )}

          {/* Bottom actions */}
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
