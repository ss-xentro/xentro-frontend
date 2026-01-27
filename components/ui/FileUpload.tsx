'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';

interface FileUploadProps {
    value?: string | null;
    onChange: (file: string | null) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    folder?: string;
    entityType?: string;
    entityId?: string;
}

export function FileUpload({
    value,
    onChange,
    accept = 'image/*',
    maxSize = 5,
    className,
    folder = 'uploads',
    entityType,
    entityId,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value ?? null);

    useEffect(() => {
        setPreview(value ?? null);
    }, [value]);

    const handleFile = useCallback(async (file: File) => {
        setError(null);

        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            if (entityType) formData.append('entityType', entityType);
            if (entityId) formData.append('entityId', entityId);

            const response = await fetch('/api/media', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.message ?? 'Upload failed');
            }

            const { data } = await response.json();
            onChange(data.url as string);
            setPreview(data.url as string);
        } catch (err) {
            setError((err as Error).message);
            setPreview(value ?? null);
        } finally {
            setIsUploading(false);
        }
    }, [entityId, entityType, folder, maxSize, onChange, value]);

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
        setPreview(null);
        setIsUploading(false);
    }, [onChange]);

    if (preview) {
        return (
            <div className={cn('w-full', className)}>
                <div className="relative w-40 h-40 mx-auto rounded-xl overflow-hidden border-2 border-(--border) bg-(--surface)">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-(--primary) text-white hover:bg-(--primary-light) transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="mt-3 text-sm text-(--secondary) text-center">
                    {isUploading ? 'Uploading...' : 'Logo uploaded successfully'}
                </p>
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
          border-2 border-dashed rounded-xl
          cursor-pointer transition-all duration-200
          hover:border-accent hover:bg-(--accent-subtle)`,
                    isDragging
                        ? 'border-accent bg-(--accent-subtle)'
                        : 'border-(--border) bg-(--surface)',
                    error && 'border-error'
                )}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-4 rounded-full bg-(--accent-light) flex items-center justify-center">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-(--primary)">
                        {isDragging ? 'Drop your logo here' : 'Drag & drop your logo'}
                    </p>
                    <p className="mt-1 text-sm text-(--secondary)">
                        or <span className="text-accent font-medium">browse files</span>
                    </p>
                    <p className="mt-3 text-xs text-(--secondary)">
                        PNG, JPG, SVG up to {maxSize}MB
                    </p>
                </div>
            </label>
            {error && (
                <p className="mt-2 text-sm text-error text-center">{error}</p>
            )}
            {isUploading && !error && (
                <p className="mt-2 text-sm text-(--secondary) text-center">Uploading to media storage...</p>
            )}
        </div>
    );
}
