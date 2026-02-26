'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface TagInputProps {
    label?: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    suggestions?: { category: string; items: string[] }[];
    className?: string;
}

export default function TagInput({
    label,
    tags,
    onChange,
    placeholder = 'Type and press Enter…',
    suggestions,
    className,
}: TagInputProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput('');
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input);
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div className={cn('space-y-3', className)}>
            {label && (
                <label className="block text-sm font-medium text-(--primary)">
                    {label}
                </label>
            )}

            {/* Input area with tags */}
            <div
                className="flex flex-wrap items-center gap-2 p-3 bg-(--surface) border border-(--border) rounded-lg cursor-text min-h-[48px] focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent transition-all"
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, index) => (
                    <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium animate-fadeIn"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(index);
                            }}
                            className="ml-0.5 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-(--primary) placeholder:text-(--secondary)"
                />
            </div>

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs text-(--secondary) font-medium">Suggestions</p>
                    {suggestions.map((group) => (
                        <div key={group.category}>
                            <p className="text-xs font-medium text-(--secondary) mb-1.5">{group.category}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {group.items.map((item) => {
                                    const isAdded = tags.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => !isAdded && addTag(item)}
                                            disabled={isAdded}
                                            className={cn(
                                                'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150',
                                                isAdded
                                                    ? 'bg-accent/10 text-accent cursor-default'
                                                    : 'bg-(--surface-hover) text-(--secondary) hover:bg-accent/10 hover:text-accent cursor-pointer'
                                            )}
                                        >
                                            {isAdded ? '✓ ' : '+ '}{item}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
