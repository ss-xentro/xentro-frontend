'use client';

import { useStartupOnboardingStore, FounderRole } from '@/stores/useStartupOnboardingStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const roleOptions: { value: FounderRole; label: string }[] = [
    { value: 'ceo', label: 'CEO' },
    { value: 'cto', label: 'CTO' },
    { value: 'coo', label: 'COO' },
    { value: 'cfo', label: 'CFO' },
    { value: 'cpo', label: 'CPO' },
    { value: 'founder', label: 'Founder' },
    { value: 'co_founder', label: 'Co-Founder' },
];

export function FoundersSection() {
    const { data, addFounder, updateFounder, removeFounder } = useStartupOnboardingStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
                {data.founders.map((founder, index) => (
                    <div
                        key={index}
                        className="p-5 bg-(--surface) border border-(--border) rounded-xl relative group transition-all hover:border-(--secondary-light)"
                    >
                        <div className="absolute right-4 top-4">
                            {data.founders.length > 1 && (
                                <button
                                    onClick={() => removeFounder(index)}
                                    className="text-(--secondary) hover:text-error transition-colors p-1"
                                    title="Remove founder"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <h3 className="text-sm font-medium text-(--secondary) mb-4 uppercase tracking-wider">
                            {index === 0 ? 'Primary Founder' : `Co-Founder ${index}`}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                placeholder="Jane Doe"
                                value={founder.name}
                                onChange={(e) => updateFounder(index, { name: e.target.value })}
                                required
                            />

                            <Input
                                label="Email Address"
                                placeholder="jane@example.com"
                                type="email"
                                value={founder.email}
                                onChange={(e) => updateFounder(index, { email: e.target.value })}
                                required
                            />

                            <Select
                                label="Role"
                                value={founder.role}
                                onChange={(value) => updateFounder(index, { role: value as FounderRole })}
                                options={roleOptions}
                            />

                            <Input
                                label="LinkedIn (Optional)"
                                placeholder="https://linkedin.com/in/..."
                                value={founder.linkedin || ''}
                                onChange={(e) => updateFounder(index, { linkedin: e.target.value })}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="secondary"
                onClick={addFounder}
                className="w-full border-dashed"
            >
                + Add Another Founder
            </Button>

            <div className="bg-(--accent-subtle) border border-(--accent-light) rounded-lg p-4">
                <h4 className="text-sm font-medium text-accent mb-1">Primary Contact</h4>
                <p className="text-sm text-(--secondary)">
                    We will use <strong>{data.founders[0]?.email || 'the primary founder email'}</strong> for all important communications.
                </p>
            </div>
        </div>
    );
}
