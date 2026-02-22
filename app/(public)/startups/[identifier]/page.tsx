'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Startup, 
  StartupTeamMember,
  startupStageLabels, 
  startupStatusLabels, 
  fundingRoundLabels,
  sdgLabels,
  sectorLabels,
  SDGFocus,
  SectorFocus,
} from '@/lib/types';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

interface StartupWithDetails extends Startup {
  teamMembers?: StartupTeamMember[];
  owner?: { id: string; name: string; email: string } | null;
}

export default function StartupProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const router = useRouter();
  const [startup, setStartup] = useState<StartupWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'story' | 'team' | 'updates'>('story');

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
          setStartup(data.startup);
          // Update URL to use slug if accessed by ID
          if (data.startup?.slug && p.identifier !== data.startup.slug) {
            window.history.replaceState(null, '', `/startups/${data.startup.slug}`);
          }
        })
        .catch(() => router.push('/404'))
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-(--primary) mb-2">Startup not found</h1>
          <p className="text-(--secondary)">The startup you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const stageInfo = startup.stage ? startupStageLabels[startup.stage] : null;
  const statusInfo = startupStatusLabels[startup.status];
  const fundingInfo = startup.fundingRound ? fundingRoundLabels[startup.fundingRound] : null;
  
  const fundsRaised = startup.fundsRaised ? Number(startup.fundsRaised) : 0;
  const fundingGoal = startup.fundingGoal ? Number(startup.fundingGoal) : 0;
  const fundingProgress = fundingGoal > 0 ? Math.min((fundsRaised / fundingGoal) * 100, 100) : 0;

  return (
    <div className="animate-fadeIn">
      {/* Hero Section - Kickstarter Style */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-72 lg:h-80 bg-linear-to-br from-purple-600 via-violet-600 to-indigo-700 relative overflow-hidden">
          {startup.coverImage ? (
            <img 
              src={startup.coverImage} 
              alt={startup.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)'
              }}></div>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Floating Logo & Title */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
              {startup.logo ? (
                <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-purple-600">
                    {startup.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="flex-1 pt-4 md:pt-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-bold text-white">{startup.name}</h1>
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>
              
              {startup.tagline && (
                <p className="text-lg md:text-xl text-(--secondary) mb-4 max-w-2xl">
                  {startup.tagline}
                </p>
              )}

              <div className="flex flex-wrap gap-3 items-center">
                {stageInfo && (
                  <Badge variant="outline" className={stageInfo.color}>
                    {stageInfo.label}
                  </Badge>
                )}
                {fundingInfo && (
                  <Badge variant="info">
                    {fundingInfo.label}
                  </Badge>
                )}
                {startup.industry && (
                  <Badge variant="outline">{startup.industry}</Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 shrink-0 mt-4 md:mt-8">
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" className="gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </Button>
                </a>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Demo Video */}
            {startup.demoVideoUrl && (
              <section>
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  {startup.demoVideoUrl.includes('youtube') || startup.demoVideoUrl.includes('youtu.be') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(startup.demoVideoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : startup.demoVideoUrl.includes('vimeo') ? (
                    <iframe
                      src={getVimeoEmbedUrl(startup.demoVideoUrl)}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video src={startup.demoVideoUrl} controls className="w-full h-full" />
                  )}
                </div>
              </section>
            )}

            {/* Pitch */}
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
                <button
                  onClick={() => setActiveTab('story')}
                  className={cn(
                    'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
                    activeTab === 'story'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-(--secondary) hover:text-(--primary)'
                  )}
                >
                  Story
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={cn(
                    'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
                    activeTab === 'team'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-(--secondary) hover:text-(--primary)'
                  )}
                >
                  Team
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className={cn(
                    'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
                    activeTab === 'updates'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-(--secondary) hover:text-(--primary)'
                  )}
                >
                  Updates
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
              {activeTab === 'story' && (
                <div className="space-y-8">
                  {/* Description */}
                  <section>
                    <h2 className="text-xl font-bold text-(--primary) mb-4">About</h2>
                    <div className="prose prose-lg text-(--secondary) max-w-none">
                      {startup.description ? (
                        <p className="whitespace-pre-wrap">{startup.description}</p>
                      ) : (
                        <p className="italic">No description provided yet.</p>
                      )}
                    </div>
                  </section>

                  {/* Highlights */}
                  {startup.highlights && startup.highlights.length > 0 && (
                    <section>
                      <h2 className="text-xl font-bold text-(--primary) mb-4">Highlights</h2>
                      <div className="grid gap-3">
                        {startup.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-(--surface) rounded-lg border border-(--border)">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-(--primary)">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Media Features */}
                  {startup.mediaFeatures && startup.mediaFeatures.length > 0 && (
                    <section>
                      <h2 className="text-xl font-bold text-(--primary) mb-4">Featured In</h2>
                      <div className="grid gap-3">
                        {startup.mediaFeatures.map((feature, index) => (
                          <a
                            key={index}
                            href={feature.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-(--surface) rounded-lg border border-(--border) hover:border-accent transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-(--accent-light) flex items-center justify-center">
                              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-(--primary)">{feature.title}</p>
                              <p className="text-sm text-(--secondary)">{feature.source}</p>
                            </div>
                            <svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-(--primary)">Meet the Team</h2>
                  
                  {/* Owner */}
                  {startup.owner && (
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-purple-600">
                            {startup.owner.name?.charAt(0) || 'F'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-(--primary) text-lg">{startup.owner.name}</h3>
                          <p className="text-(--secondary)">Founder</p>
                        </div>
                        <Badge variant="info" className="ml-auto">Primary</Badge>
                      </div>
                    </Card>
                  )}

                  {/* Team Members */}
                  {startup.teamMembers && startup.teamMembers.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {startup.teamMembers.map((member) => (
                        <Card key={member.id} className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-600">
                                {member.user?.name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-(--primary)">{member.user?.name || 'Team Member'}</h4>
                              <p className="text-sm text-(--secondary)">{member.role}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : !startup.owner && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-(--primary) mb-2">Team info coming soon</h3>
                      <p className="text-(--secondary)">The team hasn&apos;t added members to their profile yet.</p>
                    </div>
                  )}

                  {/* Team Size */}
                  {startup.teamSize && (
                    <div className="flex items-center gap-2 text-(--secondary) mt-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{startup.teamSize} team members</span>
                      {startup.employeeCount && <span className="text-(--secondary)">({startup.employeeCount} employees)</span>}
                    </div>
                  )}
                </div>
              )}

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
          <div className="space-y-6">
            {/* Funding Progress - Kickstarter Style */}
            {fundingGoal > 0 && (
              <Card className="p-6">
                <div className="mb-4">
                  <p className="text-3xl font-bold text-(--primary)">
                    {formatCurrency(fundsRaised, startup.fundingCurrency || 'USD')}
                  </p>
                  <p className="text-(--secondary) text-sm">
                    raised of {formatCurrency(fundingGoal, startup.fundingCurrency || 'USD')} goal
                  </p>
                </div>
                
                <div className="w-full h-2 bg-(--surface-hover) rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${fundingProgress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-(--secondary)">
                  <span className="font-semibold text-(--primary)">{Math.round(fundingProgress)}%</span> funded
                </p>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold text-(--primary) mb-4">Quick Facts</h3>
              <div className="space-y-4">
                {startup.foundedDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-(--surface-hover) flex items-center justify-center">
                      <svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-(--secondary)">Founded</p>
                      <p className="font-medium text-(--primary)">{new Date(startup.foundedDate).getFullYear()}</p>
                    </div>
                  </div>
                )}

                {(startup.city || startup.country || startup.location) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-(--surface-hover) flex items-center justify-center">
                      <svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-(--secondary)">Location</p>
                      <p className="font-medium text-(--primary)">
                        {startup.city && startup.country 
                          ? `${startup.city}, ${startup.country}`
                          : startup.location || 'Remote'}
                      </p>
                    </div>
                  </div>
                )}

                {startup.profileViews !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-(--surface-hover) flex items-center justify-center">
                      <svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-(--secondary)">Profile Views</p>
                      <p className="font-medium text-(--primary)">{formatNumber(startup.profileViews)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Investors */}
            {startup.investors && startup.investors.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-(--primary) mb-4">Backed By</h3>
                <div className="flex flex-wrap gap-2">
                  {startup.investors.map((investor, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {investor}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Focus Areas */}
            <Card className="p-6">
              <h3 className="font-semibold text-(--primary) mb-4">Focus Areas</h3>
              
              {/* Sectors */}
              {startup.sectors && startup.sectors.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-(--secondary) mb-2">Sectors</p>
                  <div className="flex flex-wrap gap-2">
                    {startup.sectors.map((sector) => {
                      const info = sectorLabels[sector as SectorFocus];
                      return (
                        <Badge key={sector} variant="outline">
                          {info ? `${info.emoji} ${info.label}` : sector}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SDGs */}
              {startup.sdgFocus && startup.sdgFocus.length > 0 && (
                <div>
                  <p className="text-sm text-(--secondary) mb-2">UN SDG Alignment</p>
                  <div className="flex flex-wrap gap-2">
                    {startup.sdgFocus.map((sdg) => {
                      const info = sdgLabels[sdg as SDGFocus];
                      return info ? (
                        <span
                          key={sdg}
                          className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: info.color }}
                          title={info.fullName}
                        >
                          {info.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {(!startup.sectors || startup.sectors.length === 0) && (!startup.sdgFocus || startup.sdgFocus.length === 0) && (
                <p className="text-(--secondary) text-sm italic">No focus areas specified yet.</p>
              )}
            </Card>

            {/* Social Links - LinkedIn Style */}
            <Card className="p-6">
              <h3 className="font-semibold text-(--primary) mb-4">Connect</h3>
              <div className="space-y-3">
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="truncate">{startup.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {startup.linkedin && (
                  <a
                    href={startup.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-(--secondary) hover:text-[#0077B5] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                )}
                {startup.twitter && (
                  <a
                    href={startup.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-(--secondary) hover:text-[#1DA1F2] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Twitter / X</span>
                  </a>
                )}
                {startup.instagram && (
                  <a
                    href={startup.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-(--secondary) hover:text-[#E4405F] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                )}
                {startup.pitchDeckUrl && (
                  <a
                    href={startup.pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Pitch Deck</span>
                  </a>
                )}
              </div>
            </Card>

            {/* Contact */}
            {startup.primaryContactEmail && (
              <Card className="p-6">
                <h3 className="font-semibold text-(--primary) mb-4">Get in Touch</h3>
                <a
                  href={`mailto:${startup.primaryContactEmail}`}
                  className="inline-flex items-center gap-2 text-accent hover:underline"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Startup
                </a>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for video embeds
function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[7].length === 11 ? match[7] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}
