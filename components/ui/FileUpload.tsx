"use client";

import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useRef } from "react";
import { ImageCropper } from "./ImageCropper";
import { MediaPreview } from "./MediaPreview";
import { getSessionToken } from "@/lib/auth-utils";

interface FileUploadProps {
	value?: string | null;
	onChange: (file: string | null) => void;
	onUploadStateChange?: (isUploading: boolean) => void;
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
	onUploadStateChange,
	accept = "image/*",
	maxSize = 5,
	className,
	folder = "uploads",
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
	const previewObjectUrlRef = useRef<string | null>(null);
	const cropObjectUrlRef = useRef<string | null>(null);

	const revokePreviewObjectUrl = useCallback(() => {
		if (previewObjectUrlRef.current) {
			URL.revokeObjectURL(previewObjectUrlRef.current);
			previewObjectUrlRef.current = null;
		}
	}, []);

	const revokeCropObjectUrl = useCallback(() => {
		if (cropObjectUrlRef.current) {
			URL.revokeObjectURL(cropObjectUrlRef.current);
			cropObjectUrlRef.current = null;
		}
	}, []);

	useEffect(() => {
		setPreview(value ?? null);
	}, [value]);

	useEffect(() => {
		return () => {
			revokePreviewObjectUrl();
			revokeCropObjectUrl();
		};
	}, [revokePreviewObjectUrl, revokeCropObjectUrl]);

	const handleFile = useCallback(
		async (file: File) => {
			setError(null);

			if (file.size > maxSize * 1024 * 1024) {
				setError(`File size must be less than ${maxSize}MB`);
				return;
			}

			if (!file.type.startsWith("image/")) {
				setError("Please upload an image file");
				return;
			}

			setOriginalFile(file);
			const localPreview = URL.createObjectURL(file);
			cropObjectUrlRef.current = localPreview;

			if (enableCrop) {
				setImageToCrop(localPreview);
				setShowCropModal(true);
			} else {
				await uploadFile(file);
			}
		},
		[enableCrop, maxSize],
	);

	const uploadFile = async (file: File) => {
		setIsUploading(true);
		onUploadStateChange?.(true);
		revokePreviewObjectUrl();
		const localPreview = URL.createObjectURL(file);
		previewObjectUrlRef.current = localPreview;
		setPreview(localPreview);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", folder);
			if (entityType) formData.append("entityType", entityType);
			if (entityId) formData.append("entityId", entityId);

			const token = getSessionToken();
			const response = await fetch("/api/media", {
				method: "POST",
				body: formData,
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message ?? "Upload failed");
			}

			const { data } = await response.json();
			onChange(data.url as string);
			setPreview(data.url as string);
			revokePreviewObjectUrl();
		} catch (err) {
			setError((err as Error).message);
			setPreview(value ?? null);
			revokePreviewObjectUrl();
		} finally {
			setIsUploading(false);
			onUploadStateChange?.(false);
		}
	};

	const handleCropComplete = async (cachedBlob: Blob) => {
		if (!cachedBlob || !originalFile) return;

		const croppedFile = new File([cachedBlob], originalFile.name, {
			type: originalFile.type,
			lastModified: Date.now(),
		});

		setShowCropModal(false);
		setImageToCrop(null);
		revokeCropObjectUrl();
		await uploadFile(croppedFile);
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFile(file);
			}
		},
		[handleFile],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleFile(file);
			}
		},
		[handleFile],
	);

	const handleRemove = useCallback(() => {
		revokePreviewObjectUrl();
		revokeCropObjectUrl();
		onUploadStateChange?.(false);
		onChange(null);
		setError(null);
		setPreview(null);
		setIsUploading(false);
	}, [
		onChange,
		onUploadStateChange,
		revokePreviewObjectUrl,
		revokeCropObjectUrl,
	]);

	if (preview) {
		const isSquareCrop = enableCrop && Math.abs(aspectRatio - 1) < 0.01;
		const isFreeform = !enableCrop;
		return (
			<div className={cn("w-full", className)}>
				<div
					className={cn(
						"relative overflow-hidden rounded-xl border-2 border-(--border) bg-(--surface-hover) group",
						isSquareCrop ? "w-28 h-28 mx-auto" : "w-full",
					)}
					style={
						isFreeform
							? undefined
							: !isSquareCrop
								? { aspectRatio }
								: undefined
					}
				>
					<MediaPreview
						src={preview}
						alt="Preview"
						className={cn(
							"w-full rounded-none border-0 bg-(--surface-hover)",
							isFreeform ? "h-auto max-h-64" : "h-full",
						)}
						mediaClassName={isFreeform ? "object-contain max-h-64" : "object-cover"}
					/>
					{isUploading && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
							<svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
						</div>
					)}
					<button
						type="button"
						onClick={handleRemove}
						className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
						aria-label="Remove image"
					>
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeDasharray="round"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				{!isUploading && (
					<p className="mt-2 text-xs text-(--secondary) text-center flex items-center justify-center gap-1">
						<svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
						</svg>
						Uploaded
					</p>
				)}
			</div>
		);
	}

	return (
		<>
			<div className={cn("w-full", className)}>
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
							? "border-accent bg-(--accent-subtle)"
							: "border-(--border) bg-(--surface)",
						error && "border-error",
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
							<svg
								className="w-6 h-6 text-accent"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<p className="text-sm font-medium text-(--primary)">
							{isDragging ? "Drop image here" : "Drag & drop image"}
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
					<p className="mt-2 text-sm text-(--secondary) text-center">
						Uploading to media storage...
					</p>
				)}
			</div>

			{/* Crop Modal */}
			{showCropModal && imageToCrop && (
				<ImageCropper
					imageSrc={imageToCrop}
					aspectRatio={aspectRatio}
					cropShape={aspectRatio === 1 ? "circle" : "rect"}
					onCropComplete={handleCropComplete}
					onCancel={() => {
						setShowCropModal(false);
						setImageToCrop(null);
						revokeCropObjectUrl();
					}}
				/>
			)}
		</>
	);
}
