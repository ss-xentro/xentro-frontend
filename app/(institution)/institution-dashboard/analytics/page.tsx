'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card } from '@/components/ui';

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
      const token = localStorage.getItem('institution_token');
      if (!token) {
        router.push('/institution-login');
        return;
      }

      // Fetch all data in parallel
      const [startupsRes, teamRes, programsRes, institutionRes] = await Promise.all([
        fetch('/api/startups', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/institution-team', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/programs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/institution-auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
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
          <h1 className="text-3xl font-bold text-(--primary)">Analytics</h1>
          <p className="text-(--secondary) mt-1">View {data.institutionName}'s performance metrics</p>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Profile Views</p>
            <p className="text-3xl font-bold text-(--primary)">{data.profileViews.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">All time views</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Total Programs</p>
            <p className="text-3xl font-bold text-(--primary)">{data.programsCount}</p>
            <p className="text-xs text-(--secondary) mt-2">Active programs</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Portfolio Startups</p>
            <p className="text-3xl font-bold text-(--primary)">{data.startupsCount}</p>
            <p className="text-xs text-(--secondary) mt-2">In portfolio</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Team Members</p>
            <p className="text-3xl font-bold text-(--primary)">{data.teamMembersCount}</p>
            <p className="text-xs text-(--secondary) mt-2">Active members</p>
          </Card>
        </div>

        <Card className="p-8">
          <h3 className="font-bold text-lg mb-4">Activity Overview</h3>
          <div className="h-64 flex items-center justify-center text-(--secondary)">
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
          <Card className="p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/institution-dashboard/add-project')}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Add Program</span>
                <p className="text-xs text-(--secondary)">Create a new program or cohort</p>
              </button>
              <button 
                onClick={() => router.push('/institution-dashboard/add-startup')}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Add Startup</span>
                <p className="text-xs text-(--secondary)">Add a startup to your portfolio</p>
              </button>
              <button 
                onClick={() => router.push('/institution-dashboard/add-team')}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Invite Team Member</span>
                <p className="text-xs text-(--secondary)">Add someone to manage your profile</p>
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Profile Completion</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Basic Info</span>
                <span className="text-green-600">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Programs</span>
                <span className={data.programsCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.programsCount > 0 ? '✓ Added' : 'Add programs'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Startups</span>
                <span className={data.startupsCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.startupsCount > 0 ? '✓ Added' : 'Add startups'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Members</span>
                <span className={data.teamMembersCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.teamMembersCount > 0 ? '✓ Added' : 'Invite team'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardSidebar>
  );
}
