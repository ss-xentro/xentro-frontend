'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface MediaPreviewProps {
	src: string;
	alt?: string;
	kind?: 'image' | 'video';
	className?: string;
	mediaClassName?: string;
	showControls?: boolean;
}

export function MediaPreview({
	src,
	alt = 'Media preview',
	kind = 'image',
	className,
	mediaClassName,
	showControls = true,
}: MediaPreviewProps) {
	const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
	const [retrySeed, setRetrySeed] = useState(0);

	const resolvedSrc = useMemo(() => {
		if (!src) return src;
		if (retrySeed === 0) return src;

		const separator = src.includes('?') ? '&' : '?';
		return `${src}${separator}retry=${retrySeed}`;
	}, [src, retrySeed]);

	const handleRetry = () => {
		setStatus('loading');
		setRetrySeed((seed) => seed + 1);
	};

	return (
		<div className={cn('relative overflow-hidden rounded-xl border border-(--border) bg-(--surface-hover)', className)}>
			{kind === 'video' ? (
				<video
					key={resolvedSrc}
					src={resolvedSrc}
					controls={showControls}
					playsInline
					className={cn(
						'h-full w-full bg-black object-contain transition-opacity duration-200',
						status === 'loaded' ? 'opacity-100' : 'opacity-0',
						mediaClassName,
					)}
					onLoadedData={() => setStatus('loaded')}
					onError={() => setStatus('error')}
				/>
			) : (
				<img
					key={resolvedSrc}
					src={resolvedSrc}
					alt={alt}
					loading="lazy"
					decoding="async"
					className={cn(
						'h-full w-full object-contain transition-opacity duration-200',
						status === 'loaded' ? 'opacity-100' : 'opacity-0',
						mediaClassName,
					)}
					onLoad={() => setStatus('loaded')}
					onError={() => setStatus('error')}
				/>
			)}

			{status === 'loading' && (
				<div className="absolute inset-0 flex items-center justify-center bg-(--surface-hover)">
					<div className="h-6 w-6 rounded-full border-2 border-(--border) border-t-(--primary) animate-spin" />
				</div>
			)}

			{status === 'error' && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-(--surface-hover) p-3 text-center">
					<p className="text-xs text-(--secondary)">Preview failed to render.</p>
					<Button type="button" size="sm" variant="secondary" onClick={handleRetry}>
						Retry
					</Button>
				</div>
			)}
		</div>
	);
}
