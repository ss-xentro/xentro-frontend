'use client';

import { Card, Select } from '@/components/ui';
import { FUNDING_ROUND_OPTIONS, INPUT_CLASS } from '../../../../_lib/startup-form-constants';
import { currencies } from '@/lib/types';
import { getCurrencySymbol } from '@/lib/utils';
import type { StartupFormData } from '../../../../_lib/startup-form-constants';

const currencyOptions = currencies.map((c) => ({
	value: c.code,
	label: `${c.code} (${c.symbol})`,
}));

interface FundingTabProps {
	formData: StartupFormData;
	onFieldChange: (field: string, value: string) => void;
}

export function FundingTab({ formData, onFieldChange }: FundingTabProps) {
	return (
		<Card className="p-6 space-y-6">
			<h3 className="text-lg font-semibold text-(--primary)">Funding Information</h3>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-medium text-(--secondary-light) mb-2">Latest Round</label>
					<Select value={formData.fundingRound} onChange={(val) => onFieldChange('fundingRound', val)} options={FUNDING_ROUND_OPTIONS} />
				</div>
				<div>
					<label className="block text-xs font-medium text-(--secondary-light) mb-2">Currency</label>
					<Select value={formData.fundingCurrency} onChange={(val) => onFieldChange('fundingCurrency', val)} options={currencyOptions} />
				</div>
			</div>

			<div>
				<label className="block text-xs font-medium text-(--secondary-light) mb-2">Total Funds Raised</label>
				<div className="relative">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--secondary)">{getCurrencySymbol(formData.fundingCurrency)}</span>
					<input type="number" value={formData.fundsRaised} onChange={(e) => onFieldChange('fundsRaised', e.target.value)} className="w-full pl-8 pr-4 py-3 text-sm bg-background border border-(--border) rounded-lg focus:border-(--primary) focus:outline-none" placeholder="0.00" step="0.01" />
				</div>
			</div>
		</Card>
	);
}
