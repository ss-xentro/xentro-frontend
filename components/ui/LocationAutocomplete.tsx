'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface LocationSuggestion {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
	address: {
		city?: string;
		town?: string;
		village?: string;
		country?: string;
		country_code?: string;
	};
}

interface LocationValue {
	city: string;
	country: string;
	countryCode: string;
	displayName: string;
}

interface LocationAutocompleteProps {
	/** Current display text for the input */
	value: string;
	/** Called with structured location data when a suggestion is selected */
	onSelect: (location: LocationValue) => void;
	/** Called when the raw text input changes */
	onInputChange: (text: string) => void;
	label?: string;
	placeholder?: string;
	required?: boolean;
	className?: string;
}

/**
 * Location autocomplete input using OpenStreetMap Nominatim.
 * Replaces duplicated location search logic in add-startup and edit-startup pages.
 */
export function LocationAutocomplete({
	value,
	onSelect,
	onInputChange,
	label = 'Location',
	placeholder = 'Start typing city...',
	required = false,
	className,
}: LocationAutocompleteProps) {
	const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// Debounced Nominatim search
	useEffect(() => {
		if (value.length < 3) {
			setSuggestions([]);
			return;
		}

		const timer = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`,
					{
						headers: {
							'Accept': 'application/json',
							'User-Agent': 'XentroApp/1.0',
						},
					}
				);
				const data = await res.json();
				setSuggestions(data);
				setShowSuggestions(true);
			} catch {
				// Silently handle errors
			} finally {
				setLoading(false);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [value]);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(e.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSelect = useCallback((suggestion: LocationSuggestion) => {
		const city = suggestion.address.city || suggestion.address.town || suggestion.address.village || '';
		const country = suggestion.address.country || '';
		const countryCode = suggestion.address.country_code?.toUpperCase() || '';

		onSelect({
			city,
			country,
			countryCode,
			displayName: `${city}, ${country}`,
		});
		setShowSuggestions(false);
	}, [onSelect]);

	return (
		<div className={className}>
			{label && (
				<label className="block text-xs font-medium text-gray-500 mb-2">
					{label} {required && '*'}
				</label>
			)}
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => {
						onInputChange(e.target.value);
						setShowSuggestions(true);
					}}
					onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
					className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
					placeholder={placeholder}
					autoComplete="off"
					aria-label={label || 'Location'}
				/>

				{loading && (
					<div className="absolute right-3 top-3.5 pointer-events-none">
						<Spinner size="sm" className="text-gray-400" />
					</div>
				)}

				{showSuggestions && suggestions.length > 0 && (
					<div
						ref={suggestionsRef}
						className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
						role="listbox"
					>
						{suggestions.map((suggestion) => (
							<button
								key={suggestion.place_id}
								type="button"
								onClick={() => handleSelect(suggestion)}
								className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 focus:bg-gray-100 focus:outline-none"
								role="option"
							>
								<div className="font-medium text-gray-900 text-sm">
									{suggestion.address.city || suggestion.address.town || suggestion.address.village}
								</div>
								<div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
