'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Input, Textarea, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Institution, InstitutionType, OperatingMode } from '@/lib/types';
import { institutionTypeLabels, operatingModeLabels } from '@/lib/types';

export default function EditInstitutionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    type: '' as InstitutionType,
    city: '',
    country: '',
    operatingMode: '' as OperatingMode,
    website: '',
    linkedin: '',
    email: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    const loadInstitution = async () => {
      try {
        const token = localStorage.getItem('institution_token');
        if (!token) {
          router.push('/institution-login');
          return;
        }

        const res = await fetch('/api/institution-auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load institution');
        }

        const data = await res.json();
        setInstitution(data.institution);
        setFormData({
          name: data.institution.name || '',
          tagline: data.institution.tagline || '',
          type: data.institution.type || '',
          city: data.institution.city || '',
          country: data.institution.country || '',
          operatingMode: data.institution.operatingMode || '',
          website: data.institution.website || '',
          linkedin: data.institution.linkedin || '',
          email: data.institution.email || '',
          phone: data.institution.phone || '',
          description: data.institution.description || '',
        });
      } catch (error) {
        console.error('Error loading institution:', error);
        alert('Failed to load institution data');
      } finally {
        setLoading(false);
      }
    };

    loadInstitution();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('institution_token');
      const res = await fetch(`/api/institutions/${institution?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update institution');
      }

      alert('Institution updated successfully!');
      router.push('/institution-dashboard');
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Failed to update institution');
    } finally {
      setSaving(false);
    }
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Tagline"
                  value={formData.tagline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tagline: e.target.value })}
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
                  className="w-full px-4 py-3 rounded-lg border border-(--border) bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select type...</option>
                  {Object.entries(institutionTypeLabels).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.emoji} {value.label}
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
                  className="w-full px-4 py-3 rounded-lg border border-(--border) bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select mode...</option>
                  {Object.entries(operatingModeLabels).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.emoji} {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City"
                value={formData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                required
              />

              <Input
                label="Country"
                value={formData.country}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, country: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Website"
                type="url"
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />

              <Input
                label="LinkedIn"
                type="url"
                value={formData.linkedin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/..."
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
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
