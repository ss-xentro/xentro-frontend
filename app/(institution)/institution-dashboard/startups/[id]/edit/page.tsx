'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';

const stageOptions = [
  { value: 'idea', label: 'Idea' },
  { value: 'validation', label: 'Validation' },
  { value: 'early-stage', label: 'Early Stage' },
  { value: 'growth', label: 'Growth' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'maturity', label: 'Maturity' },
];

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}

export default function EditStartupPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    stage: 'idea',
    location: '',
    oneLiner: '',
  });

  useEffect(() => {
    loadStartup();
  }, []);

  const loadStartup = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) {
        router.push('/institution-login');
        return;
      }

      const res = await fetch(`/api/startups/${startupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load startup');
      }

      const data = await res.json();
      const startup = data.data;

      setFormData({
        name: startup.name || '',
        stage: startup.stage || 'idea',
        location: startup.location || '',
        oneLiner: startup.oneLiner || '',
      });
      setLocationSearch(startup.location || '');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Location autocomplete
  useEffect(() => {
    if (locationSearch.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'XentroApp/1.0'
            }
          }
        );
        const data = await res.json();
        setLocationSuggestions(data);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error('Location search failed:', error);
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [locationSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(e.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(e.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const city = suggestion.address.city || suggestion.address.town || suggestion.address.village || '';
    const country = suggestion.address.country || '';
    const location = `${city}, ${country}`;

    setFormData({ ...formData, location });
    setLocationSearch(location);
    setShowLocationSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = getSessionToken('institution');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const res = await fetch(`/api/startups/${startupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update startup');
      }

      router.push('/institution-dashboard/startups');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardSidebar>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Startup</h1>
          <p className="text-sm text-gray-600">Update startup details</p>
        </div>

        <Card className="p-10 bg-white border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-6">
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

              <div className="grid grid-cols-2 gap-4">
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

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Location
                  </label>
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                    placeholder="Start typing city..."
                    aria-label="Startup location"
                    autoComplete="off"
                  />

                  {locationLoading && (
                    <div className="absolute right-3 top-10.5 pointer-events-none">
                      <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}

                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={locationSuggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      role="listbox"
                    >
                      {locationSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 focus:bg-gray-100 focus:outline-none"
                          role="option"
                        >
                          <div className="font-medium text-gray-900 text-sm">{suggestion.address.city || suggestion.address.town || suggestion.address.village}</div>
                          <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900" role="alert">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name}
                className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? 'Saving...' : (
                  <>
                    Save Changes
                    <span className="text-base">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardSidebar>
  );
}
