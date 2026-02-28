'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface Startup {
  id: string;
  name: string;
  stage: string | null;
  location: string | null;
  oneLiner: string | null;
  ownerId: string;
  createdAt: Date;
}

export default function StartupsPage() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) {
        router.push('/institution-login');
        return;
      }

      const res = await fetch('/api/startups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load startups');
      }

      const data = await res.json();
      setStartups(data.data || []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this startup?')) {
      return;
    }

    setDeletingId(id);
    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required. Please log in again.');
      const res = await fetch(`/api/startups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to delete startup');
      }

      setStartups(startups.filter(s => s.id !== id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLinkStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail) return;

    setLinkLoading(true);
    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required. Please log in again.');
      const res = await fetch('/api/institution-startups/link/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: linkEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to link startup');

      alert('Startup linked successfully!');
      setIsLinking(false);
      setLinkEmail('');
      loadStartups(); // Reload list
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLinkLoading(false);
    }
  };

  const formatStage = (stage: string | null) => {
    if (!stage) return 'Not specified';
    return stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Startups</h1>
            <p className="text-gray-600 mt-1">Manage your portfolio startups</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLinking(!isLinking)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Plus Existing
            </button>
            <button
              onClick={() => router.push('/institution-dashboard/add-startup')}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </button>
          </div>
        </div>

        {isLinking && (
          <Card className="p-6 bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-2">Link an Existing Startup</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the primary founder's email address to link their startup to your institution.</p>
            <form onSubmit={handleLinkStartup} className="flex gap-3">
              <input
                type="email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="founder@example.com"
                className="flex-1 px-4 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={linkLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {linkLoading ? 'Linking...' : 'Link Startup'}
              </button>
            </form>
          </Card>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
            {error}
          </div>
        )}

        {startups.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No startups yet</h3>
            <p className="text-gray-600 mb-6">
              Start adding startups to your portfolio to showcase your impact
            </p>
            <button
              onClick={() => router.push('/institution-dashboard/add-startup')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Your First Startup
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <Card key={startup.id} className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/institution-dashboard/startups/${startup.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{startup.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {formatStage(startup.stage)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/institution-dashboard/startups/${startup.id}/edit`); }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(startup.id); }}
                      disabled={deletingId === startup.id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === startup.id ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {startup.location && (
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {startup.location}
                  </p>
                )}

                {startup.oneLiner && (
                  <p className="text-sm text-gray-600 line-clamp-3">{startup.oneLiner}</p>
                )}

                <div className="flex gap-2 border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/institution-dashboard/startups/${startup.id}`); }}
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
