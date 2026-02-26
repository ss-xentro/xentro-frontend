'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StartupProfileNavbar } from '@/components/public/StartupProfileNavbar';
import {
  StartupProfileHero,
  StartupDemoVideo,
  PitchAboutCards,
  PitchCompetitors,
  PitchCustomers,
  PitchImageTextSection,
  PitchVisionStrategy,
  PitchCertifications,
  TeamTabContent,
  StartupSidebar,
} from '@/components/public/startup-profile';
import type { StartupWithDetails } from '@/components/public/startup-profile';
import { cn } from '@/lib/utils';

export default function StartupProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const router = useRouter();
  const [startup, setStartup] = useState<StartupWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pitch' | 'team' | 'updates'>('pitch');

  useEffect(() => {
    params.then(p => {
      fetch(`/api/startups/public/${p.identifier}`, {
        headers: { 'x-public-view': 'true' },
      })
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(data => {
          const startupData = data.startup || data;
          setStartup(startupData);
          if (startupData?.slug && p.identifier !== startupData.slug) {
            window.history.replaceState(null, '', `/startups/${startupData.slug}`);
          }
        })
        .catch(() => router.push('/404'))
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  if (loading) {
    return (
      <>
        <StartupProfileNavbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </>
    );
  }

  if (!startup) {
    return (
      <>
        <StartupProfileNavbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-(--primary) mb-2">Startup not found</h1>
            <p className="text-(--secondary)">The startup you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </>
    );
  }

  // Pitch data
  const pitchAbout = startup.pitchAbout;
  const competitors = startup.pitchCompetitors || [];
  const customers = startup.pitchCustomers || [];
  const businessModels = startup.pitchBusinessModels || [];
  const marketSizes = startup.pitchMarketSizes || [];
  const visionStrategies = startup.pitchVisionStrategies || [];
  const impacts = startup.pitchImpacts || [];
  const certifications = startup.pitchCertifications || [];
  const hasPitchContent = pitchAbout || competitors.length > 0 || customers.length > 0 || businessModels.length > 0;

  return (
    <>
      <StartupProfileNavbar />
      <div className="animate-fadeIn">
        {/* Hero Section */}
        <StartupProfileHero startup={startup} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Demo Video */}
              {startup.demoVideoUrl && (
                <StartupDemoVideo demoVideoUrl={startup.demoVideoUrl} />
              )}

              {/* Pitch Quote */}
              {startup.pitch && (
                <section className="bg-(--surface) border border-(--border) rounded-xl p-6">
                  <p className="text-xl md:text-2xl font-medium text-(--primary) leading-relaxed">
                    &ldquo;{startup.pitch}&rdquo;
                  </p>
                </section>
              )}

              {/* Tab Navigation */}
              <div className="border-b border-(--border)">
                <div className="flex gap-1">
                  {(['pitch', 'team', 'updates'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-6 py-3 font-medium text-sm border-b-2 transition-colors capitalize',
                        activeTab === tab
                          ? 'border-accent text-accent'
                          : 'border-transparent text-(--secondary) hover:text-(--primary)'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="animate-fadeIn">
                {activeTab === 'pitch' && (
                  <div className="space-y-12">
                    <PitchAboutCards pitchAbout={pitchAbout} description={startup.description} />
                    <PitchCompetitors competitors={competitors} />
                    <PitchCustomers customers={customers} />
                    <PitchImageTextSection title="Business Model" items={businessModels} />
                    <PitchImageTextSection title="Market Size" items={marketSizes} />
                    <PitchVisionStrategy items={visionStrategies} />
                    <PitchImageTextSection title="Impact" items={impacts} />
                    <PitchCertifications certifications={certifications} />

                    {/* Empty state for pitch */}
                    {!hasPitchContent && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-(--primary) mb-2">Pitch deck coming soon</h3>
                        <p className="text-(--secondary)">The team hasn&apos;t added their pitch information yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'team' && <TeamTabContent startup={startup} />}

                {activeTab === 'updates' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-(--primary) mb-2">No updates yet</h3>
                    <p className="text-(--secondary)">Check back later for the latest news from this startup.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <StartupSidebar startup={startup} />
          </div>
        </div>
      </div>
    </>
  );
}
