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
  StartupAboutSidebar,
  type AboutSidebarSection,
} from '@/components/public/startup-profile';
import type { StartupWithDetails } from '@/components/public/startup-profile';
import { cn, hasValidPitchContent, hasValidPitchItem } from '@/lib/utils';
import { getAuthCookie, getSessionToken } from '@/lib/auth-utils';

type Tab = 'about' | 'reviews' | 'team' | 'activity';

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
  const customSections = (startup.pitchCustomSections || [])
    .map((section, index) => ({
      ...section,
      sectionId: `custom-section-${index}`,
      items: (section.items || []).filter(hasValidPitchItem),
    }))
    .filter((section) => section.items.length > 0);
  const hasPitchContent = (pitchAbout && (pitchAbout.about || pitchAbout.problemStatement || pitchAbout.solutionProposed)) || competitors.length > 0 || customers.length > 0 || businessModels.length > 0 || marketSizes.length > 0 || visionStrategies.length > 0 || impacts.length > 0 || certifications.length > 0 || customSections.length > 0;

  const hasPitchQuote = Boolean(startup.pitch);
  const hasAboutContent = Boolean(pitchAbout?.about || startup.description);
  const hasProblemContent = Boolean(pitchAbout?.problemStatement);
  const hasSolutionContent = Boolean(pitchAbout?.solutionProposed);
  const hasCustomers = customers.length > 0;
  const hasBusinessModels = businessModels.length > 0;
  const hasMarketSizes = marketSizes.length > 0;
  const hasCompetitors = competitors.length > 0;
  const hasVisionStrategies = visionStrategies.length > 0;
  const hasImpacts = impacts.length > 0;
  const hasCertifications = certifications.length > 0;

  const aboutSidebarSections: AboutSidebarSection[] = [
    hasPitchQuote ? { id: 'pitch-quote', label: 'Pitch' } : null,
    hasAboutContent ? { id: 'about', label: 'About' } : null,
    hasBusinessModels ? { id: 'business-model', label: 'Business Model' } : null,
    hasMarketSizes ? { id: 'market-size', label: 'Market Size' } : null,
    hasCompetitors ? { id: 'competitive-landscape', label: 'Competitive Landscape' } : null,
    hasVisionStrategies ? { id: 'vision-strategy', label: 'Vision & Strategy' } : null,
    hasImpacts ? { id: 'impact', label: 'Impact' } : null,
    hasCertifications ? { id: 'certifications', label: 'Certifications' } : null,
    ...customSections.map((section) => ({
      id: section.sectionId,
      label: section.title,
    })),
  ].filter((section): section is AboutSidebarSection => section !== null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'about', label: 'About' },
    ...(hasCustomers ? [{ key: 'reviews' as Tab, label: 'Reviews' }] : []),
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
            <div className="animate-fadeIn lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 items-start">
              <div className="hidden lg:block">
                <StartupAboutSidebar startup={startup} sections={aboutSidebarSections} />
              </div>

              <div className="space-y-8">
                <div className="lg:hidden">
                  <StartupAboutSidebar startup={startup} sections={aboutSidebarSections} />
                </div>

                {/* Pitch quote */}
                {hasPitchQuote && (
                  <section id="pitch-quote" className="scroll-mt-28 border-l-2 border-(--primary) pl-5">
                    <p className="text-lg sm:text-xl text-(--primary) leading-relaxed font-medium italic">
                      &ldquo;{startup.pitch}&rdquo;
                    </p>
                  </section>
                )}

                {(hasAboutContent || hasProblemContent || hasSolutionContent) && (
                  <section id="about" className="scroll-mt-28">
                    <PitchAboutCards pitchAbout={pitchAbout} description={startup.description} />
                  </section>
                )}

                {hasBusinessModels && (
                  <section id="business-model" className="scroll-mt-28">
                    <PitchImageTextSection title="Business Model" items={businessModels} />
                  </section>
                )}

                {hasMarketSizes && (
                  <section id="market-size" className="scroll-mt-28">
                    <PitchImageTextSection title="Market Size" items={marketSizes} />
                  </section>
                )}

                {hasCompetitors && (
                  <section id="competitive-landscape" className="scroll-mt-28">
                    <PitchCompetitors competitors={competitors} />
                  </section>
                )}

                {hasVisionStrategies && (
                  <section id="vision-strategy" className="scroll-mt-28">
                    <PitchVisionStrategy items={visionStrategies} />
                  </section>
                )}

                {hasImpacts && (
                  <section id="impact" className="scroll-mt-28">
                    <PitchImageTextSection title="Impact" items={impacts} />
                  </section>
                )}

                {hasCertifications && (
                  <section id="certifications" className="scroll-mt-28">
                    <PitchCertifications certifications={certifications} />
                  </section>
                )}

                {customSections.map((section) => (
                  <section key={section.sectionId} id={section.sectionId} className="scroll-mt-28">
                    <PitchImageTextSection title={section.title} items={section.items} />
                  </section>
                ))}

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
                {canExpressInvestorInterest && (
                  <section className="pt-6 border-t border-(--border)">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-(--border) bg-(--surface) p-4">
                      <div>
                        <p className="text-sm font-medium text-(--primary)">Investor actions</p>
                        <p className="text-xs text-(--secondary) mt-1">
                          Register investor interest to notify the startup team.
                        </p>
                        {interestMessage ? <p className="text-xs text-accent mt-2">{interestMessage}</p> : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
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

            </div>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === 'reviews' && (
            <div className="animate-fadeIn">
              {hasCustomers ? (
                <PitchCustomers customers={customers} />
              ) : (
                <section className="rounded-xl border border-(--border) bg-(--surface) p-6 sm:p-8 text-center">
                  <p className="text-sm font-medium text-(--primary) mb-1">No reviews yet</p>
                  <p className="text-xs text-(--secondary)">Customer testimonials will appear here once added by the startup.</p>
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
            <div className="animate-fadeIn">
              <section className="rounded-xl border border-(--border) bg-(--surface) p-6 sm:p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-(--surface-hover) mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-(--primary) mb-1">Startup activity feed is coming soon</p>
                <p className="text-xs text-(--secondary)">Posts created by this startup will appear here as soon as they publish to the feed.</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
