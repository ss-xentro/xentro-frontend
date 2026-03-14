'use client';

import { useRef, useState } from 'react';

interface PhotoUploadProps {
	currentUrl?: string;
	label: string;
	onUpload: (url: string) => void;
	variant: 'cover' | 'avatar';
	mentorName?: string;
}

export default function PhotoUpload({ currentUrl, label, onUpload, variant, mentorName }: PhotoUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setError('File must be under 5MB');
			return;
		}

		setUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', variant === 'avatar' ? 'mentor-avatars' : 'mentor-covers');

			const res = await fetch('/api/media', { method: 'POST', body: formData });
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.message || 'Upload failed');
			}
			const { data } = await res.json();
			onUpload(data.url);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	if (variant === 'cover') {
		return (
			<div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500/20 via-indigo-500/15 to-purple-500/10 border border-(--border)">
				{currentUrl && (
					<img src={currentUrl} alt="Cover" className="w-full h-full object-cover" />
				)}
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={uploading}
					title={label}
					className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
				>
					{uploading ? (
						<svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
						</svg>
					) : (
						<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
					)}
				</button>
				{error && (
					<p className="absolute bottom-0 left-0 right-0 text-xs text-red-400 bg-black/70 px-3 py-1">{error}</p>
				)}
				<input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
			</div>
		);
	}

	// Avatar variant
	return (
		<div className="relative shrink-0">
			<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-(--surface) bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden shadow-lg">
				{currentUrl ? (
					<img src={currentUrl} alt={mentorName || 'Mentor'} className="w-full h-full object-cover" />
				) : (
					<span className="text-2xl sm:text-3xl font-bold text-(--secondary)">
						{mentorName ? mentorName.charAt(0).toUpperCase() : 'M'}
					</span>
				)}
			</div>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={uploading}
				title={label}
				className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-(--surface) border border-(--border) flex items-center justify-center hover:bg-(--surface-hover) transition-colors shadow-sm"
			>
				{uploading ? (
					<svg className="w-3.5 h-3.5 text-(--secondary) animate-spin" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
					</svg>
				) : (
					<svg className="w-3.5 h-3.5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
					</svg>
				)}
			</button>
			{error && <p className="absolute -bottom-5 left-0 text-xs text-red-400 whitespace-nowrap">{error}</p>}
			<input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
		</div>
	);
}
