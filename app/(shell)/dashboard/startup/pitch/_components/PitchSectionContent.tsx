import React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const RichTextEditor = dynamic(
	() => import('@/components/ui/RichTextEditor').then(m => m.RichTextEditor ?? m.default),
	{ ssr: false, loading: () => <div className="h-32 bg-(--surface) rounded-lg animate-pulse" /> }
);
import { FileUpload } from '@/components/ui/FileUpload';
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
	PitchCustomSectionItem,
} from '@/lib/types';
import { EmptyState, ItemCard, PlusIcon } from './PitchHelpers';
import type { SectionKey } from './PitchHelpers';

interface PitchSectionContentProps {
	activeSection: SectionKey;
	canEdit: boolean;
	/* Video Pitch */
	demoVideoUrl: string | null;
	setDemoVideoUrl: (v: string | null) => void;
	/* About */
	aboutData: PitchAbout;
	setAboutData: React.Dispatch<React.SetStateAction<PitchAbout>>;
	/* Array sections */
	competitors: PitchCompetitor[];
	setCompetitors: React.Dispatch<React.SetStateAction<PitchCompetitor[]>>;
	customers: PitchCustomer[];
	setCustomers: React.Dispatch<React.SetStateAction<PitchCustomer[]>>;
	businessModels: PitchBusinessModelItem[];
	setBusinessModels: React.Dispatch<React.SetStateAction<PitchBusinessModelItem[]>>;
	marketSizes: PitchMarketSizeItem[];
	setMarketSizes: React.Dispatch<React.SetStateAction<PitchMarketSizeItem[]>>;
	visionStrategies: PitchVisionStrategyItem[];
	setVisionStrategies: React.Dispatch<React.SetStateAction<PitchVisionStrategyItem[]>>;
	impacts: PitchImpactItem[];
	setImpacts: React.Dispatch<React.SetStateAction<PitchImpactItem[]>>;
	certifications: PitchCertificationItem[];
	setCertifications: React.Dispatch<React.SetStateAction<PitchCertificationItem[]>>;
	activeCustomSection: PitchCustomSection | null;
	onChangeCustomSection: (updater: (section: PitchCustomSection) => PitchCustomSection) => void;
	/* Array helpers */
	addItem: <T>(setter: React.Dispatch<React.SetStateAction<T[]>>, template: T) => void;
	removeItem: <T>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number) => void;
	updateItem: <T>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, updates: Partial<T>) => void;
}

