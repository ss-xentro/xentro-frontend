'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { StartupDetailsStep } from './_components/StartupDetailsStep';
import { FoundersStep } from './_components/FoundersStep';

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

  const canProceedToStep2 = () => formData.name.trim() && formData.city.trim() && formData.country.trim();
  const canSubmit = () => founders.some(f => f.name.trim() && f.email.trim());

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
          <h1 className="text-2xl font-semibold text-white mb-2">Add Startup</h1>
          <p className="text-sm text-gray-300">Step {currentStep} of 2</p>
        </div>

        <Card className="p-10 bg-white/5 border border-white/10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            {currentStep === 1 && (
              <StartupDetailsStep
                formData={formData}
                setFormData={setFormData}
                locationSearch={locationSearch}
                setLocationSearch={setLocationSearch}
                programs={programs}
              />
            )}

            {currentStep === 2 && (
              <FoundersStep founders={founders} setFounders={setFounders} />
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300" role="alert">
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
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                  >
                    &larr; Back
                  </button>
                )}
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
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
                    <span className="text-base">&rarr;</span>
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
                        <span className="text-base">&rarr;</span>
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
