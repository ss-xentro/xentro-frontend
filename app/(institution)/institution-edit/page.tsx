'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Input, Textarea, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Institution, InstitutionType, OperatingMode } from '@/lib/types';
import { institutionTypeLabels, operatingModeLabels } from '@/lib/types';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { toast } from 'sonner';

export default function EditInstitutionPage() {
  const router = useRouter();

  // --- TanStack Query: load institution ---
  const { data: meData, isLoading: loading } = useApiQuery<{ institution: Institution }>(
    queryKeys.institution.profile(),
    '/api/auth/me/',
    { requestOptions: { role: 'institution' } },
  );
  const institution = meData?.institution ?? null;

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    type: '' as InstitutionType | '',
    city: '',
    country: '',
    operatingMode: '' as OperatingMode | '',
    website: '',
    linkedin: '',
    email: '',
    phone: '',
    description: '',
  });
  const [formSeeded, setFormSeeded] = useState(false);

  useEffect(() => {
    if (!institution || formSeeded) return;
    setFormData({
      name: institution.name || '',
      tagline: institution.tagline || '',
      type: institution.type || '',
      city: institution.city || '',
      country: institution.country || '',
      operatingMode: institution.operatingMode || '',
      website: institution.website || '',
      linkedin: institution.linkedin || '',
      email: institution.email || '',
      phone: institution.phone || '',
      description: institution.description || '',
    });
    setFormSeeded(true);
  }, [institution, formSeeded]);

  // --- TanStack Mutation: update institution ---
  const saveMutation = useApiMutation<unknown, typeof formData>({
    method: 'patch',
    path: institution ? `/api/institutions/${institution.id}` : '/api/institutions/0',
    invalidateKeys: [queryKeys.institution.profile()],
    requestOptions: { role: 'institution' },
    mutationOptions: {
      onSuccess: () => { toast.success('Institution updated successfully! Redirecting...'); router.push('/institution-dashboard'); },
      onError: (err) => toast.error(err.message || 'Failed to update institution'),
    },
  });
  const saving = saveMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (loading) {
    return (
      <DashboardSidebar>
        <main className="min-h-screen bg-background py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-(--secondary)">Loading...</p>
          </div>
        </main>
      </DashboardSidebar>
    );
  }

  if (!institution) {
    return (
      <DashboardSidebar>
        <main className="min-h-screen bg-background py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-(--secondary)">Institution not found</p>
          </div>
        </main>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-(--primary)">Edit Institution</h1>
            <p className="text-(--secondary) mt-1">Update your institution information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Institution Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="A brief tagline for your institution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-(--primary) mb-2">
                  Institution Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as InstitutionType })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--surface) focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select type...</option>
                  {Object.entries(institutionTypeLabels).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-(--primary) mb-2">
                  Operating Mode
                </label>
                <select
                  value={formData.operatingMode}
                  onChange={(e) => setFormData({ ...formData, operatingMode: e.target.value as OperatingMode })}
                  className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--surface) focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select mode...</option>
                  {Object.entries(operatingModeLabels).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />

              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}

              />

              <Input
                label="LinkedIn"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}

              />

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Tell us about your institution..."
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} isLoading={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/institution-dashboard">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </Card>
        </form>
      </div>
    </DashboardSidebar>
  );
}
