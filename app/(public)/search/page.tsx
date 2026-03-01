'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Input, Button, Badge } from '@/components/ui';
import AppShell from '@/components/ui/AppShell';

interface SearchResult {
	id: string;
	type: 'startup' | 'institution' | 'mentor' | 'investor' | 'event';
	name: string;
	url: string;
	// Optional fields per type
	slug?: string;
	tagline?: string;
	logo?: string;
	avatar?: string;
	industry?: string;
	stage?: string;
	city?: string;
	country?: string;
	occupation?: string;
	expertise?: string[];
	firmName?: string;
	investorType?: string;
	description?: string;
	location?: string;
	startTime?: string;
	isVirtual?: boolean;
}

interface SearchData {
	startups?: SearchResult[];
	institutions?: SearchResult[];
	mentors?: SearchResult[];
	investors?: SearchResult[];
	events?: SearchResult[];
}

const TYPE_LABELS: Record<string, string> = {
	startup: 'Startups',
	institution: 'Institutions',
	mentor: 'Mentors',
	investor: 'Investors',
	event: 'Events',
};

const TYPE_COLORS: Record<string, string> = {
	startup: 'bg-blue-100 text-blue-700',
	institution: 'bg-purple-100 text-purple-700',
	mentor: 'bg-green-100 text-green-700',
	investor: 'bg-amber-100 text-amber-700',
	event: 'bg-rose-100 text-rose-700',
};

const TYPE_ICONS: Record<string, string> = {
	startup: '🚀',
	institution: '🏛️',
	mentor: '👨‍🏫',
	investor: '💰',
	event: '📅',
};

export default function SearchPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialQ = searchParams.get('q') || '';
	const [query, setQuery] = useState(initialQ);
	const [results, setResults] = useState<SearchData>({});
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [activeFilter, setActiveFilter] = useState<string>('');
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const doSearch = useCallback(async (q: string, type?: string) => {
		if (q.length < 2) {
			setResults({});
			setTotal(0);
			return;
		}
		setLoading(true);
		try {
			const params = new URLSearchParams({ q, limit: '20' });
			if (type) params.set('type', type);
			const res = await fetch(`/api/search/?${params}`);
			if (!res.ok) throw new Error('Search failed');
			const json = await res.json();
			setResults(json.data || {});
			setTotal(json.total || 0);
		} catch {
			setResults({});
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, []);

	// Run search on initial load if query param present
	useEffect(() => {
		if (initialQ.length >= 2) {
			doSearch(initialQ, activeFilter || undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleInputChange = (val: string) => {
		setQuery(val);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			// Update URL
			const url = val.length >= 2 ? `/search?q=${encodeURIComponent(val)}` : '/search';
			router.replace(url, { scroll: false });
			doSearch(val, activeFilter || undefined);
		}, 350);
	};

	const handleFilterClick = (type: string) => {
		const next = activeFilter === type ? '' : type;
		setActiveFilter(next);
		doSearch(query, next || undefined);
	};

	const allResults: SearchResult[] = Object.values(results).flat();

	const filteredResults = activeFilter
		? (results as Record<string, SearchResult[]>)[activeFilter + 's'] || []
		: allResults;

	return (
		<AppShell>
			<div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
				{/* Search Input */}
				<div>
					<h1 className="text-2xl font-bold text-(--primary) mb-4">Search</h1>
					<div className="relative">
						<svg
							className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-(--secondary)"
							fill="none" viewBox="0 0 24 24" stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							value={query}
							onChange={(e) => handleInputChange(e.target.value)}
							placeholder="Search startups, institutions, mentors, investors, events..."
							className="w-full pl-10 pr-4 py-3 rounded-xl border border-(--border) bg-(--surface) text-(--primary) placeholder:text-(--secondary) focus:outline-none focus:ring-2 focus:ring-accent text-sm"
							autoFocus
						/>
					</div>
				</div>

				{/* Filter Tabs */}
				{total > 0 && (
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => handleFilterClick('')}
							className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeFilter
								? 'bg-gray-900 text-white'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
								}`}
						>
							All ({total})
						</button>
						{Object.entries(results).map(([key, items]) => {
							if (!items || items.length === 0) return null;
							const typeKey = key.replace(/s$/, '');
							return (
								<button
									key={key}
									onClick={() => handleFilterClick(typeKey)}
									className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === typeKey
										? 'bg-gray-900 text-white'
										: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
										}`}
								>
									{TYPE_ICONS[typeKey]} {TYPE_LABELS[typeKey]} ({items.length})
								</button>
							);
						})}
					</div>
				)}

				{/* Results */}
				{loading && (
					<div className="space-y-3">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-20 bg-(--surface) rounded-xl border border-(--border) animate-pulse" />
						))}
					</div>
				)}

				{!loading && query.length >= 2 && total === 0 && (
					<Card className="p-8 text-center">
						<p className="text-4xl mb-3">🔍</p>
						<p className="text-(--primary) font-medium">No results found for &ldquo;{query}&rdquo;</p>
						<p className="text-(--secondary) text-sm mt-1">Try a different search term or check for typos.</p>
					</Card>
				)}

				{!loading && filteredResults.length > 0 && (
					<div className="space-y-3">
						{filteredResults.map((item) => (
							<Link key={`${item.type}-${item.id}`} href={item.url}>
								<Card className="p-4 hover:bg-(--surface-hover) transition-colors cursor-pointer">
									<div className="flex items-start gap-4">
										{/* Avatar / Logo */}
										<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
											{item.logo || item.avatar ? (
												<img
													src={item.logo || item.avatar}
													alt={item.name}
													className="w-12 h-12 rounded-lg object-cover"
												/>
											) : (
												TYPE_ICONS[item.type]
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h3 className="text-sm font-semibold text-(--primary) truncate">
													{item.name}
												</h3>
												<span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[item.type]}`}>
													{TYPE_LABELS[item.type]?.replace(/s$/, '')}
												</span>
											</div>

											{/* Subtitle */}
											<p className="text-xs text-(--secondary) mt-0.5 truncate">
												{item.tagline
													|| item.occupation
													|| item.firmName
													|| item.description
													|| [item.city, item.country].filter(Boolean).join(', ')
													|| ''}
											</p>

											{/* Extra metadata */}
											<div className="flex flex-wrap gap-1.5 mt-1.5">
												{item.industry && (
													<span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600">{item.industry}</span>
												)}
												{item.stage && (
													<span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600">{item.stage}</span>
												)}
												{item.investorType && (
													<span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600">{item.investorType}</span>
												)}
												{item.expertise?.slice(0, 3).map((e) => (
													<span key={e} className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600">{e}</span>
												))}
												{item.isVirtual && (
													<span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-600">Virtual</span>
												)}
												{item.startTime && (
													<span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600">
														{new Date(item.startTime).toLocaleDateString()}
													</span>
												)}
											</div>
										</div>

										{/* Arrow */}
										<svg className="w-4 h-4 text-(--secondary) flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</Card>
							</Link>
						))}
					</div>
				)}

				{!loading && query.length < 2 && (
					<div className="text-center py-12">
						<p className="text-4xl mb-3">🔍</p>
						<p className="text-(--secondary)">Type at least 2 characters to search</p>
					</div>
				)}
			</div>
		</AppShell>
	);
}
