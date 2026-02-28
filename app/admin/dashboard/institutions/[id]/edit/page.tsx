"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Input, Textarea, Select, Button, Badge, VerifiedBadge, FileUpload } from '@/components/ui';
import { institutionTypeLabels, Institution } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

const statusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

function getAuthToken(token: string | null): string | null {
  if (token) return token;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('xentro_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number };
    if (parsed?.expiresAt && parsed.expiresAt <= Date.now()) return null;
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export default function EditInstitutionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const authToken = getAuthToken(token);
        const res = await fetch(`/api/institutions/${id}`, {
          signal: controller.signal,
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load institution');
        const data = await res.json();
        setInstitution(data.institution);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  const updateField = (key: keyof Institution, value: any) => {
    setInstitution((prev) => (prev ? { ...prev, [key]: value } : prev));
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!institution) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const authToken = getAuthToken(token);
      const res = await fetch(`/api/institutions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          name: institution.name,
          type: institution.type,
          tagline: institution.tagline,
          city: institution.city,
          country: institution.country,
          website: institution.website,
          linkedin: institution.linkedin,
          logo: institution.logo,
          description: institution.description,
          status: institution.status,
          verified: institution.verified,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setInstitution((prev) => (prev ? { ...prev, ...data.data } : prev));
      setMessage('Saved changes');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-(--secondary)">Loading institution…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!institution) return null;

  const typeInfo = institutionTypeLabels[institution.type];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-(--primary)">Edit Institution</h1>
          {institution.verified && <VerifiedBadge />}
          {typeInfo && <Badge variant="outline">{typeInfo.label}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()} disabled={saving}>Back</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </div>

      {message && <p className="text-sm text-success">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FileUpload
              value={institution.logo ?? null}
              onChange={(url) => updateField('logo', url)}
              folder="institutions"
              entityType="institution"
              entityId={institution.id}
            />
          </div>
          <Input label="Name" value={institution.name} onChange={(e) => updateField('name', e.target.value)} required />
          <Select
            label="Type"
            value={institution.type}
            onChange={(val) => updateField('type', val)}
            options={Object.entries(institutionTypeLabels).map(([value, info]) => ({ value, label: info.label }))}
          />
          <Input label="City" value={institution.city ?? ''} onChange={(e) => updateField('city', e.target.value)} />
          <Input label="Country" value={institution.country ?? ''} onChange={(e) => updateField('country', e.target.value)} />
          <Input label="Website" value={institution.website ?? ''} onChange={(e) => updateField('website', e.target.value)} />
          <Input label="LinkedIn" value={institution.linkedin ?? ''} onChange={(e) => updateField('linkedin', e.target.value)} />
          <Select
            label="Status"
            value={institution.status}
            onChange={(val) => updateField('status', val)}
            options={statusOptions}
          />
          <div className="flex items-center gap-2 mt-6">
            <input
              id="verified"
              type="checkbox"
              checked={institution.verified ?? false}
              onChange={(e) => updateField('verified', e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="verified" className="text-sm text-(--primary)">Verified</label>
          </div>
        </div>
        <Input label="Tagline" value={institution.tagline ?? ''} onChange={(e) => updateField('tagline', e.target.value)} />
        <Textarea
          label="Description"
          rows={4}
          value={institution.description ?? ''}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </Card>
    </div>
  );
}
