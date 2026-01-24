'use client';

import { Input, Select } from '@/components/ui';
import { currencies } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FundingImpactSlideProps {
    amount: number;
    currency: string;
    onAmountChange: (value: number) => void;
    onCurrencyChange: (value: string) => void;
    className?: string;
}

export default function FundingImpactSlide({
    amount,
    currency,
    onAmountChange,
    onCurrencyChange,
    className,
}: FundingImpactSlideProps) {
    const currencyOptions = currencies.map((c) => ({
        value: c.code,
        label: `${c.code} (${c.symbol})`,
    }));

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                    Funding Facilitated
                </h2>
                <p className="text-[var(--secondary)]">
                    Total funding raised by startups or distributed as grants.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <div className="flex gap-4">
                    <div className="w-1/3">
                        <Select
                            label="Currency"
                            options={currencyOptions}
                            value={currency}
                            onChange={onCurrencyChange}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            label="Total Amount"
                            type="number"
                            placeholder="0"
                            value={amount === 0 ? '' : amount}
                            onChange={(e) => onAmountChange(parseInt(e.target.value) || 0)}
                            autoFocus
                        />
                    </div>
                </div>

                <p className="text-sm text-[var(--secondary)] bg-[var(--surface-hover)] p-4 rounded-[var(--radius-lg)]">
                    💡 Including funding metrics increases trust and attracts high-quality startups to the program.
                </p>
            </div>
        </div>
    );
}
