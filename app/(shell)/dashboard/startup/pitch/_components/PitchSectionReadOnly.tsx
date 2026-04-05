import React from 'react';
import { Card } from '@/components/ui/Card';
import { MediaPreview } from '@/components/ui/MediaPreview';
import RichTextDisplay from '@/components/ui/RichTextDisplay';
import {
	PitchAbout,
	PitchCompetitor,
	PitchCustomer,
	PitchBusinessModelItem,
	PitchMarketSizeItem,
	PitchVisionStrategyItem,
	PitchImpactItem,
	PitchCertificationItem,
	PitchCustomSection,
} from '@/lib/types';
import type { SectionKey } from './PitchHelpers';

interface PitchSectionReadOnlyProps {
	activeSection: SectionKey;
	demoVideoUrl: string | null;
	aboutData: PitchAbout;
	competitors: PitchCompetitor[];
	customers: PitchCustomer[];
	businessModels: PitchBusinessModelItem[];
	marketSizes: PitchMarketSizeItem[];
	visionStrategies: PitchVisionStrategyItem[];
	impacts: PitchImpactItem[];
	certifications: PitchCertificationItem[];
	activeCustomSection: PitchCustomSection | null;
}

function EmptyContent({ text }: { text: string }) {
	return (
		<Card>
			<p className="text-sm text-(--secondary)">{text}</p>
		</Card>
	);
}

/** Card where image bleeds edge-to-edge at top, text content padded below */
function PitchItemCard({
	title,
	meta,
	imageUrl,
	children,
}: {
	title: string;
	meta?: React.ReactNode;
	imageUrl?: string | null;
	children?: React.ReactNode;
}) {
	return (
		<Card padding="none" className="overflow-hidden flex flex-col">
			{imageUrl && (
				<img src={imageUrl} alt={title} className="w-full h-auto" />
			)}
			<div className="flex-1 p-5 space-y-2">
				<h3 className="text-xl font-bold text-(--primary) leading-snug">{title}</h3>
				{meta && <div className="text-xs text-(--secondary)">{meta}</div>}
				{children && (
					<div className="text-sm text-(--secondary) leading-relaxed pt-1">
						{children}
					</div>
				)}
			</div>
		</Card>
	);
}

/** Two-column responsive grid for item lists */
function ItemGrid({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
			{children}
		</div>
	);
}

