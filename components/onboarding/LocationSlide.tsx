'use client';

import { Input, Select } from '@/components/ui';
import { countries } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LocationSlideProps {
    city: string;
    country: string;
    countryCode: string;
    onCityChange: (value: string) => void;
    onCountryChange: (country: string, code: string) => void;
    className?: string;
}

export default function LocationSlide({
    city,
    country,
    countryCode,
    onCityChange,
    onCountryChange,
    className,
}: LocationSlideProps) {
    const countryOptions = countries.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
    }));

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                    Where are they located?
                </h2>
                <p className="text-[var(--secondary)]">
                    Specify the primary headquarters location.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Input
                    label="City"
                    placeholder="e.g. San Francisco"
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                    autoFocus
                />

                <Select
                    label="Country"
                    options={countryOptions}
                    value={countryCode}
                    onChange={(code) => {
                        const countryObj = countries.find((c) => c.code === code);
                        if (countryObj) {
                            onCountryChange(countryObj.name, countryObj.code);
                        }
                    }}
                    placeholder="Select country"
                />
            </div>
        </div>
    );
}
