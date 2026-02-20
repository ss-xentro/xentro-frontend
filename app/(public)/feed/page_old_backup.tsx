'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';

interface FeedItem {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  sectors: string[];
  stages: string[];
  creatorName: string | null;
  creatorLogo: string | null;
  creatorType: string | null;
  viewCount: number;
  appreciationCount: number;
  mentorTipCount: number;
  createdAt: string;
}

const SECTORS = [
  { value: 'ai', label: 'AI & ML', emoji: '🤖' },
  { value: 'healthtech', label: 'HealthTech', emoji: '⚕️' },
  { value: 'edtech', label: 'EdTech', emoji: '📚' },
  { value: 'climatetech', label: 'ClimateTech', emoji: '🌿' },
  { value: 'fintech', label: 'FinTech', emoji: '💳' },
  { value: 'saas', label: 'SaaS', emoji: '☁️' },
  { value: 'social-impact', label: 'Social Impact', emoji: '❤️' },
];

const STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'mvp', label: 'MVP' },
  { value: 'early_traction', label: 'Early Traction' },
  { value: 'growth', label: 'Growth' },
  { value: 'scale', label: 'Scale' },
];

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'trending' | 'latest'>('trending');
  const [appreciating, setAppreciating] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSectors.length > 0) {
        params.set('sectors', selectedSectors.join(','));
      }
      if (selectedStages.length > 0) {
        params.set('stages', selectedStages.join(','));
      }
      params.set('sortBy', sortBy);
      params.set('limit', '20');

      const res = await fetch(`/api/feed?${params}`);
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [selectedSectors, selectedStages, sortBy]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const handleAppreciate = async (itemId: string) => {
    const token = localStorage.getItem('xentro_token');
    if (!token) {
      // Redirect to login or show message
      alert('Please login to appreciate');
      return;
    }

    setAppreciating(itemId);
    try {
      const res = await fetch(`/api/feed/${itemId}/appreciate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to appreciate');
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, appreciationCount: item.appreciationCount + 1 }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setAppreciating(null);
    }
  };

  const getSourceLink = (item: FeedItem) => {
    switch (item.sourceType) {
      case 'startup':
        return `/startups/${item.sourceId}`;
      case 'institution':
        return `/institutions/${item.sourceId}`;
      case 'event':
        return `/events/${item.sourceId}`;
      default:
        return '#';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Sort */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Sort by</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('trending')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      sortBy === 'trending'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    🔥 Trending
                  </button>
                  <button
                    onClick={() => setSortBy('latest')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      sortBy === 'latest'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    🕐 Latest
                  </button>
                </div>
              </div>

              {/* Sectors */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector.value}
                      onClick={() => toggleSector(sector.value)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs transition-colors',
                        selectedSectors.includes(sector.value)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {sector.emoji} {sector.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stages */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage.value}
                      onClick={() => toggleStage(stage.value)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs transition-colors',
                        selectedStages.includes(stage.value)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedSectors.length > 0 || selectedStages.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedSectors([]);
                    setSelectedStages([]);
                  }}
                  className="text-sm text-gray-900 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </Card>
          </aside>

          {/* Feed Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
              <span className="text-sm text-gray-600">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {loading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-error mb-4">{error}</p>
                <Button onClick={fetchFeed}>Try Again</Button>
              </Card>
            ) : items.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or check back later for new content.
                </p>
                {(selectedSectors.length > 0 || selectedStages.length > 0) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedSectors([]);
                      setSelectedStages([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-6">
                {items.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link href={getSourceLink(item)} className="shrink-0">
                        {item.imageUrl || item.creatorLogo ? (
                          <img
                            src={item.imageUrl || item.creatorLogo || ''}
                            alt={item.title}
                            className="w-24 h-24 rounded-lg object-cover bg-gray-50"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-linear-to-br from-gray-900/20 to-gray-900/5 flex items-center justify-center text-2xl">
                            {item.sourceType === 'startup' ? '🚀' : item.sourceType === 'event' ? '📅' : '🏛️'}
                          </div>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={getSourceLink(item)}>
                              <h3 className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
                                {item.title}
                              </h3>
                            </Link>
                            {item.creatorName && (
                              <p className="text-sm text-gray-600">by {item.creatorName}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {item.sourceType}
                          </Badge>
                        </div>

                        {item.summary && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.summary}</p>
                        )}

                        {/* Tags */}
                        {item.sectors && item.sectors.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {item.sectors.slice(0, 3).map((sector) => {
                              const sectorInfo = SECTORS.find((s) => s.value === sector);
                              return (
                                <span
                                  key={sector}
                                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded"
                                >
                                  {sectorInfo?.emoji} {sectorInfo?.label || sector}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {formatNumber(item.viewCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {formatNumber(item.appreciationCount)}
                            </span>
                            {item.mentorTipCount > 0 && (
                              <span className="flex items-center gap-1">
                                💡 {formatNumber(item.mentorTipCount)} tips
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAppreciate(item.id)}
                            disabled={appreciating === item.id}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                              'bg-gray-50 hover:bg-gray-900 hover:text-white',
                              appreciating === item.id && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <span>❤️</span>
                            <span>Appreciate</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
