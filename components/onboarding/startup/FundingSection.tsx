'use client';

import { useStartupOnboardingStore, FundingRound } from '@/stores/useStartupOnboardingStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const fundingRoundOptions: { value: FundingRound; label: string }[] = [
    { value: 'bootstrapped', label: 'Bootstrapped' },
    { value: 'pre_seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b_plus', label: 'Series B+' },
    { value: 'unicorn', label: 'Unicorn' },
];

export function FundingSection() {
    const { data, updateData } = useStartupOnboardingStore();

    const handleInvestorsChange = (value: string) => {
        // Split by comma and clean up
        const investorsList = value.split(',').map(i => i.trim()).filter(Boolean);
        updateData({ investors: investorsList });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Current Funding Round"
                    value={data.fundingRound}
                    onChange={(value) => updateData({ fundingRound: value as FundingRound })}
                    options={fundingRoundOptions}
                />

                <div className="relative">
                    <Input
                        label="Total Funds Raised"
                        placeholder="0.00"
                        type="number"
                        min="0"
                        value={data.fundsRaised}
                        onChange={(e) => updateData({ fundsRaised: e.target.value })}
                        icon={<span className="text-(--secondary) font-semibold">$</span>}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Currency"
                    value={data.fundingCurrency}
                    onChange={(e) => updateData({ fundingCurrency: e.target.value.toUpperCase() })}
                    placeholder="USD"
                    maxLength={3}
                />
            </div>

            <Textarea
                label="Key Investors"
                placeholder="Sequoia, a16z, Y Combinator (comma separated)"
                value={data.investors.join(', ')}
                onChange={(e) => handleInvestorsChange(e.target.value)}
                hint="List your major investors separated by commas."
            />
        </div>
    );
}
