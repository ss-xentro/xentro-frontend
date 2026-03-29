'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      window.location.href = '/login';
    } else {
      router.replace('/explore/institute');
    }
  }, [router, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-(--border) border-t-accent rounded-full animate-spin" />
    </div>
  );
}
