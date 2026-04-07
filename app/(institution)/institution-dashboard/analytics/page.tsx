'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card } from '@/components/ui';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface AnalyticsData {
  profileViews: number;
  profileViews7d: number;
  profileViews30d: number;
  followersCount: number;
  startupsCount: number;
  teamCount: number;
  programsCount: number;
  institutionName: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const opts = { requestOptions: { role: 'institution' as const } };

  const { data: raw, isLoading } = useApiQuery<AnalyticsData>(
    queryKeys.institution.analytics(),
    '/api/auth/institution-analytics/',
    opts,
  );

  const data = useMemo((): AnalyticsData => ({
    profileViews: raw?.profileViews ?? 0,
    profileViews7d: raw?.profileViews7d ?? 0,
    profileViews30d: raw?.profileViews30d ?? 0,
    followersCount: raw?.followersCount ?? 0,
    startupsCount: raw?.startupsCount ?? 0,
    teamCount: raw?.teamCount ?? 0,
    programsCount: raw?.programsCount ?? 0,
    institutionName: raw?.institutionName ?? 'Your Institution',
  }), [raw]);

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="p-8 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-(--border) rounded w-1/4"></div>
            <div className="h-4 bg-(--border) rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Total Profile Views</p>
            <p className="text-3xl font-bold text-(--primary)">{data.profileViews.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">All-time unique visitors</p>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Profile Views (7 days)</p>
            <p className="text-3xl font-bold" style={{ color: '#0ea5e9' }}>{data.profileViews7d.toLocaleString()}</p>
            <p className="text-xs text-(--secondary-light) mt-2">Unique views this week</p>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Profile Views (30 days)</p>
            <p className="text-3xl font-bold" style={{ color: '#0ea5e9' }}>{data.profileViews30d.toLocaleString()}</p>
            <p className="text-xs text-(--secondary-light) mt-2">Unique views this month</p>
          </Card>

          <Card className="p-6 bg-(--accent-subtle) border-(--border) border">
            <p className="text-sm text-(--secondary) mb-1">Followers</p>
            <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>{data.followersCount.toLocaleString()}</p>
            <p className="text-xs text-(--secondary-light) mt-2">People following you</p>
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
            <p className="text-3xl font-bold text-(--primary)">{data.teamCount}</p>
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
                <span className={data.teamCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {data.teamCount > 0 ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added</span> : 'Invite team'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardSidebar>
  );
}
