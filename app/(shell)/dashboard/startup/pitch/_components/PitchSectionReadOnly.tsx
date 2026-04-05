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

function MediaAndDescription({ imageUrl, description }: { imageUrl?: string | null; description?: string | null }) {
	return (
		<div className="space-y-3">
			{imageUrl ? (
				<MediaPreview src={imageUrl} alt="Section media" className="w-full aspect-video" mediaClassName="object-cover" />
			) : null}
			<RichTextDisplay html={description || ''} className="text-sm text-(--primary)" compact />
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
			<Card>
				<div className="aspect-video rounded-lg overflow-hidden">
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
			<div className="space-y-4">
				{aboutData.about ? (
					<Card>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">About</h3>
						<RichTextDisplay html={aboutData.about} compact />
					</Card>
				) : null}
				{aboutData.problemStatement ? (
					<Card>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">Problem Statement</h3>
						<RichTextDisplay html={aboutData.problemStatement} compact />
					</Card>
				) : null}
				{aboutData.solutionProposed ? (
					<Card>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">Proposed Solution</h3>
						<RichTextDisplay html={aboutData.solutionProposed} compact />
					</Card>
				) : null}
			</div>
		);
	}

	if (activeSection === 'competitors') {
		if (competitors.length === 0) return <EmptyContent text="No competitors added yet." />;

		return (
			<div className="space-y-4">
				{competitors.map((item, idx) => (
					<Card key={`${item.name}-${idx}`}>
						<div className="mb-2 flex items-center gap-3">
							{item.logo ? (
								<MediaPreview src={item.logo} alt={item.name || 'Competitor logo'} className="h-12 w-12 rounded-lg" mediaClassName="object-cover" />
							) : null}
							<div>
								<h3 className="text-sm font-semibold text-(--primary)">{item.name || `Competitor ${idx + 1}`}</h3>
								{item.website ? <p className="text-xs text-(--secondary)">{item.website}</p> : null}
							</div>
						</div>
						<RichTextDisplay html={item.description || ''} compact />
					</Card>
				))}
			</div>
		);
	}

	if (activeSection === 'customers') {
		if (customers.length === 0) return <EmptyContent text="No customer testimonials added yet." />;

		return (
			<div className="space-y-4">
				{customers.map((item, idx) => (
					<Card key={`${item.name}-${idx}`}>
						<div className="mb-2 flex items-center gap-3">
							{item.avatar ? (
								<MediaPreview src={item.avatar} alt={item.name || 'Customer avatar'} className="h-12 w-12 rounded-full" mediaClassName="object-cover" />
							) : null}
							<div>
								<h3 className="text-sm font-semibold text-(--primary)">{item.name || `Customer ${idx + 1}`}</h3>
								<p className="text-xs text-(--secondary)">{[item.role, item.company].filter(Boolean).join(' at ') || 'Customer'}</p>
							</div>
						</div>
						<RichTextDisplay html={item.testimonial} compact />
					</Card>
				))}
			</div>
		);
	}

	if (activeSection === 'businessModels') {
		if (businessModels.length === 0) return <EmptyContent text="No business model blocks added yet." />;

		return (
			<div className="space-y-4">
				{businessModels.map((item, idx) => (
					<Card key={`${item.title}-${idx}`}>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">{item.title || `Block ${idx + 1}`}</h3>
						<MediaAndDescription imageUrl={item.imageUrl} description={item.description} />
					</Card>
				))}
			</div>
		);
	}

	if (activeSection === 'marketSizes') {
		if (marketSizes.length === 0) return <EmptyContent text="No market size data added yet." />;

		return (
			<div className="space-y-4">
				{marketSizes.map((item, idx) => (
					<Card key={`${item.title}-${idx}`}>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">{item.title || `Data point ${idx + 1}`}</h3>
						<MediaAndDescription imageUrl={item.imageUrl} description={item.description} />
					</Card>
				))}
			</div>
		);
	}

	if (activeSection === 'visionStrategies') {
		if (visionStrategies.length === 0) return <EmptyContent text="No vision cards added yet." />;

		return (
			<div className="space-y-4">
				{visionStrategies.map((item, idx) => (
					<Card key={`${item.title}-${idx}`}>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">{item.title || `Vision ${idx + 1}`}</h3>
						<MediaAndDescription imageUrl={item.icon} description={item.description} />
					</Card>
				))}
			</div>
		);
	}

	if (activeSection === 'impacts') {
		if (impacts.length === 0) return <EmptyContent text="No impact blocks added yet." />;

		return (
			<div className="space-y-4">
				{impacts.map((item, idx) => (
					<Card key={`${item.title}-${idx}`}>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">{item.title || `Impact ${idx + 1}`}</h3>
						<MediaAndDescription imageUrl={item.imageUrl} description={item.description} />
					</Card>
				))}
			</div>
		);
	}

	if (activeSection === 'certifications') {
		if (certifications.length === 0) return <EmptyContent text="No certifications added yet." />;

		return (
			<div className="space-y-4">
				{certifications.map((item, idx) => (
					<Card key={`${item.title}-${idx}`}>
						<h3 className="text-sm font-semibold text-(--primary)">{item.title || `Certification ${idx + 1}`}</h3>
						<p className="mt-1 text-xs text-(--secondary)">
							{[item.issuer, item.dateAwarded].filter(Boolean).join(' • ') || 'Certification details'}
						</p>
						{item.imageUrl ? (
							<div className="mt-3">
								<MediaPreview src={item.imageUrl} alt={item.title || 'Certification image'} className="w-full aspect-4/3" mediaClassName="object-cover" />
							</div>
						) : null}
					</Card>
				))}
			</div>
		);
	}

	if (activeSection.startsWith('custom-')) {
		if (!activeCustomSection || !activeCustomSection.items || activeCustomSection.items.length === 0) {
			return <EmptyContent text="No items added in this custom step yet." />;
		}

		return (
			<div className="space-y-4">
				{activeCustomSection.items.map((item, idx) => (
					<Card key={`${item.title}-${idx}`}>
						<h3 className="mb-2 text-sm font-semibold text-(--primary)">{item.title || `Block ${idx + 1}`}</h3>
						<MediaAndDescription imageUrl={item.imageUrl} description={item.description} />
					</Card>
				))}
			</div>
		);
	}

	return <EmptyContent text="No content for this section yet." />;
}
