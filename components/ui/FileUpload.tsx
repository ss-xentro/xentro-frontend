'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface FileUploadProps {
    value?: string | null;
    onChange: (file: string | null) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
}

export function FileUpload({
    value,
    onChange,
    accept = 'image/*',
    maxSize = 5,
    className,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [maxSize, onChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleRemove = useCallback(() => {
        onChange(null);
        setError(null);
    }, [onChange]);

    if (value) {
        return (
            <div className={cn('w-full', className)}>
                <div className="relative w-40 h-40 mx-auto rounded-[var(--radius-xl)] overflow-hidden border-2 border-[var(--border)] bg-[var(--surface)]">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="mt-3 text-sm text-[var(--secondary)] text-center">Logo uploaded successfully</p>
            </div>
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    `flex flex-col items-center justify-center w-full h-48 px-6 py-8
          border-2 border-dashed rounded-[var(--radius-xl)]
          cursor-pointer transition-all duration-200
          hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]`,
                    isDragging
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                        : 'border-[var(--border)] bg-[var(--surface)]',
                    error && 'border-[var(--error)]'
                )}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-4 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-[var(--primary)]">
                        {isDragging ? 'Drop your logo here' : 'Drag & drop your logo'}
                    </p>
                    <p className="mt-1 text-sm text-[var(--secondary)]">
                        or <span className="text-[var(--accent)] font-medium">browse files</span>
                    </p>
                    <p className="mt-3 text-xs text-[var(--secondary)]">
                        PNG, JPG, SVG up to {maxSize}MB
                    </p>
                </div>
            </label>
            {error && (
                <p className="mt-2 text-sm text-[var(--error)] text-center">{error}</p>
            )}
        </div>
    );
}
