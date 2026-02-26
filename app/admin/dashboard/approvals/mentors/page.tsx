"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

type MentorRow = {
  id: string;
  user: string;
  user_name: string | null;
  user_email: string | null;
  occupation: string | null;
  expertise: string | null;
  rate: string | number | null;
  pricing_per_hour: string | number | null;
  achievements: string | string[] | null;
  availability: string | null;
  documents: { name: string; url: string }[] | null;
  profile_completed: boolean;
  status: string;
  created_at: string | null;
};

export default function MentorVerificationPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MentorRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchMentors() {
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/mentors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      // Show only mentors who have completed their profile
      const mentors = (data.mentors || data.data || []) as MentorRow[];
      setRows(mentors.filter((m) => m.profile_completed));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDecision(mentorUserId: string, decision: 'approve' | 'reject') {
    if (!token) return;
    setActionLoading(`${mentorUserId}-${decision}`);
    try {
      const res = await fetch('/api/approvals/mentors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorUserId, decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${decision}`);
      setMessage(`Mentor ${decision === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchMentors();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Failed to ${decision}`);
    } finally {
      setActionLoading(null);
    }
  }

  function parseAvailability(raw: string | null): { day: string; startTime: string; endTime: string }[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
      suspended: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Suspended' },
    };
    const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', s.bg, s.text)}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-fadeInUp">
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Mentor Verification</h1>
            <p className="text-sm text-muted-foreground">
              Mentors who have completed their full profile are automatically approved and shown here.
            </p>
          </div>
          <Button variant="secondary" onClick={fetchMentors} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const isExpanded = expandedId === row.id;
            const slots = parseAvailability(typeof row.availability === 'string' ? row.availability : null);

            return (
              <div key={row.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.user_name || 'Unnamed mentor'}</span>
                      {statusBadge(row.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">{row.user_email}</div>
                    {row.occupation && <div className="text-sm">{row.occupation}</div>}
                    {row.expertise && (
                      <div className="text-sm text-muted-foreground">
                        Expertise: {typeof row.expertise === 'string' ? row.expertise : JSON.stringify(row.expertise)}
                      </div>
                    )}
                    {(row.pricing_per_hour || row.rate) && (
                      <div className="text-xs text-muted-foreground">
                        Rate: ${row.pricing_per_hour || row.rate}/hr
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setExpandedId(isExpanded ? null : row.id)}
                    >
                      {isExpanded ? 'Collapse' : 'View Details'}
                    </Button>
                    {row.status !== 'approved' && (
                      <Button
                        variant="primary"
                        onClick={() => handleDecision(row.user, 'approve')}
                        disabled={actionLoading === `${row.user}-approve`}
                      >
                        {actionLoading === `${row.user}-approve` ? 'Approving…' : 'Approve'}
                      </Button>
                    )}
                    {row.status !== 'rejected' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleDecision(row.user, 'reject')}
                        disabled={actionLoading === `${row.user}-reject`}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        {actionLoading === `${row.user}-reject` ? 'Rejecting…' : 'Reject'}
                      </Button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t pt-3 space-y-4 animate-fadeIn">
                    {/* Achievements */}
                    {row.achievements && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Achievements</h4>
                        {Array.isArray(row.achievements) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {row.achievements.map((item, i) => (
                              <li key={i} className="text-sm text-gray-600">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{row.achievements}</p>
                        )}
                      </div>
                    )}

                    {/* Availability */}
                    {slots.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Availability</h4>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                              {slot.day} {slot.startTime}–{slot.endTime}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {row.documents && row.documents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Documents</h4>
                        <ul className="space-y-1">
                          {row.documents.map((doc, i) => (
                            <li key={i}>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {doc.name || `Document ${i + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {row.created_at && (
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(row.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && !rows.length && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No mentors with completed profiles yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Mentors will appear here once they complete their full profile.</p>
            </div>
          )}

          {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>}
        </div>

        {message && (
          <p className={cn('text-sm', message.toLowerCase().includes('fail') ? 'text-red-600' : 'text-green-600')}>
            {message}
          </p>
        )}
      </Card>
    </div>
  );
}
