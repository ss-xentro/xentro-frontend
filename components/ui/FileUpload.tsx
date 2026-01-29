'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect, useRef } from 'react';

interface FileUploadProps {
    value?: string | null;
    onChange: (file: string | null) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    folder?: string;
    entityType?: string;
    entityId?: string;
    enableCrop?: boolean;
    aspectRatio?: number; // e.g., 1 for square, 16/9 for landscape
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
    enableCrop = false,
    aspectRatio = 1,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value ?? null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

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

        setOriginalFile(file);
        const localPreview = URL.createObjectURL(file);
        
        if (enableCrop) {
            setImageToCrop(localPreview);
            setShowCropModal(true);
        } else {
            await uploadFile(file);
        }
    }, [enableCrop, maxSize]);

    const uploadFile = async (file: File) => {
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
    };

    const handleCropComplete = async () => {
        if (!canvasRef.current || !imgRef.current) return;

        const canvas = canvasRef.current;
        const img = imgRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to crop size
        canvas.width = crop.width;
        canvas.height = crop.height;

        // Calculate scale
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        // Draw cropped image
        ctx.drawImage(
            img,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (!blob || !originalFile) return;
            
            const croppedFile = new File([blob], originalFile.name, {
                type: originalFile.type,
                lastModified: Date.now(),
            });

            setShowCropModal(false);
            setImageToCrop(null);
            await uploadFile(croppedFile);
        }, originalFile?.type || 'image/png');
    };

    const handleImageLoad = () => {
        if (imgRef.current) {
            const img = imgRef.current;
            setImageSize({ width: img.width, height: img.height });
            
            // Initialize crop in the center
            // Use as large a crop as possible so oversized logos fit comfortably
            const maxWidth = img.width;
            const maxHeight = img.height;
            const cropWidth = aspectRatio
                ? Math.min(maxWidth, maxHeight * aspectRatio)
                : maxWidth;
            const cropHeight = aspectRatio ? cropWidth / aspectRatio : maxHeight;
            setCrop({
                x: (img.width - cropWidth) / 2,
                y: (img.height - cropHeight) / 2,
                width: cropWidth,
                height: cropHeight,
            });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingCrop(true);
        setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingCrop || !imgRef.current) return;
        
        const newX = Math.max(0, Math.min(imageSize.width - crop.width, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(imageSize.height - crop.height, e.clientY - dragStart.y));
        
        setCrop({ ...crop, x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDraggingCrop(false);
    };

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
                        aria-label="Remove image"
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
        <>
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

            {/* Crop Modal */}
            {showCropModal && imageToCrop && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCropModal(false)}>
                    <div className="bg-(--surface) rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-(--primary)">Crop Your Image</h3>
                            <button
                                type="button"
                                onClick={() => setShowCropModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--surface-hover) text-(--secondary)"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <p className="text-sm text-(--secondary) mb-4">
                            Drag the box to adjust your crop area. Make sure your logo is clearly visible.
                        </p>

                        <div 
                            className="relative inline-block max-w-full mx-auto"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img
                                ref={imgRef}
                                src={imageToCrop}
                                alt="Crop preview"
                                className="max-w-full max-h-[60vh] select-none"
                                onLoad={handleImageLoad}
                                draggable={false}
                            />
                            
                            {/* Crop overlay */}
                            <div
                                className="absolute border-2 border-accent cursor-move"
                                style={{
                                    left: crop.x,
                                    top: crop.y,
                                    width: crop.width,
                                    height: crop.height,
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                                }}
                                onMouseDown={handleMouseDown}
                            >
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="border border-accent/30" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!imgRef.current) return;
                                    const img = imgRef.current;
                                    const w = img.width;
                                    const h = img.height;
                                    setCrop({ x: 0, y: 0, width: w, height: h });
                                }}
                                className="h-11 px-4 bg-(--surface-hover) text-(--primary) rounded-lg hover:bg-(--border) transition-colors font-medium"
                            >
                                Use Full Image
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCropModal(false);
                                    setImageToCrop(null);
                                }}
                                className="flex-1 h-11 px-4 bg-(--surface-hover) text-(--primary) rounded-lg hover:bg-(--border) transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropComplete}
                                className="flex-1 h-11 px-4 bg-accent text-white rounded-lg hover:bg-(--primary) transition-colors font-medium"
                            >
                                Crop & Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="hidden" />
        </>
    );
}
