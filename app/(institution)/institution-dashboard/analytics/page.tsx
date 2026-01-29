'use client';

import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-(--primary)">Analytics</h1>
          <p className="text-(--secondary) mt-1">View your institution's performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Profile Views</p>
            <p className="text-3xl font-bold text-(--primary)">0</p>
            <p className="text-xs text-green-600 mt-2">+0% from last month</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Engagement Rate</p>
            <p className="text-3xl font-bold text-(--primary)">0%</p>
            <p className="text-xs text-(--secondary) mt-2">Average engagement</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Total Startups</p>
            <p className="text-3xl font-bold text-(--primary)">0</p>
            <p className="text-xs text-(--secondary) mt-2">In portfolio</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-(--secondary) mb-1">Team Members</p>
            <p className="text-3xl font-bold text-(--primary)">0</p>
            <p className="text-xs text-(--secondary) mt-2">Active members</p>
          </Card>
        </div>

        <Card className="p-8">
          <h3 className="font-bold text-lg mb-4">Activity Overview</h3>
          <div className="h-64 flex items-center justify-center text-(--secondary)">
            <p>Analytics data will appear here once you start adding content</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <p className="text-sm text-(--secondary) italic">No recent activity</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Top Performing Content</h3>
            <div className="space-y-3">
              <p className="text-sm text-(--secondary) italic">No content added yet</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardSidebar>
  );
}