export default function PitchSectionContent(props: PitchSectionContentProps) {
	const {
		activeSection, canEdit,
		demoVideoUrl, setDemoVideoUrl,
		aboutData, setAboutData,
		competitors, setCompetitors,
		customers, setCustomers,
		businessModels, setBusinessModels,
		marketSizes, setMarketSizes,
		visionStrategies, setVisionStrategies,
		impacts, setImpacts,
		certifications, setCertifications,
		activeCustomSection,
		onChangeCustomSection,
		addItem, removeItem, updateItem,
	} = props;

	/* ─── Video Pitch ─── */
	if (activeSection === 'videoPitch') {
		const youTubeRegExp = /^.*((youtu\.be\/)|(v\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
		const youTubeMatch = demoVideoUrl ? demoVideoUrl.match(youTubeRegExp) : null;
		const youTubeEmbedId = youTubeMatch && youTubeMatch[6]?.length === 11 ? youTubeMatch[6] : null;
		const urlIsInvalid = !!demoVideoUrl && !youTubeEmbedId;

		return (
			<div className="space-y-5 animate-fadeInUp">
				<Card padding="none" className="overflow-hidden">
					<div className="px-6 py-4 bg-linear-to-r from-(--surface-hover) to-transparent border-b border-(--border)">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-(--primary)" />
							<span className="text-sm font-medium text-(--primary)">Video Pitch</span>
						</div>
						<p className="text-xs text-(--secondary) mt-0.5 ml-4">Paste a YouTube video URL to showcase your pitch.</p>
					</div>
					<div className="p-6 space-y-4">
						<Input
							label="YouTube Video URL"
							type="url"
							value={demoVideoUrl || ''}
							onChange={e => setDemoVideoUrl(e.target.value || null)}
							placeholder="https://www.youtube.com/watch?v=..."
							error={urlIsInvalid ? 'Please enter a valid YouTube video URL.' : undefined}
							disabled={!canEdit}
							icon={
								<svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
								</svg>
							}
						/>
						{youTubeEmbedId && (
							<div className="rounded-xl overflow-hidden border border-(--border) aspect-video">
								<iframe
									src={`https://www.youtube.com/embed/${youTubeEmbedId}?rel=0&modestbranding=1`}
									className="w-full h-full"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									title="Video pitch preview"
								/>
							</div>
						)}
						{demoVideoUrl && canEdit && (
							<button
								type="button"
								onClick={() => setDemoVideoUrl(null)}
								className="text-xs text-error hover:underline"
							>
								Remove video
							</button>
						)}
					</div>
				</Card>
			</div>
		);
	}

	/* ─── About / Problem / Solution ─── */
	if (activeSection === 'about') {
		return (
			<div className="space-y-5 animate-fadeInUp">
				<Card padding="none" className="overflow-hidden">
					<div className="px-6 py-4 bg-linear-to-r from-(--surface-hover) to-transparent border-b border-(--border)">
						<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-(--primary)" /><span className="text-sm font-medium text-(--primary)">About Your Startup</span></div>
						<p className="text-xs text-(--secondary) mt-0.5 ml-4">Give a concise overview of what your startup does.</p>
					</div>
					<div className="p-6"><RichTextEditor value={aboutData.about || ''} onChange={html => setAboutData({ ...aboutData, about: html })} placeholder="We are building..." disabled={!canEdit} /></div>
				</Card>
				<Card padding="none" className="overflow-hidden">
					<div className="px-6 py-4 bg-linear-to-r from-error/5 to-transparent border-b border-(--border)">
						<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-error" /><span className="text-sm font-medium text-(--primary)">Problem Statement</span></div>
						<p className="text-xs text-(--secondary) mt-0.5 ml-4">What pain point or gap in the market are you addressing?</p>
					</div>
					<div className="p-6"><RichTextEditor value={aboutData.problemStatement || ''} onChange={html => setAboutData({ ...aboutData, problemStatement: html })} placeholder="The core problem is..." disabled={!canEdit} /></div>
				</Card>
				<Card padding="none" className="overflow-hidden">
					<div className="px-6 py-4 bg-linear-to-r from-success/5 to-transparent border-b border-(--border)">
						<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-sm font-medium text-(--primary)">Proposed Solution</span></div>
						<p className="text-xs text-(--secondary) mt-0.5 ml-4">How does your product/service solve this problem uniquely?</p>
					</div>
					<div className="p-6"><RichTextEditor value={aboutData.solutionProposed || ''} onChange={html => setAboutData({ ...aboutData, solutionProposed: html })} placeholder="Our solution works by..." disabled={!canEdit} /></div>
				</Card>
			</div>
		);
	}

	/* ─── Generic title+description+image section renderer ─── */
	function renderTitleDescImageSection<T extends { title: string; description?: string | null; imageUrl?: string | null; icon?: string | null }>(
		items: T[],
		setter: React.Dispatch<React.SetStateAction<T[]>>,
		template: T,
		emptyIcon: React.ReactNode,
		emptyTitle: string,
		emptyDesc: string,
		addLabel: string,
		folder: string,
		titlePlaceholder: string,
		descPlaceholder: string,
		extraFields?: (item: T, idx: number) => React.ReactNode,
	) {
		if (items.length === 0) {
			return (
				<Card>
					<EmptyState
						icon={emptyIcon}
						title={emptyTitle}
						description={emptyDesc}
						action={canEdit ? (
							<Button variant="secondary" size="sm" onClick={() => addItem(setter, template)}>
								<PlusIcon /> <span className="ml-1.5">{addLabel}</span>
							</Button>
						) : undefined}
					/>
				</Card>
			);
		}
		return (
			<>
				{canEdit && (
					<div className="flex justify-end">
						<Button variant="secondary" size="sm" onClick={() => addItem(setter, template)}>
							<PlusIcon /> <span className="ml-1.5">{addLabel}</span>
						</Button>
					</div>
				)}
				{items.map((item, idx) => (
					<ItemCard key={idx} index={idx} onRemove={() => removeItem(setter, idx)} canEdit={canEdit}>
						<Input label="Title" value={item.title} onChange={e => updateItem(setter, idx, { title: e.target.value } as Partial<T>)} required placeholder={titlePlaceholder} />
						{extraFields?.(item, idx)}
						<div className="mt-4">
							<RichTextEditor label="Description" value={item.description || ''} onChange={html => updateItem(setter, idx, { description: html } as Partial<T>)} placeholder={descPlaceholder} minimal disabled={!canEdit} />
						</div>
						<div className="mt-4">
							<label className="block text-sm font-medium text-(--primary) mb-2">{item.icon !== undefined ? 'Icon image (optional)' : 'Image'}</label>
							<FileUpload value={(item.imageUrl || item.icon || '') as string} onChange={url => updateItem(setter, idx, (item.icon !== undefined ? { icon: url } : { imageUrl: url }) as Partial<T>)} folder={folder} accept="image/*" />
						</div>
					</ItemCard>
				))}
			</>
		);
	}

	/* ─── Generic array section renderer (custom item rendering) ─── */
	function renderArraySection<T>(
		items: T[],
		setter: React.Dispatch<React.SetStateAction<T[]>>,
		template: T,
		emptyIcon: React.ReactNode,
		emptyTitle: string,
		emptyDesc: string,
		addLabel: string,
		renderItem: (item: T, idx: number) => React.ReactNode,
	) {
		if (items.length === 0) {
			return (
				<Card>
					<EmptyState
						icon={emptyIcon}
						title={emptyTitle}
						description={emptyDesc}
						action={canEdit ? (
							<Button variant="secondary" size="sm" onClick={() => addItem(setter, template)}>
								<PlusIcon /> <span className="ml-1.5">Add First {addLabel.replace('Add ', '')}</span>
							</Button>
						) : undefined}
					/>
				</Card>
			);
		}
		return (
			<>
				{canEdit && (
					<div className="flex justify-end">
						<Button variant="secondary" size="sm" onClick={() => addItem(setter, template)}>
							<PlusIcon /> <span className="ml-1.5">{addLabel}</span>
						</Button>
					</div>
				)}
				{items.map((item, idx) => (
					<ItemCard key={idx} index={idx} onRemove={() => removeItem(setter, idx)} canEdit={canEdit}>
						{renderItem(item, idx)}
					</ItemCard>
				))}
			</>
		);
	}

	/* ─── Competitors ─── */
	if (activeSection === 'competitors') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderArraySection(
					competitors, setCompetitors,
					{ name: '', description: '', logo: '', website: '' } as PitchCompetitor,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
					'No competitors yet',
					'Map your competitive landscape to show investors you understand the market.',
					'Add Competitor',
					(comp, idx) => (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input label="Name" value={comp.name} onChange={e => updateItem(setCompetitors, idx, { name: e.target.value })} required placeholder="Competitor name" />
								<Input label="Website" value={comp.website || ''} onChange={e => updateItem(setCompetitors, idx, { website: e.target.value })} placeholder="https://..." />
							</div>
							<div className="mt-4">
								<RichTextEditor label="Description" value={comp.description || ''} onChange={html => updateItem(setCompetitors, idx, { description: html })} placeholder="What do they do? How are you different?" minimal disabled={!canEdit} />
							</div>
							<div className="mt-4">
								<label className="block text-sm font-medium text-(--primary) mb-2">Logo</label>
								<FileUpload value={comp.logo || ''} onChange={url => updateItem(setCompetitors, idx, { logo: url })} folder="pitch-competitors" accept="image/*" />
							</div>
						</>
					),
				)}
			</div>
		);
	}

	/* ─── Customers / Testimonials ─── */
	if (activeSection === 'customers') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderArraySection(
					customers, setCustomers,
					{ name: '', testimonial: '', role: '', company: '', avatar: '' } as PitchCustomer,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
					'No testimonials yet',
					'Social proof builds trust. Add testimonials from happy customers or early users.',
					'Add Testimonial',
					(cust, idx) => (
						<>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Input label="Name" value={cust.name} onChange={e => updateItem(setCustomers, idx, { name: e.target.value })} required placeholder="John Doe" />
								<Input label="Role" value={cust.role || ''} onChange={e => updateItem(setCustomers, idx, { role: e.target.value })} placeholder="CEO" />
								<Input label="Company" value={cust.company || ''} onChange={e => updateItem(setCustomers, idx, { company: e.target.value })} placeholder="Acme Inc." />
							</div>
							<div className="mt-4">
								<RichTextEditor label="Testimonial" value={cust.testimonial} onChange={html => updateItem(setCustomers, idx, { testimonial: html })} placeholder="What they said about your product..." minimal disabled={!canEdit} />
							</div>
							<div className="mt-4">
								<label className="block text-sm font-medium text-(--primary) mb-2">Avatar</label>
								<FileUpload value={cust.avatar || ''} onChange={url => updateItem(setCustomers, idx, { avatar: url })} folder="pitch-customers" accept="image/*" />
							</div>
						</>
					),
				)}
			</div>
		);
	}

	/* ─── Business Model ─── */
	if (activeSection === 'businessModels') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderTitleDescImageSection(
					businessModels, setBusinessModels,
					{ title: '', description: '', imageUrl: '' } as PitchBusinessModelItem,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
					'No business model yet', 'Explain how you make money and your path to profitability.',
					'Add Block', 'pitch-business-model', 'Revenue stream name', 'Describe this revenue stream...',
				)}
			</div>
		);
	}

	/* ─── Market Size ─── */
	if (activeSection === 'marketSizes') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderTitleDescImageSection(
					marketSizes, setMarketSizes,
					{ title: '', description: '', imageUrl: '' } as PitchMarketSizeItem,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
					'No market data yet', 'Define your Total Addressable Market, Serviceable Market, and target segments.',
					'Add Market Data', 'pitch-market-size', 'e.g., Total Addressable Market', 'Market size details and data sources...',
				)}
			</div>
		);
	}

	/* ─── Vision & Strategy ─── */
	if (activeSection === 'visionStrategies') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderTitleDescImageSection(
					visionStrategies, setVisionStrategies,
					{ title: '', description: '', icon: '' } as PitchVisionStrategyItem,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
					'No vision cards yet', 'Share your long-term vision and the strategy to get there.',
					'Add Vision Card', 'pitch-vision', 'Vision milestone', 'Describe this strategic goal...',
				)}
			</div>
		);
	}

	/* ─── Impact ─── */
	if (activeSection === 'impacts') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderTitleDescImageSection(
					impacts, setImpacts,
					{ title: '', description: '', imageUrl: '' } as PitchImpactItem,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
					'No impact data yet', 'Highlight your social, environmental, or economic impact and ESG alignment.',
					'Add Impact Block', 'pitch-impact', 'Impact area', 'Describe the impact...',
				)}
			</div>
		);
	}

	/* ─── Certifications ─── */
	if (activeSection === 'certifications') {
		return (
			<div className="space-y-4 animate-fadeInUp">
				{renderArraySection(
					certifications, setCertifications,
					{ title: '', issuer: '', dateAwarded: '', imageUrl: '' } as PitchCertificationItem,
					<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
					'No certifications yet',
					'Add awards, certifications, or standards your startup has earned.',
					'Add Certification',
					(item, idx) => (
						<>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Input label="Title" value={item.title} onChange={e => updateItem(setCertifications, idx, { title: e.target.value })} required placeholder="Certification name" />
								<Input label="Issuer" value={item.issuer || ''} onChange={e => updateItem(setCertifications, idx, { issuer: e.target.value })} placeholder="Issuing organization" />
								<Input label="Date Awarded" type="date" value={item.dateAwarded || ''} onChange={e => updateItem(setCertifications, idx, { dateAwarded: e.target.value })} />
							</div>
							<div className="mt-4">
								<label className="block text-sm font-medium text-(--primary) mb-2">Certificate Image</label>
								<FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setCertifications, idx, { imageUrl: url })} folder="pitch-certifications" accept="image/*" />
							</div>
						</>
					),
				)}
			</div>
		);
	}

	if (activeSection.startsWith('custom-') && activeCustomSection) {
		const customItems = activeCustomSection.items || [];
		const setCustomItems = (updater: (prev: PitchCustomSectionItem[]) => PitchCustomSectionItem[]) => {
			onChangeCustomSection((section) => ({
				...section,
				items: updater(section.items || []),
			}));
		};

		const addCustomItem = () => {
			setCustomItems((prev) => [...prev, { title: '', description: '', imageUrl: '' }]);
		};

		const removeCustomItem = (idx: number) => {
			setCustomItems((prev) => prev.filter((_, i) => i !== idx));
		};

		const updateCustomItem = (idx: number, updates: Partial<PitchCustomSectionItem>) => {
			setCustomItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...updates } : item)));
		};

		if (customItems.length === 0) {
			return (
				<Card>
					<EmptyState
						icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" /></svg>}
						title={`No items in ${activeCustomSection.title} yet`}
						description={activeCustomSection.shortDescription || 'Add items for this custom section.'}
						action={canEdit ? (
							<Button variant="secondary" size="sm" onClick={addCustomItem}>
								<PlusIcon /> <span className="ml-1.5">Add First Block</span>
							</Button>
						) : undefined}
					/>
				</Card>
			);
		}

		return (
			<div className="space-y-4 animate-fadeInUp">
				{canEdit && (
					<div className="flex justify-end">
						<Button variant="secondary" size="sm" onClick={addCustomItem}>
							<PlusIcon /> <span className="ml-1.5">Add Block</span>
						</Button>
					</div>
				)}
				{customItems.map((item, idx) => (
					<ItemCard key={idx} index={idx} onRemove={() => removeCustomItem(idx)} canEdit={canEdit}>
						<Input label="Title" value={item.title} onChange={e => updateCustomItem(idx, { title: e.target.value })} required placeholder="Block title" />
						<div className="mt-4">
							<RichTextEditor label="Description" value={item.description || ''} onChange={html => updateCustomItem(idx, { description: html })} placeholder="Describe this block..." minimal disabled={!canEdit} />
						</div>
						<div className="mt-4">
							<label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
							<FileUpload value={item.imageUrl || ''} onChange={url => updateCustomItem(idx, { imageUrl: url })} folder="pitch-custom-sections" accept="image/*" />
						</div>
					</ItemCard>
				))}
			</div>
		);
	}

	return null;
}
