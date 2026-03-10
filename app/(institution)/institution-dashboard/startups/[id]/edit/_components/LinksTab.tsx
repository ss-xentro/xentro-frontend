'use client';

import { Card } from '@/components/ui';
import { INPUT_CLASS } from '../../../../_lib/startup-form-constants';
import type { StartupFormData } from '../../../../_lib/startup-form-constants';

interface LinksTabProps {
	formData: StartupFormData;
	onFieldChange: (field: string, value: string) => void;
}

export function LinksTab({ formData, onFieldChange }: LinksTabProps) {
	return (
		<Card className="p-6 space-y-6">
			<h3 className="text-lg font-semibold text-gray-900">Links & Social</h3>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Website</label>
					<input type="url" value={formData.website} onChange={(e) => onFieldChange('website', e.target.value)} className={INPUT_CLASS} placeholder="https://..." />
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">LinkedIn</label>
					<input type="url" value={formData.linkedin} onChange={(e) => onFieldChange('linkedin', e.target.value)} className={INPUT_CLASS} placeholder="https://linkedin.com/..." />
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Twitter</label>
					<input type="url" value={formData.twitter} onChange={(e) => onFieldChange('twitter', e.target.value)} className={INPUT_CLASS} placeholder="https://twitter.com/..." />
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Instagram</label>
					<input type="url" value={formData.instagram} onChange={(e) => onFieldChange('instagram', e.target.value)} className={INPUT_CLASS} placeholder="https://instagram.com/..." />
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Pitch Deck URL</label>
					<input type="url" value={formData.pitchDeckUrl} onChange={(e) => onFieldChange('pitchDeckUrl', e.target.value)} className={INPUT_CLASS} placeholder="https://..." />
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Demo Video URL</label>
					<input type="url" value={formData.demoVideoUrl} onChange={(e) => onFieldChange('demoVideoUrl', e.target.value)} className={INPUT_CLASS} placeholder="https://youtube.com/..." />
				</div>
			</div>
		</Card>
	);
}
