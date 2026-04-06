'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card } from '@/components/ui';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface AnalyticsData {
  profileViews: number;
  startupsCount: number;
  teamMembersCount: number;
  programsCount: number;
  institutionName: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const opts = { requestOptions: { role: 'institution' as const } };

  const { data: startupsRaw, isLoading: l1 } = useApiQuery<{ data: unknown[] }>(
    queryKeys.institution.startups(),
    '/api/startups',
    opts,
  );
  const { data: teamRaw, isLoading: l2 } = useApiQuery<{ data: unknown[] }>(
    queryKeys.institution.team(),
    '/api/institution-team',
    opts,
  );
  const { data: programsRaw, isLoading: l3 } = useApiQuery<unknown[]>(
    queryKeys.institution.programs(),
    '/api/programs',
    opts,
  );
  const { data: institutionRaw, isLoading: l4 } = useApiQuery<{ institution: { name?: string; profileViews?: number } | null }>(
    queryKeys.institution.profile(),
    '/api/auth/me/',
    opts,
  );

  const loading = l1 || l2 || l3 || l4;

  const data = useMemo((): AnalyticsData => ({
    profileViews: institutionRaw?.institution?.profileViews || 0,
    startupsCount: startupsRaw?.data?.length || 0,
    teamMembersCount: teamRaw?.data?.length || 0,
    programsCount: (programsRaw as unknown[] | undefined)?.length || 0,
    institutionName: institutionRaw?.institution?.name || 'Your Institution',
  }), [startupsRaw, teamRaw, programsRaw, institutionRaw]);

  if (loading) {
    return (
      <DashboardSidebar>
        <div className="p-8 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-(--border) rounded w-1/4"></div>
            <div className="h-4 bg-(--border) rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-(--border) rounded"></div>
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
          <p className="text-(--secondary) mt-1">View {data.institutionName}&apos;s performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Profile Views</p>
            <p className="text-3xl font-bold text-(--primary)">{data.profileViews.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">All time views</p>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Total Programs</p>
            <p className="text-3xl font-bold text-(--primary)">{data.programsCount}</p>
            <p className="text-xs text-(--secondary-light) mt-2">Active programs</p>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Portfolio Startups</p>
            <p className="text-3xl font-bold text-(--primary)">{data.startupsCount}</p>
            <p className="text-xs text-(--secondary-light) mt-2">In portfolio</p>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Team Members</p>
            <p className="text-3xl font-bold text-(--primary)">{data.teamMembersCount}</p>
            <p className="text-xs text-(--secondary-light) mt-2">Active members</p>
          </Card>
        </div>

        <Card className="p-8 bg-(--accent-subtle) border-(--border) border">
          <h3 className="font-bold text-lg text-(--primary) mb-4">Activity Overview</h3>
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
          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <h3 className="font-bold text-(--primary) mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/institution-dashboard/add-program')}
                className="w-full text-left px-4 py-3 rounded-lg bg-(--accent-light) hover:bg-(--accent-light) transition-colors"
              >
                <span className="font-medium text-(--primary)">Add Program</span>
                <p className="text-xs text-(--secondary)">Create a new program or cohort</p>
              </button>
              <button
                onClick={() => router.push('/institution-dashboard/add-startup')}
                className="w-full text-left px-4 py-3 rounded-lg bg-(--accent-light) hover:bg-(--accent-light) transition-colors"
              >
                <span className="font-medium text-(--primary)">Add Startup</span>
                <p className="text-xs text-(--secondary)">Add a startup to your portfolio</p>
              </button>
              <button
                onClick={() => router.push('/institution-dashboard/add-team')}
                className="w-full text-left px-4 py-3 rounded-lg bg-(--accent-light) hover:bg-(--accent-light) transition-colors"
              >
                <span className="font-medium text-(--primary)">Invite Team Member</span>
                <p className="text-xs text-(--secondary)">Add someone to manage your profile</p>
              </button>
            </div>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <h3 className="font-bold text-(--primary) mb-4">Profile Completion</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--primary-light)">Basic Info</span>
                <span className="text-green-600 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--primary-light)">Programs</span>
                <span className={data.programsCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.programsCount > 0 ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added</span> : 'Add programs'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--primary-light)">Startups</span>
                <span className={data.startupsCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.startupsCount > 0 ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added</span> : 'Add startups'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-(--primary-light)">Team Members</span>
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