export default function PitchSectionReadOnly({
	activeSection,
	demoVideoUrl,
	aboutData,
	competitors,
	customers,
	businessModels,
	marketSizes,
	visionStrategies,
	impacts,
	certifications,
	activeCustomSection,
}: PitchSectionReadOnlyProps) {
	if (activeSection === 'videoPitch') {
		if (!demoVideoUrl) return <EmptyContent text="No video pitch added yet." />;

		const ytRegExp = /^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
		const ytMatch = demoVideoUrl.match(ytRegExp);
		const ytEmbedId = ytMatch && ytMatch[7]?.length === 11 ? ytMatch[7] : null;

		if (!ytEmbedId) return <EmptyContent text="Video pitch URL is not a valid YouTube link." />;

		return (
			<Card padding="none" className="overflow-hidden">
				<div className="aspect-video">
					<iframe
						src={`https://www.youtube.com/embed/${ytEmbedId}?rel=0&modestbranding=1`}
						className="w-full h-full"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						title="Video pitch"
					/>
				</div>
			</Card>
		);
	}

	if (activeSection === 'about') {
		const hasAny = aboutData.about || aboutData.problemStatement || aboutData.solutionProposed;
		if (!hasAny) return <EmptyContent text="No story details added yet." />;

		return (
			<div className="space-y-5">
				{aboutData.about ? (
					<Card padding="none" className="overflow-hidden">
						<div className="px-5 py-3 border-b border-(--border) bg-(--surface-hover)">
							<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary)">About</h3>
						</div>
						<div className="p-5 text-sm text-(--secondary) leading-relaxed">
							<RichTextDisplay html={aboutData.about} compact />
						</div>
					</Card>
				) : null}
				{aboutData.problemStatement ? (
					<Card padding="none" className="overflow-hidden">
						<div className="px-5 py-3 border-b border-(--border) bg-(--surface-hover)">
							<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary)">Problem Statement</h3>
						</div>
						<div className="p-5 text-sm text-(--secondary) leading-relaxed">
							<RichTextDisplay html={aboutData.problemStatement} compact />
						</div>
					</Card>
				) : null}
				{aboutData.solutionProposed ? (
					<Card padding="none" className="overflow-hidden">
						<div className="px-5 py-3 border-b border-(--border) bg-(--surface-hover)">
							<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary)">Proposed Solution</h3>
						</div>
						<div className="p-5 text-sm text-(--secondary) leading-relaxed">
							<RichTextDisplay html={aboutData.solutionProposed} compact />
						</div>
					</Card>
				) : null}
			</div>
		);
	}

	if (activeSection === 'competitors') {
		if (competitors.length === 0) return <EmptyContent text="No competitors added yet." />;

		return (
			<ItemGrid>
				{competitors.map((item, idx) => (
					<Card padding="none" key={`${item.name}-${idx}`} className="overflow-hidden flex flex-col">
						{item.logo && (
							<img src={item.logo} alt={item.name || 'Competitor logo'} className="w-full h-auto" />
						)}
						<div className="flex-1 p-5 space-y-1">
							<h3 className="text-xl font-bold text-(--primary) leading-snug">
								{item.name || `Competitor ${idx + 1}`}
							</h3>
							{item.website && (
								<p className="text-xs text-(--secondary)">{item.website}</p>
							)}
							{item.description && (
								<div className="text-sm text-(--secondary) leading-relaxed pt-1">
									<RichTextDisplay html={item.description} compact />
								</div>
							)}
						</div>
					</Card>
				))}
			</ItemGrid>
		);
	}

	if (activeSection === 'customers') {
		if (customers.length === 0) return <EmptyContent text="No customer testimonials added yet." />;

		return (
			<ItemGrid>
				{customers.map((item, idx) => (
					<Card padding="none" key={`${item.name}-${idx}`} className="overflow-hidden flex flex-col">
						{item.avatar && (
							<img src={item.avatar} alt={item.name || 'Customer avatar'} className="w-full h-auto" />
						)}
						<div className="flex-1 p-5 space-y-1">
							<h3 className="text-xl font-bold text-(--primary) leading-snug">
								{item.name || `Customer ${idx + 1}`}
							</h3>
							<p className="text-xs text-(--secondary)">
								{[item.role, item.company].filter(Boolean).join(' at ') || 'Customer'}
							</p>
							{item.testimonial && (
								<div className="text-sm text-(--secondary) leading-relaxed pt-1">
									<RichTextDisplay html={item.testimonial} compact />
								</div>
							)}
						</div>
					</Card>
				))}
			</ItemGrid>
		);
	}

	if (activeSection === 'businessModels') {
		if (businessModels.length === 0) return <EmptyContent text="No business model blocks added yet." />;
		return (
			<ItemGrid>
				{businessModels.map((item, idx) => (
					<PitchItemCard key={`${item.title}-${idx}`} title={item.title || `Block ${idx + 1}`} imageUrl={item.imageUrl}>
						{item.description && <RichTextDisplay html={item.description} compact />}
					</PitchItemCard>
				))}
			</ItemGrid>
		);
	}

	if (activeSection === 'marketSizes') {
		if (marketSizes.length === 0) return <EmptyContent text="No market size data added yet." />;
		return (
			<ItemGrid>
				{marketSizes.map((item, idx) => (
					<PitchItemCard key={`${item.title}-${idx}`} title={item.title || `Data point ${idx + 1}`} imageUrl={item.imageUrl}>
						{item.description && <RichTextDisplay html={item.description} compact />}
					</PitchItemCard>
				))}
			</ItemGrid>
		);
	}

	if (activeSection === 'visionStrategies') {
		if (visionStrategies.length === 0) return <EmptyContent text="No vision cards added yet." />;
		return (
			<ItemGrid>
				{visionStrategies.map((item, idx) => (
					<PitchItemCard key={`${item.title}-${idx}`} title={item.title || `Vision ${idx + 1}`} imageUrl={item.icon}>
						{item.description && <RichTextDisplay html={item.description} compact />}
					</PitchItemCard>
				))}
			</ItemGrid>
		);
	}

	if (activeSection === 'impacts') {
		if (impacts.length === 0) return <EmptyContent text="No impact blocks added yet." />;
		return (
			<ItemGrid>
				{impacts.map((item, idx) => (
					<PitchItemCard key={`${item.title}-${idx}`} title={item.title || `Impact ${idx + 1}`} imageUrl={item.imageUrl}>
						{item.description && <RichTextDisplay html={item.description} compact />}
					</PitchItemCard>
				))}
			</ItemGrid>
		);
	}

	if (activeSection === 'certifications') {
		if (certifications.length === 0) return <EmptyContent text="No certifications added yet." />;
		return (
			<ItemGrid>
				{certifications.map((item, idx) => (
					<Card padding="none" key={`${item.title}-${idx}`} className="overflow-hidden flex flex-col">
						<div className="flex-1 p-5 space-y-2">
							<h3 className="text-xl font-bold text-(--primary) leading-snug">
								{item.title || `Certification ${idx + 1}`}
							</h3>
							{(item.issuer || item.dateAwarded) && (
								<div className="text-xs text-(--secondary)">
									{[item.issuer, item.dateAwarded].filter(Boolean).join(' • ')}
								</div>
							)}
							{item.imageUrl && (
								<a
									href={item.imageUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 mt-1 px-3 py-2 rounded-lg border border-(--border) bg-(--surface-hover) text-sm text-accent hover:bg-(--accent-subtle) transition-colors"
								>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
										<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
									</svg>
									View Certificate
								</a>
							)}
						</div>
					</Card>
				))}
			</ItemGrid>
		);
	}

	if (activeSection.startsWith('custom-')) {
		if (!activeCustomSection || !activeCustomSection.items || activeCustomSection.items.length === 0) {
			return <EmptyContent text="No items added in this custom step yet." />;
		}
		return (
			<ItemGrid>
				{activeCustomSection.items.map((item, idx) => (
					<PitchItemCard key={`${item.title}-${idx}`} title={item.title || `Block ${idx + 1}`} imageUrl={item.imageUrl}>
						{item.description && <RichTextDisplay html={item.description} compact />}
					</PitchItemCard>
				))}
			</ItemGrid>
		);
	}

	return <EmptyContent text="No content for this section yet." />;
}
