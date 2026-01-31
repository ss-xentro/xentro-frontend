"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

export default function XplorerSignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/join'), 200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-xl mx-auto p-6 animate-fadeInUp">
      <Card className="p-6 space-y-4 text-center">
        <div>
          <h1 className="text-2xl font-semibold">We combined signups into one flow</h1>
          <p className="text-sm text-(--secondary)">Use the unified onboarding to verify email once and finish your profile when you want.</p>
        </div>
        <Button className="w-full min-h-[44px]" onClick={() => router.replace('/join')}>
          Go to unified onboarding
        </Button>
        <p className="text-sm text-(--secondary)">
          Already have an account?{' '}
          <Link href="/xplorer-login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
