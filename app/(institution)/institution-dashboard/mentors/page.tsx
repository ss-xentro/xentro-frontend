'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface Mentor {
  id: string;
  user_name: string | null;
  user_email: string | null;
  title: string | null;
  company: string | null;
  occupation: string | null;
  expertise: string[];
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
      if (!res.ok) throw new Error('Failed to load institution data');
      const data = await res.json();
      setMentors(data.data || []);
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to respond');

      // Reload both lists
      setRespondingId(null);
      setResponseComment('');
      loadEndorsements();
      if (action === 'accepted') loadMentors();
    } catch (err) {
      alert((err as Error).message);
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mentors</h1>
            <p className="text-sm text-gray-600">Manage mentors associated with your institution.</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Pending Endorsement Requests</h2>
            {endorsementsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-gray-100 rounded-lg"></div>
                <div className="h-20 bg-gray-100 rounded-lg"></div>
              </div>
            ) : endorsements.length === 0 ? (
              <Card className="p-6 bg-gray-50 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">No pending endorsement requests.</p>
                <p className="text-xs text-gray-400 mt-1">Mentors and startups can request endorsement from your institution.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {endorsements.map((endorsement) => (
                  <Card key={endorsement.id} className="p-5 bg-white border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-700">
                            {endorsement.requesterName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{endorsement.requesterName}</h4>
                          <p className="text-xs text-gray-500">{endorsement.requesterEmail}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded capitalize">
                            {endorsement.entityType}
                          </span>
                          {endorsement.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{endorsement.message}&rdquo;</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(endorsement.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {respondingId === endorsement.id ? (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                        <label className="block text-xs font-medium text-gray-500">
                          Add a comment (optional)
                        </label>
                        <textarea
                          value={responseComment}
                          onChange={(e) => setResponseComment(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => setRespondingId(endorsement.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
            {error}
          </div>
        )}

        {mentors.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No mentors yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your mentor network to guide your startups
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/institution-dashboard/mentors/${mentor.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{mentor.user_name || 'Unnamed Mentor'}</h3>
                    <p className="text-sm text-gray-600">{mentor.occupation || mentor.title} {mentor.company && `at ${mentor.company}`}</p>
                    {mentor.user_email && <p className="text-xs text-gray-400 mt-1">{mentor.user_email}</p>}
                  </div>
                </div>

                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 3).map((exp, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {exp}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/institution-dashboard/mentors/${mentor.id}`); }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
