'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';

const roleOptions = [
  { value: 'director', label: 'Director' },
  { value: 'program-manager', label: 'Program Manager' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'operations', label: 'Operations' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
];

export default function AddTeamMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    bio: '',
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

      const res = await fetch('/api/institution-team', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add team member');
      }

      router.push('/institution-dashboard/team');
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
          <h1 className="text-2xl font-semibold text-(--primary) mb-2">Add Team Member</h1>
          <p className="text-sm text-(--secondary)">Invite a staff member to join your institution</p>
        </div>

        <Card className="p-10 bg-white border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                  placeholder="e.g., Jane Smith"
                  required
                  aria-label="Team member name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                  placeholder="jane.smith@institution.edu"
                  required
                  aria-label="Team member email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Role
                  </label>
                  <Select
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value })}
                    options={roleOptions}
                    placeholder="Select a role"
                    aria-label="Team member role"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                    placeholder="e.g., Incubation"
                    aria-label="Department"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
                  placeholder="+1 (555) 123-4567"
                  aria-label="Phone number"
                />
              </div>
            </div>

            {/* Background */}
            <div className="space-y-3 pt-6">
              <label className="block text-xs font-medium text-gray-500">
                Bio & Expertise
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all resize-none"
                placeholder="Brief background and areas of expertise"
                aria-label="Bio"
              />
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
                disabled={loading || !formData.name || !formData.email || !formData.role}
                className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
