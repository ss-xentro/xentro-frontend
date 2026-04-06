'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { useEmailCheck } from '@/lib/useEmailCheck';
import { toast } from 'sonner';

export default function AddMentorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { checking: emailChecking, result: emailResult } = useEmailCheck(formData.email, 'create_user');

  const canSubmit = () => {
    return formData.name.trim() && formData.email.trim() && formData.phone.trim() && (!emailResult || emailResult.canProceed) && !emailChecking;
  };

  const createMutation = useApiMutation<unknown, typeof formData>({
    method: 'post',
    path: '/api/institution-mentors/create/',
    invalidateKeys: [queryKeys.institution.mentors()],
    requestOptions: { role: 'institution' },
    mutationOptions: {
      onSuccess: () => router.push('/institution-dashboard/mentors'),
      onError: (err) => toast.error(err.message),
    },
  });
  const loading = createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });
  };

  return (
    <DashboardSidebar>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-(--primary) mb-2">Add New Mentor</h1>
          <p className="text-sm text-(--primary-light)">Register a new mentor and link them to your institution.</p>
        </div>

        <Card className="p-10 bg-(--accent-subtle) border border-(--border) shadow-sm relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-medium text-(--secondary) mb-2">Mentor Name *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--secondary) mb-2">Mentor Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {/* Email uniqueness indicator */}
              {formData.email.includes('@') && (
                <div className="mt-2">
                  {emailChecking && (
                    <p className="text-xs text-(--secondary) flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Checking email...
                    </p>
                  )}
                  {!emailChecking && emailResult && emailResult.canProceed && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email is available
                    </p>
                  )}
                  {!emailChecking && emailResult && !emailResult.canProceed && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {emailResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-(--secondary) mb-2">Mentor Phone *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

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
