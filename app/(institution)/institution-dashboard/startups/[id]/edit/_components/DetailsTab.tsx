'use client';

import { Card, Select } from '@/components/ui';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { STAGE_OPTIONS, STATUS_OPTIONS, INPUT_CLASS, TEXTAREA_CLASS } from '../../../../_lib/startup-form-constants';
import type { StartupFormData } from '../../../../_lib/startup-form-constants';

interface DetailsTabProps {
	formData: StartupFormData;
	locationSearch: string;
	onFieldChange: (field: string, value: string) => void;
	onLocationSearchChange: (value: string) => void;
	onLocationSelect: (location: { city: string; country: string; countryCode: string; displayName: string }) => void;
}

export function DetailsTab({ formData, locationSearch, onFieldChange, onLocationSearchChange, onLocationSelect }: DetailsTabProps) {
	return (
		<>
			<Card className="p-6 space-y-6">
				<h3 className="text-lg font-semibold text-gray-900">Identity</h3>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Name *</label>
					<input type="text" value={formData.name} onChange={(e) => onFieldChange('name', e.target.value)} className={INPUT_CLASS} required />
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Tagline</label>
					<input type="text" value={formData.tagline} onChange={(e) => onFieldChange('tagline', e.target.value)} maxLength={280} className={INPUT_CLASS} placeholder="Short tagline for your startup" />
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">One-Line Pitch</label>
					<textarea value={formData.oneLiner} onChange={(e) => onFieldChange('oneLiner', e.target.value)} rows={2} maxLength={280} className={TEXTAREA_CLASS} placeholder="Describe what you&#39;re building in one sentence" />
					<p className="text-xs text-gray-400 mt-1">{formData.oneLiner.length} / 280</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Pitch (160 chars)</label>
					<textarea value={formData.pitch} onChange={(e) => onFieldChange('pitch', e.target.value)} rows={2} maxLength={160} className={TEXTAREA_CLASS} placeholder="Elevator pitch" />
					<p className="text-xs text-gray-400 mt-1">{formData.pitch.length} / 160</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Description</label>
					<textarea value={formData.description} onChange={(e) => onFieldChange('description', e.target.value)} rows={5} className={TEXTAREA_CLASS} placeholder="Detailed description of the startup" />
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Industry</label>
					<input type="text" value={formData.industry} onChange={(e) => onFieldChange('industry', e.target.value)} className={INPUT_CLASS} placeholder="e.g., FinTech, HealthTech" />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Logo URL</label>
						<input type="text" value={formData.logo} onChange={(e) => onFieldChange('logo', e.target.value)} className={INPUT_CLASS} placeholder="https://..." />
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Cover Image URL</label>
						<input type="text" value={formData.coverImage} onChange={(e) => onFieldChange('coverImage', e.target.value)} className={INPUT_CLASS} placeholder="https://..." />
					</div>
				</div>
			</Card>

			<Card className="p-6 space-y-6">
				<h3 className="text-lg font-semibold text-gray-900">Status & Location</h3>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Stage</label>
						<Select value={formData.stage} onChange={(val) => onFieldChange('stage', val)} options={STAGE_OPTIONS} />
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
						<Select value={formData.status} onChange={(val) => onFieldChange('status', val)} options={STATUS_OPTIONS} />
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Founded Date</label>
						<input type="date" value={formData.foundedDate} onChange={(e) => onFieldChange('foundedDate', e.target.value)} className={INPUT_CLASS} />
					</div>
					<LocationAutocomplete value={locationSearch} onInputChange={onLocationSearchChange} onSelect={onLocationSelect} label="Location" placeholder="Start typing city..." />
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Primary Contact Email</label>
					<input type="email" value={formData.primaryContactEmail} onChange={(e) => onFieldChange('primaryContactEmail', e.target.value)} className={INPUT_CLASS} placeholder="contact@startup.com" />
				</div>
			</Card>
		</>
	);
}
