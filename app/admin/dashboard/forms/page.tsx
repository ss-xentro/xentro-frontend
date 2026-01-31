'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Form {
  id: string;
  type: string;
  status: string;
  submittedBy: string;
  submittedAt: string | null;
  data: Record<string, unknown>;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  submitter?: {
    id: string;
    name: string;
    email: string;
  };
}

const FORM_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  startup_create: { label: 'New Startup', icon: '🚀' },
  startup_update: { label: 'Startup Update', icon: '✏️' },
  mentor_apply: { label: 'Mentor Application', icon: '🎯' },
  mentor_update: { label: 'Mentor Update', icon: '✏️' },
  institute_create: { label: 'New Institution', icon: '🏛️' },
  institute_update: { label: 'Institution Update', icon: '✏️' },
  event_create: { label: 'New Event', icon: '📅' },
  program_create: { label: 'New Program', icon: '📚' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Under Review' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Withdrawn' },
};

// Helper to safely get string from form data
function getFormDataString(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  if (value === null || value === undefined) return null;
  return String(value);
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('submitted');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchForms();
  }, [statusFilter, typeFilter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('xentro_session')
        ? JSON.parse(localStorage.getItem('xentro_session')!).token
        : null;
      
      // For demo, also try mock admin token
      const adminToken = token || await getAdminToken();
      
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);

      const res = await fetch(`/api/admin/forms?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      if (!res.ok) throw new Error('Failed to load forms');
      const data = await res.json();
      setForms(data.forms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const getAdminToken = async () => {
    // Get mock admin token for development
    try {
      const res = await fetch('/api/dev/mock-admin');
      if (res.ok) {
        const data = await res.json();
        return data.token;
      }
    } catch (e) {
      console.error('Failed to get mock admin token');
    }
    return null;
  };

  const handleReview = async (action: 'approve' | 'reject' | 'request_changes') => {
    if (!selectedForm) return;
    
    setReviewing(true);
    try {
      const token = localStorage.getItem('xentro_session')
        ? JSON.parse(localStorage.getItem('xentro_session')!).token
        : await getAdminToken();

      const res = await fetch(`/api/admin/forms/${selectedForm.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          notes: reviewNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Review failed');
      }

      // Refresh list
      fetchForms();
      setSelectedForm(null);
      setReviewNotes('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--primary)">Form Reviews</h1>
          <p className="text-sm text-(--secondary)">Review and approve submitted forms</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-(--secondary) mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-(--border) bg-(--surface) text-sm"
            >
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-(--secondary) mb-1 block">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-(--border) bg-(--surface) text-sm"
            >
              <option value="">All Types</option>
              <option value="startup_create">New Startup</option>
              <option value="mentor_apply">Mentor Application</option>
              <option value="institute_create">New Institution</option>
              <option value="event_create">New Event</option>
              <option value="program_create">New Program</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Forms List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-(--border) rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-(--border) rounded w-1/3" />
                  <div className="h-4 bg-(--border) rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={fetchForms}>Try Again</Button>
        </Card>
      ) : forms.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-(--primary) mb-2">No forms found</h3>
          <p className="text-(--secondary)">
            {statusFilter === 'submitted' 
              ? 'No pending submissions to review'
              : 'No forms match your filters'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const typeInfo = FORM_TYPE_LABELS[form.type] || { label: form.type, icon: '📄' };
            const statusInfo = STATUS_STYLES[form.status] || STATUS_STYLES.draft;

            return (
              <Card
                key={form.id}
                className={cn(
                  'p-6 cursor-pointer transition-all hover:shadow-md',
                  selectedForm?.id === form.id && 'ring-2 ring-accent'
                )}
                onClick={() => setSelectedForm(selectedForm?.id === form.id ? null : form)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-(--background) rounded-lg flex items-center justify-center text-2xl">
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-(--primary)">{typeInfo.label}</h3>
                        <p className="text-sm text-(--secondary)">
                          {form.submitter?.name || 'Unknown'} • {form.submitter?.email}
                        </p>
                      </div>
                      <Badge className={cn(statusInfo.bg, statusInfo.text)}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    {/* Form Data Preview */}
                    <div className="mt-3 text-sm text-(--secondary)">
                      {(() => {
                        const name = getFormDataString(form.data, 'name');
                        const tagline = getFormDataString(form.data, 'tagline');
                        return (
                          <>
                            {name && <span className="font-medium">{name}</span>}
                            {name && tagline && <span className="mx-2">•</span>}
                            {tagline && <span>{tagline}</span>}
                          </>
                        );
                      })()}
                    </div>

                    <div className="mt-2 text-xs text-(--secondary)/60">
                      Submitted: {formatDate(form.submittedAt || form.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedForm?.id === form.id && (
                  <div className="mt-6 pt-6 border-t border-(--border)" onClick={(e) => e.stopPropagation()}>
                    <h4 className="font-medium text-(--primary) mb-3">Form Details</h4>
                    <div className="bg-(--background) rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                      <pre className="text-xs text-(--secondary) whitespace-pre-wrap">
                        {JSON.stringify(form.data, null, 2)}
                      </pre>
                    </div>

                    {form.status === 'submitted' || form.status === 'under_review' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-(--secondary) mb-1 block">
                            Review Notes
                          </label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add notes for the submitter (optional for approval, required for rejection)"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleReview('approve')}
                            disabled={reviewing}
                            className="bg-success hover:bg-success/90"
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleReview('request_changes')}
                            disabled={reviewing}
                          >
                            Request Changes
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleReview('reject')}
                            disabled={reviewing || !reviewNotes.trim()}
                            className="text-error border-error hover:bg-error/10"
                          >
                            ✗ Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      form.reviewNotes && (
                        <div className="bg-(--background) rounded-lg p-4">
                          <p className="text-xs text-(--secondary) mb-1">Review Notes:</p>
                          <p className="text-sm">{form.reviewNotes}</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
