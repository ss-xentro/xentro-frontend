'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';

export default function AddMentorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const canSubmit = () => {
    return formData.name.trim() && formData.email.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('institution_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const res = await fetch('/api/institution-mentors/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to create mentor');
      }

      router.push('/institution-dashboard/mentors');
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add New Mentor</h1>
          <p className="text-sm text-gray-600">Register a new mentor and link them to your institution.</p>
        </div>

        <Card className="p-10 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Mentor Name *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Mentor Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !canSubmit()}>
                {loading ? 'Creating...' : 'Create Mentor'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardSidebar>
  );
}
