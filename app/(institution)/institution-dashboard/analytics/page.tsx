'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface AnalyticsData {
  profileViews: number;
  startupsCount: number;
  teamMembersCount: number;
  programsCount: number;
  institutionName: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    profileViews: 0,
    startupsCount: 0,
    teamMembersCount: 0,
    programsCount: 0,
    institutionName: '',
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) {
        router.push('/institution-login');
        return;
      }

      // Fetch all data in parallel
      const [startupsRes, teamRes, programsRes, institutionRes] = await Promise.all([
        fetch('/api/startups', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/institution-team', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/programs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/me/', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const startups = startupsRes.ok ? await startupsRes.json() : { data: [] };
      const team = teamRes.ok ? await teamRes.json() : { data: [] };
      const programs = programsRes.ok ? await programsRes.json() : { data: [] };
      const institution = institutionRes.ok ? await institutionRes.json() : { institution: null };

      setData({
        profileViews: institution.institution?.profileViews || 0,
        startupsCount: startups.data?.length || 0,
        teamMembersCount: team.data?.length || 0,
        programsCount: programs.data?.length || 0,
        institutionName: institution.institution?.name || 'Your Institution',
      });
      setError(null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardSidebar>
        <div className="p-8 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">View {data.institutionName}&apos;s performance metrics</p>
        </div>

        {error && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <p className="text-red-300 text-sm">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-white/5 border-white/10 border">
            <p className="text-sm text-gray-400 mb-1">Profile Views</p>
            <p className="text-3xl font-bold text-white">{data.profileViews.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">All time views</p>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 border">
            <p className="text-sm text-gray-400 mb-1">Total Programs</p>
            <p className="text-3xl font-bold text-white">{data.programsCount}</p>
            <p className="text-xs text-gray-500 mt-2">Active programs</p>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 border">
            <p className="text-sm text-gray-400 mb-1">Portfolio Startups</p>
            <p className="text-3xl font-bold text-white">{data.startupsCount}</p>
            <p className="text-xs text-gray-500 mt-2">In portfolio</p>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 border">
            <p className="text-sm text-gray-400 mb-1">Team Members</p>
            <p className="text-3xl font-bold text-white">{data.teamMembersCount}</p>
            <p className="text-xs text-gray-500 mt-2">Active members</p>
          </Card>
        </div>

        <Card className="p-8 bg-white/5 border-white/10 border">
          <h3 className="font-bold text-lg text-white mb-4">Activity Overview</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            {data.profileViews > 0 || data.startupsCount > 0 ? (
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Your institution is growing!</p>
                <p className="text-sm">Keep adding programs and startups to increase engagement.</p>
              </div>
            ) : (
              <p>Start by adding programs, startups, or team members to see activity here.</p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white/5 border-white/10 border">
            <h3 className="font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/institution-dashboard/add-program')}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span className="font-medium text-white">Add Program</span>
                <p className="text-xs text-gray-400">Create a new program or cohort</p>
              </button>
              <button
                onClick={() => router.push('/institution-dashboard/add-startup')}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span className="font-medium text-white">Add Startup</span>
                <p className="text-xs text-gray-400">Add a startup to your portfolio</p>
              </button>
              <button
                onClick={() => router.push('/institution-dashboard/add-team')}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                <span className="font-medium text-white">Invite Team Member</span>
                <p className="text-xs text-gray-400">Add someone to manage your profile</p>
              </button>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 border">
            <h3 className="font-bold text-white mb-4">Profile Completion</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Basic Info</span>
                <span className="text-green-600 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Programs</span>
                <span className={data.programsCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.programsCount > 0 ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added</span> : 'Add programs'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Startups</span>
                <span className={data.startupsCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.startupsCount > 0 ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added</span> : 'Add startups'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Team Members</span>
                <span className={data.teamMembersCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.teamMembersCount > 0 ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added</span> : 'Invite team'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardSidebar>
  );
}
