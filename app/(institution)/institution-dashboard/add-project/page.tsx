'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { toast } from 'sonner';

const projectStatusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function AddProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    status: 'planning',
    description: '',
    startDate: '',
    endDate: '',
  });

  const createMutation = useApiMutation<unknown, typeof formData>({
    method: 'post',
    path: '/api/projects/',
    invalidateKeys: [queryKeys.institution.projects()],
    requestOptions: { role: 'institution' },
    mutationOptions: {
      onSuccess: () => router.push('/institution-dashboard/projects'),
      onError: (err) => toast.error(err.message),
    },
  });
  const loading = createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <DashboardSidebar>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-(--primary) mb-2">Create Project</h1>
          <p className="text-sm text-(--primary-light)">Add a new research project or collaboration</p>
        </div>

        <Card className="p-10 bg-(--accent-subtle) border border-(--border) shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Project Identity */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-(--secondary) mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
                  placeholder="e.g., AI for Healthcare Research Initiative"
                  required
                  aria-label="Project name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-(--secondary) mb-2">
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
              <label className="block text-xs font-medium text-(--secondary)">
                About This Project
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-4 text-sm bg-(--accent-subtle) border border-(--border-hover) rounded-lg focus:border-(--border-focus) focus:bg-(--accent-light) focus:outline-none transition-all resize-none"
                placeholder="Describe the project objectives, scope, and expected outcomes"
                aria-label="Project description"
              />
            </div>

            {/* Timeline */}
            <div className="space-y-6 pt-6">
              <h3 className="text-base font-semibold text-(--primary) mb-6">Timeline</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-(--secondary) mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
                    aria-label="Start date"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-(--secondary) mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>\n\n            <div className="flex items-center gap-4 pt-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 text-sm text-(--primary-light) hover:text-(--primary) transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-6 py-3 text-sm font-medium bg-(--primary) text-(--background) rounded-lg hover:bg-(--primary-light) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
