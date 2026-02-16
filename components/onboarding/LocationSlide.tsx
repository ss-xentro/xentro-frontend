'use client';

import { Input, Select } from '@/components/ui';
import { countries } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface LocationSlideProps {
    city: string;
    countryCode: string;
    onCityChange: (value: string) => void;
    onCountryChange: (country: string, code: string) => void;
    className?: string;
}

interface CitySuggestion {
    name: string;
    display_name: string;
    lat: string;
    lon: string;
}

export default function LocationSlide({
    city,
    countryCode,
    onCityChange,
    onCountryChange,
    className,
}: LocationSlideProps) {
    const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const countryOptions = countries.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
    }));

    // Fetch city suggestions from Nominatim API
    useEffect(() => {
        const fetchCities = async () => {
            if (!city || city.length < 2) {
                setCitySuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const selectedCountry = countries.find(c => c.code === countryCode);
                const countryName = selectedCountry?.name || 'India';
                
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                    `q=${encodeURIComponent(city)}&` +
                    `countrycodes=${countryCode.toLowerCase()}&` +
                    `format=json&` +
                    `limit=8&` +
                    `featuretype=city&` +
                    `addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'Xentro-App/1.0'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const cities = data
                        .filter((item: any) => 
                            item.type === 'city' || 
                            item.type === 'town' || 
                            item.type === 'administrative' ||
                            item.class === 'place'
                        )
                        .map((item: any) => ({
                            name: item.address?.city || item.address?.town || item.name,
                            display_name: item.display_name,
                            lat: item.lat,
                            lon: item.lon,
                        }))
                        .filter((item: CitySuggestion, index: number, self: CitySuggestion[]) => 
                            // Remove duplicates based on city name
                            index === self.findIndex(t => t.name === item.name)
                        );
                    
                    setCitySuggestions(cities);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
                setCitySuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchCities, 300); // Debounce
        return () => clearTimeout(timer);
    }, [city, countryCode]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCitySelect = (selectedCity: CitySuggestion) => {
        onCityChange(selectedCity.name);
        setShowSuggestions(false);
        setCitySuggestions([]);
    };

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
                <div className="relative">
                    <Input
                        ref={inputRef}
                        id="city"
                        label="City"
                        placeholder="Start typing city name..."
                        value={city}
                        onChange={(e) => {
                            onCityChange(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                        autoFocus
                        autoComplete="off"
                        aria-label="City name"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestions}
                    />
                    
                    {/* Loading indicator */}
                    {loading && (
                        <div className="absolute right-3 top-10.5 pointer-events-none">
                            <svg className="animate-spin h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    )}

                    {/* City Suggestions Dropdown */}
                    {showSuggestions && citySuggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-white border border-(--border) rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            role="listbox"
                        >
                            {citySuggestions.map((suggestion, index) => (
                                <button
                                    key={`${suggestion.name}-${index}`}
                                    type="button"
                                    onClick={() => handleCitySelect(suggestion)}
                                    className="w-full px-4 py-3 text-left hover:bg-(--surface-hover) transition-colors border-b border-(--border) last:border-b-0 focus:bg-(--surface-hover) focus:outline-none"
                                    role="option"
                                    aria-selected={city === suggestion.name}
                                >
                                    <div className="font-medium text-(--primary)">{suggestion.name}</div>
                                    <div className="text-sm text-(--secondary) truncate">{suggestion.display_name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Select
                    label="Country"
                    options={countryOptions}
                    value={countryCode}
                    onChange={(code) => {
                        const countryObj = countries.find((c) => c.code === code);
                        if (countryObj) {
                            onCountryChange(countryObj.name, countryObj.code);
                            // Clear city when country changes
                            if (city) {
                                setCitySuggestions([]);
                            }
                        }
                    }}
                    placeholder="Select country"
                    aria-label="Country selection"
                />
            </div>
        </div>
    );
}
