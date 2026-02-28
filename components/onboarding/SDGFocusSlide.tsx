'use client';

import { sdgLabels, SDGFocus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SDGFocusSlideProps {
    value: SDGFocus[];
    onChange: (value: SDGFocus[]) => void;
    className?: string;
}

export default function SDGFocusSlide({ value, onChange, className }: SDGFocusSlideProps) {
    const handleToggle = (sdg: SDGFocus) => {
        if (value.includes(sdg)) {
            onChange(value.filter((item) => item !== sdg));
        } else {
            if (value.length < 5) {
                onChange([...value, sdg]);
            }
        }
    };

    const sdgOptions = Object.entries(sdgLabels) as [SDGFocus, typeof sdgLabels[SDGFocus]][];

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Sustainable Development Goals
                </h2>
                <p className="text-(--secondary)">
                    Select up to 5 UN SDGs that align with your institution&apos;s mission
                </p>
            </div>

            {/* SDG Grid - 17 squares in rows */}
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-6 gap-3 mb-6">
                    {sdgOptions.map(([sdg, { label, fullName, color }]) => {
                        const isSelected = value.includes(sdg);
                        const isDisabled = !isSelected && value.length >= 5;

                        return (
                            <button
                                key={sdg}
                                onClick={() => !isDisabled && handleToggle(sdg)}
                                disabled={isDisabled}
                                className={cn(
                                    'relative aspect-square rounded-lg transition-all duration-200',
                                    'flex flex-col items-center justify-center p-3',
                                    'border-2 hover:scale-105 active:scale-95',
                                    isSelected && 'ring-4 ring-offset-2 ring-offset-white scale-105 shadow-lg',
                                    isDisabled && 'opacity-40 cursor-not-allowed hover:scale-100',
                                    !isDisabled && 'cursor-pointer'
                                )}
                                style={{
                                    backgroundColor: color,
                                    borderColor: isSelected ? '#000' : color,
                                }}
                                title={fullName}
                            >
                                <span className="text-white font-bold text-3xl mb-1">{label}</span>
                                <span className="text-white text-[0.65rem] font-semibold text-center leading-tight">
                                    {fullName.split(' ').slice(0, 3).join(' ')}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Count */}
                <div className="text-center">
                    <p className="text-sm text-(--secondary)">
                        {value.length} of 5 goals selected
                    </p>
                </div>
            </div>

            {/* Selected SDG Summary */}
            {value.length > 0 && (
                <div className="mt-6 p-4 bg-(--surface-hover) rounded-lg">
                    <p className="text-sm font-semibold text-(--primary) mb-2">Selected Goals:</p>
                    <div className="flex flex-wrap gap-2">
                        {value.map((sdg) => {
                            const labelData = sdgLabels[sdg];
                            if (!labelData) return null;
                            return (
                                <div
                                    key={sdg}
                                    className="px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2"
                                    style={{ backgroundColor: labelData.color }}
                                >
                                    <span>SDG {labelData.label}</span>
                                    <button
                                        onClick={() => handleToggle(sdg)}
                                        className="hover:bg-white/20 rounded-full p-0.5"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
