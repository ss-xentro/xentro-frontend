'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';

const projectStatusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function AddProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    status: 'planning',
    description: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('institution_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      router.push('/institution-dashboard/projects');
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
          <h1 className="text-2xl font-semibold text-(--primary) mb-2">Create Project</h1>
          <p className="text-sm text-(--secondary)">Add a new research project or collaboration</p>
        </div>

        <Card className="p-10 bg-white border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Project Identity */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                  placeholder="e.g., AI for Healthcare Research Initiative"
                  required
                  aria-label="Project name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  options={projectStatusOptions}
                  placeholder="Select project status"
                  aria-label="Project status"
                />
              </div>
            </div>

            {/* About This Project */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-500">
                About This Project
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all resize-none"
                placeholder="Describe the project objectives, scope, and expected outcomes"
                aria-label="Project description"
              />
            </div>

            {/* Timeline */}
            <div className="space-y-6 pt-6">
              <h3 className="text-base font-semibold text-(--primary) mb-6">Timeline</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                    aria-label="Start date"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900" role="alert">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4 pt-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? 'Creating...' : (
                  <>
                    Create Project
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
