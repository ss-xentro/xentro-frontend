'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';

interface Mentor {
  id: string;
  user_name: string | null;
  user_email: string | null;
  title: string | null;
  company: string | null;
  occupation: string | null;
  expertise: string[];
}

type ApiMentor = Omit<Mentor, 'expertise'> & { expertise?: unknown };

function normalizeExpertise(expertise: unknown): string[] {
  if (Array.isArray(expertise)) {
    return expertise
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof expertise === 'string') {
    return expertise
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

interface EndorsementRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterAvatar: string | null;
  entityType: string;
  message: string | null;
  status: string;
  responseComment: string | null;
  createdAt: string;
}

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Endorsement requests
  const [endorsements, setEndorsements] = useState<EndorsementRequest[]>([]);
  const [endorsementsLoading, setEndorsementsLoading] = useState(true);
  const [showEndorsements, setShowEndorsements] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseComment, setResponseComment] = useState('');

  useEffect(() => {
    loadMentors();
    loadEndorsements();
  }, []);

  const loadMentors = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) {
        router.push('/institution-login');
        return;
      }

      const res = await fetch('/api/mentors/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to load mentors'));
      const data = await res.json();
      const rawMentors: ApiMentor[] = Array.isArray(data.data) ? data.data : [];
      const normalizedMentors: Mentor[] = rawMentors.map((mentor) => ({
        ...mentor,
        expertise: normalizeExpertise(mentor.expertise),
      }));
      setMentors(normalizedMentors);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadEndorsements = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) return;

      const res = await fetch('/api/endorsements/?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEndorsements(data.data || data.endorsements || []);
      }
    } catch {
      // silently fail
    } finally {
      setEndorsementsLoading(false);
    }
  };

  const handleEndorsementResponse = async (endorsementId: string, action: 'accepted' | 'rejected') => {
    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required.');

      const res = await fetch(`/api/endorsements/${endorsementId}/respond/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, comment: responseComment }),
      });

      if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to respond'));

      // Reload both lists
      setRespondingId(null);
      setResponseComment('');
      loadEndorsements();
      if (action === 'accepted') loadMentors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const pendingCount = endorsements.filter(e => e.status === 'pending').length;

  if (loading) {
    return (
      <DashboardSidebar>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Mentors</h1>
            <p className="text-sm text-gray-400">Manage mentors associated with your institution.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/institution-dashboard/add-mentor">
              <Button>
                New Mentor
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => setShowEndorsements(!showEndorsements)}
              className="flex items-center gap-2"
            >
              Endorsement Requests
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Endorsement Requests Section */}
        {showEndorsements && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Pending Endorsement Requests</h2>
            {endorsementsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-white/5 border border-white/10 rounded-lg"></div>
                <div className="h-20 bg-white/5 border border-white/10 rounded-lg"></div>
              </div>
            ) : endorsements.length === 0 ? (
              <Card className="p-6 bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-gray-300">No pending endorsement requests.</p>
                <p className="text-xs text-gray-500 mt-1">Mentors and startups can request endorsement from your institution.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {endorsements.map((endorsement) => (
                  <Card key={endorsement.id} className="p-5 bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-300">
                            {endorsement.requesterName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{endorsement.requesterName}</h4>
                          <p className="text-xs text-gray-400">{endorsement.requesterEmail}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded capitalize">
                            {endorsement.entityType}
                          </span>
                          {endorsement.message && (
                            <p className="text-sm text-gray-300 mt-2 italic">&ldquo;{endorsement.message}&rdquo;</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(endorsement.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {respondingId === endorsement.id ? (
                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        <label className="block text-xs font-medium text-gray-400">
                          Add a comment (optional)
                        </label>
                        <textarea
                          value={responseComment}
                          onChange={(e) => setResponseComment(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Welcome to our institution! We look forward to working with you."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEndorsementResponse(endorsement.id, 'accepted')}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleEndorsementResponse(endorsement.id, 'rejected')}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => { setRespondingId(null); setResponseComment(''); }}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                        <button
                          onClick={() => setRespondingId(endorsement.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                        >
                          Respond
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {mentors.length === 0 ? (
          <Card className="p-12 text-center bg-white/5 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No mentors yet</h3>
            <p className="text-gray-400 mb-6">
              Start building your mentor network to guide your startups
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer" onClick={() => router.push(`/institution-dashboard/mentors/${mentor.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1">{mentor.user_name || 'Unnamed Mentor'}</h3>
                    <p className="text-sm text-gray-400">{mentor.occupation || mentor.title} {mentor.company && `at ${mentor.company}`}</p>
                    {mentor.user_email && <p className="text-xs text-gray-500 mt-1">{mentor.user_email}</p>}
                  </div>
                </div>

                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 3).map((exp, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 rounded">
                        {exp}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 rounded">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 border-t border-white/10 pt-4 mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/institution-dashboard/mentors/${mentor.id}`); }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
