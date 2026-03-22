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
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Identity</p>
					<h2 className="text-xl md:text-2xl font-semibold tracking-tight mt-1 text-slate-900">Startup basics</h2>
					<p className="text-sm text-slate-700 mt-1.5">Fill the minimum profile identity fields to continue.</p>
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
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Team</p>
					<h2 className="text-xl md:text-2xl font-semibold tracking-tight mt-1 text-slate-900">People behind the startup</h2>
					<p className="text-sm text-slate-700 mt-1.5">Primary founder is required. Co-founders and team profiles are optional.</p>
				</div>
				<FoundersSection />
			</div>
		);
	}

	if (currentStep === 3) {
		return (
			<div className="p-6 md:p-8 space-y-7 md:space-y-8 animate-fadeIn">
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Market Position</p>
					<h2 className="text-xl md:text-2xl font-semibold tracking-tight mt-1 text-slate-900">Sector and stage</h2>
					<p className="text-sm text-slate-700 mt-1.5">Select one sector and one current stage for accurate discovery and matching.</p>
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
