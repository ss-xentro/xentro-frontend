'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { StartupProfileNavbar } from '@/components/public/StartupProfileNavbar';
import {
  StartupProfileHero,
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
import { cn, hasValidPitchContent, hasValidPitchItem } from '@/lib/utils';
import { getAuthCookie, getSessionToken } from '@/lib/auth-utils';

type Tab = 'about' | 'team' | 'activity';

export default function StartupProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const router = useRouter();
  const [startup, setStartup] = useState<StartupWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestMessage, setInterestMessage] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      const headers: HeadersInit = { 'x-public-view': 'true' };
      const token = getSessionToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      fetch(`/api/startups/public/${p.identifier}`, {
        headers,
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--border) border-t-(--primary)"></div>
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
            <h1 className="text-xl font-semibold text-(--primary) mb-1">Startup not found</h1>
            <p className="text-sm text-(--secondary)">The startup you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </>
    );
  }

  // Pitch data
  const pitchAboutRaw = startup.pitchAbout;
  const pitchAbout = pitchAboutRaw ? {
    about: hasValidPitchContent(pitchAboutRaw.about) ? pitchAboutRaw.about : undefined,
    problemStatement: hasValidPitchContent(pitchAboutRaw.problemStatement) ? pitchAboutRaw.problemStatement : undefined,
    solutionProposed: hasValidPitchContent(pitchAboutRaw.solutionProposed) ? pitchAboutRaw.solutionProposed : undefined,
  } : undefined;

  const competitors = (startup.pitchCompetitors || []).filter(hasValidPitchItem);
  const customers = (startup.pitchCustomers || []).filter(hasValidPitchItem);
  const businessModels = (startup.pitchBusinessModels || []).filter(hasValidPitchItem);
  const marketSizes = (startup.pitchMarketSizes || []).filter(hasValidPitchItem);
  const visionStrategies = (startup.pitchVisionStrategies || []).filter(hasValidPitchItem);
  const impacts = (startup.pitchImpacts || []).filter(hasValidPitchItem);
  const certifications = (startup.pitchCertifications || []).filter(hasValidPitchItem);
  const hasPitchContent = (pitchAbout && (pitchAbout.about || pitchAbout.problemStatement || pitchAbout.solutionProposed)) || competitors.length > 0 || customers.length > 0 || businessModels.length > 0 || marketSizes.length > 0 || visionStrategies.length > 0 || impacts.length > 0 || certifications.length > 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'team', label: 'Team' },
    { key: 'activity', label: 'Activity' },
  ];

  const session = getAuthCookie();
  const canExpressInvestorInterest = Boolean(
    session && (session.role === 'investor' || session.contexts.includes('investor'))
  );

  const submitInvestorInterest = async () => {
    if (!startup) return;

    const token = getSessionToken('investor') || getSessionToken();
    if (!token) {
      setInterestMessage('Log in with an investor account to show interest.');
      return;
    }

    setInterestLoading(true);
    setInterestMessage(null);

    try {
      const res = await fetch(`/api/startups/${startup.slug || startup.id}/interest/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to register investor interest.');
      }

      setStartup((current) => current ? ({
        ...current,
        investorInterestRecorded: true,
        investorInterestCount: payload.investorInterestCount ?? current.investorInterestCount,
      }) : current);
      setInterestMessage(payload.alreadyRecorded ? 'Interest already recorded.' : 'Interest recorded successfully.');
    } catch (error) {
      setInterestMessage(error instanceof Error ? error.message : 'Failed to register investor interest.');
    } finally {
      setInterestLoading(false);
    }
  };

  // Restricted View handling
  if (startup.isRestricted) {
    return (
      <>
        <StartupProfileNavbar />
        <div className="animate-fadeIn min-h-screen bg-background pb-12">
          {/* Hero shows basic details like Name, Tagline, Location, Stage */}
          <StartupProfileHero startup={startup} />

          <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12">
            <div className="bg-(--surface) border border-(--border) rounded-xl p-8 text-center flex flex-col items-center shadow-xs">
              <div className="w-16 h-16 bg-(--surface-hover) rounded-full flex items-center justify-center mb-4 text-(--secondary)">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-(--primary) mb-2">Private Profile</h2>
              <p className="text-(--secondary) max-w-md mx-auto">
                This startup has chosen to keep their detailed profile information, pitch deck, and team details private.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StartupProfileNavbar />
      <div className="animate-fadeIn min-h-screen bg-background">
        {/* ... existing normal page ... */}
        {/* Hero */}
        <StartupProfileHero startup={startup} />

        {/* Tab bar */}
        <div className="border-b border-(--border) sticky top-0 bg-background z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-(--primary) text-(--primary)'
                    : 'border-transparent text-(--secondary) hover:text-(--primary)'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* ── About Tab ── */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Pitch quote */}
              {startup.pitch && (
                <section className="border-l-2 border-(--primary) pl-5">
                  <p className="text-lg sm:text-xl text-(--primary) leading-relaxed font-medium italic">
                    &ldquo;{startup.pitch}&rdquo;
                  </p>
                </section>
              )}

              {/* About / Problem / Solution */}
              <PitchAboutCards pitchAbout={pitchAbout} description={startup.description} />

              {/* Inline focus areas + investors */}
              <StartupSidebar startup={startup} />

              {/* Business Model & Market Size — side by side */}
              {(businessModels.length > 0 || marketSizes.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {businessModels.length > 0 && (
                    <PitchImageTextSection title="Business Model" items={businessModels} />
                  )}
                  {marketSizes.length > 0 && (
                    <PitchImageTextSection title="Market Size" items={marketSizes} />
                  )}
                </div>
              )}

              {/* Competitors */}
              <PitchCompetitors competitors={competitors} />

              {/* Empty state */}
              {!hasPitchContent && (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-(--surface-hover) mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-(--primary) mb-1">Profile info coming soon</p>
                  <p className="text-xs text-(--secondary)">The startup hasn&apos;t added details to their profile yet.</p>
                </div>
              )}

              {/* Contact footer */}
              {(startup.primaryContactEmail || canExpressInvestorInterest) && (
                <section className="pt-6 border-t border-(--border)">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-(--border) bg-(--surface) p-4">
                    <div>
                      <p className="text-sm font-medium text-(--primary)">Investor actions</p>
                      <p className="text-xs text-(--secondary) mt-1">
                        {startup.primaryContactEmail ? 'Reach out directly or register investor interest.' : 'Register investor interest to notify the startup team.'}
                      </p>
                      {interestMessage ? <p className="text-xs text-accent mt-2">{interestMessage}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {startup.primaryContactEmail ? (
                        <a href={`mailto:${startup.primaryContactEmail}`} className="text-sm text-(--primary) hover:underline">
                          {startup.primaryContactEmail}
                        </a>
                      ) : null}
                      {canExpressInvestorInterest ? (
                        <Button
                          type="button"
                          variant={startup.investorInterestRecorded ? 'secondary' : 'primary'}
                          size="sm"
                          isLoading={interestLoading}
                          disabled={interestLoading || startup.investorInterestRecorded}
                          onClick={submitInvestorInterest}
                        >
                          {startup.investorInterestRecorded ? 'Interest Registered' : 'Show Investor Interest'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── Team Tab ── */}
          {activeTab === 'team' && (
            <div className="animate-fadeIn">
              <TeamTabContent startup={startup} />
            </div>
          )}

          {/* ── Activity Tab ── */}
          {activeTab === 'activity' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Customers */}
              <PitchCustomers customers={customers} />

              {/* Vision & Strategy */}
              <PitchVisionStrategy items={visionStrategies} />

              {/* Impact & Certifications — side by side */}
              {(impacts.length > 0 || certifications.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {impacts.length > 0 && (
                    <PitchImageTextSection title="Impact" items={impacts} />
                  )}
                  {certifications.length > 0 && (
                    <PitchCertifications certifications={certifications} />
                  )}
                </div>
              )}

              {/* Empty state when nothing to show */}
              {customers.length === 0 && visionStrategies.length === 0 && impacts.length === 0 && certifications.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-(--surface-hover) mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-(--primary) mb-1">No activity yet</p>
                  <p className="text-xs text-(--secondary)">Check back later for updates from this startup.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
