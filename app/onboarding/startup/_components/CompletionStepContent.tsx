'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { FoundersSection } from '@/components/onboarding/startup/FoundersSection';
import { SectorCategory } from '@/lib/types';
import { SectorPicker } from './SectorPicker';
import { StagePicker } from './StagePicker';
import { WhyXentroStep } from './WhyXentroStep';

interface CompletionStepContentProps {
	currentStep: number;
	data: {
		name: string;
		tagline: string;
		logo: string | null;
		sectors: string[];
		stage: string;
		whyXentro: string[];
		whyXentroOther: string;
	};
	updateData: (updates: Record<string, unknown>) => void;
	toggleWhyXentro: (value: string) => void;
}

export function CompletionStepContent({ currentStep, data, updateData, toggleWhyXentro }: CompletionStepContentProps) {
	const [expandedCategory, setExpandedCategory] = useState<SectorCategory | null>(null);

	if (currentStep === 1) {
		return (
			<div className="p-6 md:p-8 space-y-7 md:space-y-8 animate-fadeIn">
				<div className="rounded-2xl border border-slate-300 bg-white p-5 md:p-6">
					<div className="grid grid-cols-1 lg:grid-cols-7 gap-5 md:gap-6 items-start">
						<div className="lg:col-span-4">
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Chapter 01 · Identity</p>
							<h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2 text-slate-900">Tell us about your startup</h2>
							<p className="text-sm md:text-base text-slate-700 mt-2 leading-relaxed">Start with the fundamentals. You can refine details later.</p>
						</div>

						<div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Required</p>
								<p className="text-xs mt-1 text-slate-900">Name, tagline, logo</p>
							</div>
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Outcome</p>
								<p className="text-xs mt-1 text-slate-900">Public brand identity</p>
							</div>
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Tip</p>
								<p className="text-xs mt-1 text-slate-900">Keep tagline under 12 words</p>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
					<div className="rounded-2xl border border-(--border) bg-white p-4 md:p-5 space-y-4">
						<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Part A</p>
						<Input
							label="Startup Name"
							placeholder="e.g. Acme Technologies"
							value={data.name}
							onChange={e => updateData({ name: e.target.value })}
							autoFocus
							required
						/>
						<Input
							label="Tagline"
							placeholder="A short line describing what you do"
							value={data.tagline}
							onChange={e => updateData({ tagline: e.target.value })}
						/>
					</div>

					<div className="rounded-2xl border border-(--border) bg-white p-4 md:p-5 space-y-3">
						<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary)">Part B</p>
						<div>
							<label className="block text-sm font-medium text-(--primary) mb-2">Logo</label>
							<FileUpload
								value={data.logo}
								onChange={url => updateData({ logo: url })}
								folder="startup-logos"
								accept="image/*"
								enableCrop
								aspectRatio={1}
							/>
							<p className="text-xs text-(--secondary) mt-1.5">Square image recommended (512x512 or larger)</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (currentStep === 2) {
		return (
			<div className="p-6 md:p-8 space-y-7 md:space-y-8 animate-fadeIn">
				<div className="rounded-2xl border border-slate-300 bg-white p-5 md:p-6">
					<div className="grid grid-cols-1 lg:grid-cols-7 gap-5 md:gap-6 items-start">
						<div className="lg:col-span-4">
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Chapter 02 · Team Story</p>
							<h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2 text-slate-900">Build trust through people</h2>
							<p className="text-sm md:text-base text-slate-700 mt-2 leading-relaxed">
								Add your primary founder first, then include co-founders and team members you want visible on your public startup page.
							</p>
						</div>

						<div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Required</p>
								<p className="text-xs mt-1 text-slate-900">Primary founder name</p>
							</div>
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Optional</p>
								<p className="text-xs mt-1 text-slate-900">Co-founders and team</p>
							</div>
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Visible</p>
								<p className="text-xs mt-1 text-slate-900">Displayed on public profile</p>
							</div>
						</div>
					</div>
				</div>
				<FoundersSection />
			</div>
		);
	}

	if (currentStep === 3) {
		return (
			<div className="p-6 md:p-8 space-y-7 md:space-y-8 animate-fadeIn">
				<div className="rounded-2xl border border-slate-300 bg-white p-5 md:p-6">
					<div className="grid grid-cols-1 lg:grid-cols-7 gap-5 md:gap-6 items-start">
						<div className="lg:col-span-4">
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Chapter 03 · Market Position</p>
							<h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2 text-slate-900">Define your industry and stage</h2>
							<p className="text-sm md:text-base text-slate-700 mt-2 leading-relaxed">Choose the market category that best fits your startup and where you currently are in execution.</p>
						</div>

						<div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Required</p>
								<p className="text-xs mt-1 text-slate-900">One sector and one stage</p>
							</div>
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Used For</p>
								<p className="text-xs mt-1 text-slate-900">Discovery and matching</p>
							</div>
							<div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
								<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">Tip</p>
								<p className="text-xs mt-1 text-slate-900">Choose your current stage, not target</p>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
					<div className="rounded-2xl border border-(--border) bg-white p-4 md:p-5">
						<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary) mb-2">Part A</p>
						<h3 className="text-lg font-semibold text-(--primary)">Sector</h3>
						<p className="text-sm text-(--secondary) mt-1">Select one sub-sector that best describes your startup.</p>
						<SectorPicker
							selectedSectors={data.sectors}
							onSelect={sectors => updateData({ sectors })}
							expandedCategory={expandedCategory}
							onToggleCategory={setExpandedCategory}
						/>
					</div>

					<div className="rounded-2xl border border-(--border) bg-white p-4 md:p-5">
						<p className="text-[11px] uppercase tracking-[0.14em] text-(--secondary) mb-2">Part B</p>
						<h3 className="text-lg font-semibold text-(--primary)">Current Stage</h3>
						<p className="text-sm text-(--secondary) mt-1">Where is your startup right now?</p>
						<StagePicker
							selectedStage={data.stage}
							onSelect={stage => updateData({ stage })}
						/>
					</div>
				</div>
			</div>
		);
	}

	if (currentStep === 4) {
		return (
			<WhyXentroStep
				selectedValues={data.whyXentro}
				otherText={data.whyXentroOther}
				onToggle={toggleWhyXentro}
				onOtherChange={value => updateData({ whyXentroOther: value })}
			/>
		);
	}

	return null;
}
