'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';
import { toast } from 'sonner';

// Roles that can be assigned to team members (owner is reserved)
const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Full access to manage the institution profile, team, and network' },
  { value: 'manager', label: 'Manager', description: 'Can manage startups and mentors, and invite members' },
  { value: 'ambassador', label: 'Ambassador', description: 'Organizes events and campus activities (requires approval)' },
  { value: 'viewer', label: 'Viewer', description: 'Can view dashboard and reports only' },
];

export default function AddTeamMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ambassador',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getSessionToken('institution');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const res = await fetch('/api/institution-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, 'Failed to add team member'));
      }

      router.push('/institution-dashboard/team');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardSidebar>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-(--primary) mb-2">Add Team Member</h1>
          <p className="text-sm text-(--primary-light)">Invite someone to help manage your institution</p>
        </div>

        <Card className="p-10 bg-(--accent-subtle) border border-(--border) shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-(--secondary) mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
                  placeholder="e.g., Jane Smith"
                  required
                  aria-label="Team member name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-(--secondary) mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
                  placeholder="jane.smith@institution.edu"
                  required
                  aria-label="Team member email"
                />
                <p className="text-xs text-(--secondary) mt-1">
                  They will use this email to log in and access the dashboard
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-(--secondary) mb-2">
                  Access Level <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.role === option.value
                        ? 'border-(--primary) bg-(--accent-subtle)'
                        : 'border-(--border) hover:border-(--border-hover)'
                        }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-(--primary)">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-(--secondary) mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
                  placeholder="+1 (555) 123-4567"
                  aria-label="Phone number"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
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
                disabled={loading || !formData.name || !formData.email || !formData.role}
                className="px-6 py-3 text-sm font-medium bg-(--primary) text-(--background) rounded-lg hover:bg-(--primary-light) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? 'Adding...' : (
                  <>
                    Add Team Member
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
