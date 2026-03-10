'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea, Select, FileUpload } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { useEmailCheck } from '@/lib/useEmailCheck';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { Spinner } from '@/components/ui/Spinner';

const stageOptions = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'pre_seed_prototype', label: 'Pre seed / Prototype' },
  { value: 'seed_mvp', label: 'Seed / MVP' },
  { value: 'early_traction', label: 'Early Traction' },
  { value: 'growth', label: 'Growth' },
  { value: 'scaling', label: 'Scaling' },
];

interface Founder {
  id: string;
  name: string;
  email: string;
}

interface ProgramOption {
  id: string;
  name: string;
  type: string;
}

/** Inline email check indicator for founder emails */
function FounderEmailCheck({ email }: { email: string }) {
  const { checking, result } = useEmailCheck(email, 'create_user');

  if (!email || !email.includes('@')) return null;

  return (
    <div className="mt-1">
      {checking && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Spinner size="sm" className="h-3 w-3" />
          Checking email...
        </p>
      )}
      {!checking && result && result.canProceed && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Email is available
        </p>
      )}
      {!checking && result && !result.canProceed && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {result.message}
        </p>
      )}
    </div>
  );
}

export default function AddStartupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location autocomplete
  const [locationSearch, setLocationSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    stage: 'ideation',
    city: '',
    country: '',
    countryCode: '',
    oneLiner: '',
    logo: null as string | null,
    programId: '' as string,
  });

  const [founders, setFounders] = useState<Founder[]>([
    { id: '1', name: '', email: '' }
  ]);

  // Programs for this institution
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);

  // Fetch institution programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setProgramsLoading(true);
      try {
        const token = getSessionToken('institution');
        if (!token) return;
        const res = await fetch('/api/programs/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.programs || data.data || (Array.isArray(data) ? data : data.results || []);
          setPrograms(Array.isArray(list) ? list.filter((p: Record<string, unknown>) => !p.isDeleted && !p.is_deleted) : []);
        }
      } catch {
        // ignore — programs dropdown will just be empty
      } finally {
        setProgramsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // Location autocomplete with Nominatim (OpenStreetMap)
  const handleLocationSelect = (location: { city: string; country: string; countryCode: string; displayName: string }) => {
    setFormData({
      ...formData,
      city: location.city,
      country: location.country,
      countryCode: location.countryCode,
    });
    setLocationSearch(location.displayName);
  };

  // Close suggestions on outside click
  const addFounder = () => {
    setFounders([...founders, { id: Date.now().toString(), name: '', email: '' }]);
  };

  const removeFounder = (id: string) => {
    if (founders.length > 1) {
      setFounders(founders.filter(f => f.id !== id));
    }
  };

  const updateFounder = (id: string, field: 'name' | 'email', value: string) => {
    setFounders(founders.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const canProceedToStep2 = () => {
    return formData.name.trim() && formData.city.trim() && formData.country.trim();
  };

  const canSubmit = () => {
    return founders.some(f => f.name.trim() && f.email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionToken('institution');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const validFounders = founders.filter(f => f.name.trim() && f.email.trim());

      if (validFounders.length === 0) {
        throw new Error('At least one founder is required');
      }

      // Submit each founder's startup (or submit as array if backend supports)
      const primaryFounder = validFounders[0];

      const payload = {
        name: formData.name,
        stage: formData.stage,
        location: `${formData.city}, ${formData.country}`,
        city: formData.city,
        country: formData.country,
        country_code: formData.countryCode,
        one_liner: formData.oneLiner,
        logo: formData.logo,
        founder_name: primaryFounder.name,
        founder_email: primaryFounder.email,
        primary_contact_email: primaryFounder.email,
        additional_founders: validFounders.slice(1),
        ...(formData.programId ? { program_id: formData.programId } : {}),
      };

      let res = await fetch('/api/institution-startups/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch('/api/startups/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to add startup');
      }

      router.push('/institution-dashboard/startups');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardSidebar>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add Startup</h1>
          <p className="text-sm text-gray-600">Step {currentStep} of 2</p>
        </div>

        <Card className="p-10 bg-white border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Step 1: Startup Details */}
            {currentStep === 1 && (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Startup Logo
                    </label>
                    <FileUpload
                      value={formData.logo}
                      onChange={(logo) => setFormData({ ...formData, logo })}
                      accept="image/*"
                      maxSize={2}
                      folder="startup-logos"
                      enableCrop={true}
                      aspectRatio={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Startup Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder="e.g., TechVenture"
                      required
                      aria-label="Startup name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Stage
                      </label>
                      <Select
                        value={formData.stage}
                        onChange={(value) => setFormData({ ...formData, stage: value })}
                        options={stageOptions}
                        placeholder="Select stage"
                        aria-label="Startup stage"
                      />
                    </div>

                    <div>
                      <LocationAutocomplete
                        value={locationSearch}
                        onInputChange={setLocationSearch}
                        onSelect={handleLocationSelect}
                        label="Location"
                        placeholder="Start typing city..."
                        required
                      />
                    </div>
                  </div>

                  {/* Program (optional) */}
                  {programs.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Assign to Program <span className="text-gray-400">(optional)</span>
                      </label>
                      <select
                        value={formData.programId}
                        onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                        aria-label="Assign to program"
                      >
                        <option value="">No program</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.type}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* What You're Building */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-500">
                    What You&apos;re Building
                  </label>
                  <textarea
                    value={formData.oneLiner}
                    onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
                    rows={4}
                    maxLength={280}
                    className="w-full px-4 py-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all resize-none"
                    placeholder="Describe your startup in one clear sentence"
                    aria-label="Startup one-liner"
                  />
                  <p className="text-xs text-gray-400">{formData.oneLiner.length} / 280</p>
                </div>
              </>
            )}

            {/* Step 2: Founder Information */}
            {currentStep === 2 && (
              <>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Founders</h3>
                    <button
                      type="button"
                      onClick={addFounder}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Another Founder
                    </button>
                  </div>

                  {founders.map((founder, index) => (
                    <div key={founder.id} className="p-6 border border-gray-200 rounded-lg space-y-4 relative">
                      {founders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFounder(founder.id)}
                          className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                          aria-label="Remove founder"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      <p className="text-sm font-medium text-gray-700">Founder {index + 1}</p>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={founder.name}
                          onChange={(e) => updateFounder(founder.id, 'name', e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                          placeholder="Full name"
                          aria-label="Founder name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={founder.email}
                          onChange={(e) => updateFounder(founder.id, 'email', e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                          placeholder="founder@startup.com"
                          aria-label="Founder email"
                        />
                        <FounderEmailCheck email={founder.email} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900" role="alert">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8">
              <div className="flex items-center gap-4">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    ← Back
                  </button>
                )}
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2()}
                    className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Next: Add Founders
                    <span className="text-base">→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !canSubmit()}
                    className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? 'Creating...' : (
                      <>
                        Create Startup
                        <span className="text-base">→</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </DashboardSidebar>
  );
}
