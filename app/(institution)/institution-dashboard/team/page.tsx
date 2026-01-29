'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';

export default function TeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Implement API call to fetch team members
  }, []);

  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-(--primary)">Team Members</h1>
            <p className="text-(--secondary) mt-1">Manage your institution team</p>
          </div>
          <Button onClick={() => router.push('/institution-dashboard/add-team')}>
            <span className="mr-2">➕</span>
            Add Team Member
          </Button>
        </div>

        {team.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No team members yet</h3>
            <p className="text-(--secondary) mb-4">
              Add team members to showcase your institution's expertise
            </p>
            <Button onClick={() => router.push('/institution-dashboard/add-team')}>Add Your First Team Member</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <Card key={member.id} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-(--surface-hover) flex items-center justify-center text-xl font-bold">
                    {member.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-(--secondary)">{member.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
