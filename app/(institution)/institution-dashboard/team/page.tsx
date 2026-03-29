'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button, Badge } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  role: 'admin' | 'manager' | 'ambassador' | 'viewer';
  createdAt: string;
  managerApproved: boolean;
  adminApproved: boolean;
  userName?: string;
  userEmail?: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200',
  manager: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200',
  ambassador: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-200',
  viewer: 'bg-(--accent-light) text-(--primary-light)',
};

export default function TeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const token = getSessionToken('institution');
      if (!token) {
        router.push('/institution-login');
        return;
      }

      const res = await fetch('/api/institution-team/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, 'Failed to load team'));
      }

      const data = await res.json();
      setTeam(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const token = getSessionToken('institution');
      if (!token) throw new Error('Authentication required. Please log in again.');
      const res = await fetch(`/api/institution-team/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, 'Failed to remove team member'));
      }

      setTeam((prev) => prev.filter(m => m.id !== id));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading) {
    return (
      <DashboardSidebar>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-(--border) rounded w-1/4"></div>
            <div className="h-4 bg-(--border) rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map(i => (
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-(--primary)">Team Members</h1>
            <p className="text-(--secondary) mt-1">Manage your institution team</p>
          </div>
          <Button onClick={() => router.push('/institution-dashboard/add-team')}>
            Add Team Member
          </Button>
        </div>

        {team.length === 0 ? (
          <Card className="p-12 text-center bg-(--accent-subtle) border-(--border)">
            <div className="w-16 h-16 rounded-full bg-(--accent-light) mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No team members yet</h3>
            <p className="text-(--secondary) mb-4">
              Add team members to help manage your institution
            </p>
            <Button onClick={() => router.push('/institution-dashboard/add-team')}>
              Add Your First Team Member
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <Link key={member.id} href={`/institution-dashboard/team/${member.id}`} className="block">
                <Card className="p-6 bg-(--accent-subtle) border-(--border) hover:border-(--border-hover) transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-xl font-bold text-violet-700 dark:text-violet-300">
                        {member.userName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-(--primary)">{member.userName || 'Unknown'}</h3>
                        <p className="text-sm text-(--secondary)">{member.userEmail || ''}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                  </div>

                  <div className="text-xs text-(--secondary) mb-4">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 border-t border-(--border) pt-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/institution-dashboard/team/${member.id}`)}
                    >
                      View Details
                    </Button>
                    {member.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10"
                        onClick={(e: React.MouseEvent) => { e.preventDefault(); handleRemove(member.id); }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
