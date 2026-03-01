'use client';

import { Input, Select } from '@/components/ui';
import { countries } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LocationSlideProps {
    city: string;
    countryCode: string;
    onCityChange: (value: string) => void;
    onCountryChange: (country: string, code: string) => void;
    className?: string;
}

export default function LocationSlide({
    city,
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
        <div className={cn('space-y-6', className)} role="region" aria-label="Institution location">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Where are you located?
                </h2>
                <p className="text-(--secondary)">
                    This helps users find institutions in their region.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Input
                    id="city"
                    label="City"
                    placeholder="Enter your city name"
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                    autoFocus
                    autoComplete="off"
                    aria-label="City name"
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
                    aria-label="Country selection"
                />
            </div>
        </div>
    );
}
