'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface Mentor {
  id: string;
  user: {
    name: string;
    email: string;
  };
  title: string | null;
  company: string | null;
  expertise: string[];
}

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    loadMentors();
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

  const handleLinkMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail) return;

    setLinkLoading(true);
    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required. Please log in again.');
      const res = await fetch('/api/institution-mentors/link/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: linkEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to link mentor');

      alert('Mentor linked successfully!');
      setShowLinkForm(false);
      setLinkEmail('');
      loadMentors(); // Reload list
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLinkLoading(false);
    }
  };

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
            <p className="text-sm text-gray-600">Manage and link mentors associated with your institution.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/institution-dashboard/add-mentor">
              <Button>
                New Mentor
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => setShowLinkForm(!showLinkForm)}
              className="flex items-center gap-2"
            >
              Plus Add Mentor
            </Button>
          </div>
        </div>

        {showLinkForm && (
          <Card className="p-6 bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-2">Link an Existing Mentor</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the mentor's registered email address to link them to your institution.</p>
            <form onSubmit={handleLinkMentor} className="flex gap-3">
              <input
                type="email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="mentor@example.com"
                className="flex-1 px-4 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={linkLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {linkLoading ? 'Linking...' : 'Link Mentor'}
              </button>
            </form>
          </Card>
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
              <Card key={mentor.id} className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{mentor.user?.name}</h3>
                    <p className="text-sm text-gray-600">{mentor.title} {mentor.company && `at ${mentor.company}`}</p>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
