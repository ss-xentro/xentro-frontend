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
			<div className="p-6 md:p-8 space-y-6 animate-fadeIn">
				<div>
					<h2 className="text-xl font-semibold text-(--primary)">Tell us about your startup</h2>
					<p className="text-sm text-(--secondary) mt-1">Start with the basics — you can always update later.</p>
				</div>
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
					<p className="text-xs text-(--secondary) mt-1.5">Square image recommended (512×512 or larger)</p>
				</div>
			</div>
		);
	}

	if (currentStep === 2) {
		return (
			<div className="p-6 md:p-8 space-y-6 animate-fadeIn">
				<div>
					<h2 className="text-xl font-semibold text-(--primary)">Who is building this startup?</h2>
					<p className="text-sm text-(--secondary) mt-1">Add one founder, then any co-founders or team members you want to show on the public profile.</p>
				</div>
				<FoundersSection />
			</div>
		);
	}

	if (currentStep === 3) {
		return (
			<div className="p-6 md:p-8 space-y-8 animate-fadeIn">
				<div>
					<h2 className="text-xl font-semibold text-(--primary)">What sector are you in?</h2>
					<p className="text-sm text-(--secondary) mt-1">Select one sub-sector that best describes your startup.</p>
					<SectorPicker
						selectedSectors={data.sectors}
						onSelect={sectors => updateData({ sectors })}
						expandedCategory={expandedCategory}
						onToggleCategory={setExpandedCategory}
					/>
				</div>
				<div>
					<h2 className="text-lg font-semibold text-(--primary)">Current Stage</h2>
					<p className="text-sm text-(--secondary) mt-1">Where is your startup right now?</p>
					<StagePicker
						selectedStage={data.stage}
						onSelect={stage => updateData({ stage })}
					/>
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
