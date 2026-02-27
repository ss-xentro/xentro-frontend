'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';

interface VideoUploadProps {
  value?: string | null;
  onChange: (file: string | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  maxDuration?: number; // in seconds
  className?: string;
  folder?: string;
  entityType?: string;
  entityId?: string;
}

export function VideoUpload({
  value,
  onChange,
  accept = 'video/*',
  maxSize = 100, // Default 100MB for video
  maxDuration = 185, // 3 mins 5 seconds
  className,
  folder = 'uploads',
  entityType,
  entityId,
}: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

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
  }, [folder, entityType, entityId, onChange, value]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    // Check duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > maxDuration) {
        // Formatting max duration for the error message
        const mins = Math.floor(maxDuration / 60);
        const secs = maxDuration % 60;
        setError(`Video duration must not exceed ${mins} minutes and ${secs} seconds.`);
        return;
      }
      // Proceed to upload
      await uploadFile(file);
    };

    video.onerror = () => {
      setError('Failed to load video metadata. Please try a different video format.');
      window.URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);

  }, [maxSize, maxDuration, uploadFile]); // Added uploadFile to dependencies

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
        <div className="relative w-full max-w-lg mx-auto rounded-xl overflow-hidden border-2 border-(--border) bg-(--surface) aspect-video">
          <video
            src={preview}
            controls
            className="w-full h-full object-contain bg-black"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
            aria-label="Remove video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-3 text-sm text-(--secondary) text-center">
          {isUploading ? 'Uploading...' : 'Video uploaded successfully'}
        </p>
        {error && (
          <p className="mt-2 text-sm text-error text-center">{error}</p>
        )}
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
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 mb-4 rounded-full bg-(--accent-light) flex items-center justify-center">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-(--primary)">
            {isDragging ? 'Drop your video here' : 'Drag & drop a video'}
          </p>
          <p className="mt-1 text-sm text-(--secondary)">
            or <span className="text-accent font-medium">browse files</span>
          </p>
          <p className="mt-3 text-xs text-(--secondary)">
            MP4, WebM up to {maxSize}MB.
          </p>
          <p className="mt-1 text-xs text-error font-medium">
            Max duration: {Math.floor(maxDuration / 60)}m {maxDuration % 60}s.
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
