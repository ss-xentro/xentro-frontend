"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@/components/ui';

interface UserShape {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  unlockedContexts?: string[];
}

interface JoinStateShape {
  name: string;
  email: string;
  dob: string;
  interests: string[];
  purpose: 'startup' | 'mentor' | 'institution' | null;
  verified: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserShape | null>(null);
  const [joinState, setJoinState] = useState<JoinStateShape | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('xentro_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (_err) {
      setUser(null);
    }

    try {
      const storedJoin = localStorage.getItem('xentro_join_state_v2');
      if (storedJoin) setJoinState(JSON.parse(storedJoin));
    } catch (_err) {
      setJoinState(null);
    }
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-(--surface) via-white to-(--surface-hover) text-(--primary)">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-(--secondary)">Profile</p>
            <h1 className="text-3xl font-bold">Your XENTRO account</h1>
          </div>
          <Link href="/join">
            <Button variant="secondary" className="min-h-[44px]">Resume onboarding</Button>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Account</h2>
                <p className="text-sm text-(--secondary)">Basics we know about you.</p>
              </div>
              {joinState?.verified && <Badge className="bg-green-100 text-green-700">Verified</Badge>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border border-(--border) bg-white/60">
                <p className="text-(--secondary)">Name</p>
                <p className="font-medium">{joinState?.name || user?.name || '—'}</p>
              </div>
              <div className="p-3 rounded-lg border border-(--border) bg-white/60">
                <p className="text-(--secondary)">Email</p>
                <p className="font-medium">{joinState?.email || user?.email || '—'}</p>
              </div>
              <div className="p-3 rounded-lg border border-(--border) bg-white/60">
                <p className="text-(--secondary)">Date of birth</p>
                <p className="font-medium">{joinState?.dob || 'Not provided yet'}</p>
              </div>
              <div className="p-3 rounded-lg border border-(--border) bg-white/60">
                <p className="text-(--secondary)">Contexts</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(user?.unlockedContexts || ['explorer']).map((ctx) => (
                    <Badge key={ctx} variant="outline">{ctx}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-(--border) bg-white/60 text-sm">
              <p className="text-(--secondary) mb-2">Interests</p>
              {joinState?.interests?.length ? (
                <div className="flex flex-wrap gap-2">
                  {joinState.interests.map((interest) => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-(--secondary)">No interests selected yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h2 className="text-lg font-semibold">Dashboards & onboarding</h2>
            <div className="flex flex-col gap-2">
              <Link href="/feed"><Button className="w-full min-h-[44px]" variant="secondary">Explore Feed</Button></Link>
              <Link href="/dashboard"><Button className="w-full min-h-[44px]" variant="ghost">Founder Dashboard</Button></Link>
              <Link href="/institution-dashboard"><Button className="w-full min-h-[44px]" variant="ghost">Institution Dashboard</Button></Link>
              <Link href="/onboarding/startup"><Button className="w-full min-h-[44px]" variant="ghost">Startup Onboarding</Button></Link>
              <Link href="/mentor-signup"><Button className="w-full min-h-[44px]" variant="ghost">Mentor Onboarding</Button></Link>
              <Link href="/institution-onboarding"><Button className="w-full min-h-[44px]" variant="ghost">Institution Onboarding</Button></Link>
              <Link href="/notifications"><Button className="w-full min-h-[44px]" variant="ghost">Notifications</Button></Link>
            </div>
            <div className="rounded-md bg-(--surface) border border-(--border) p-3 text-xs text-(--secondary)">
              Finish onboarding anytime. Your progress is saved locally after verification.
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
