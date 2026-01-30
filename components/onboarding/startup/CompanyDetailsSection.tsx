'use client';

import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const stages = [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'mvp', label: 'MVP (Pre-Revenue)' },
    { value: 'early_traction', label: 'Early Traction' },
    { value: 'growth', label: 'Growth' },
    { value: 'scale', label: 'Scale' },
];

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'stealth', label: 'Stealth Mode' },
    { value: 'paused', label: 'Paused' },
    { value: 'acquired', label: 'Acquired' },
    { value: 'shut_down', label: 'Shut Down' },
];

export function CompanyDetailsSection() {
    const { data, updateData } = useStartupOnboardingStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    type="date"
                    label="Founded Date"
                    value={data.foundedDate}
                    onChange={(e) => updateData({ foundedDate: e.target.value })}
                    required
                />

                <Input
                    label="Location"
                    placeholder="e.g. San Francisco, CA"
                    value={data.location}
                    onChange={(e) => updateData({ location: e.target.value })}
                />

                <Select
                    label="Current Stage"
                    value={data.stage}
                    onChange={(value) => updateData({ stage: value as any })}
                    options={stages}
                    placeholder="Select stage"
                />

                <Select
                    label="Status"
                    value={data.status}
                    onChange={(value) => updateData({ status: value as any })}
                    options={statuses}
                    placeholder="Select status"
                />
            </div>
        </div>
    );
}
