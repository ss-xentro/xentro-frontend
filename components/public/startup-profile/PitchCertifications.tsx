'use client';

import { useRef } from 'react';
import type { PitchCertificationItem } from './types';

interface PitchCertificationsProps {
	certifications: PitchCertificationItem[];
}

export function PitchCertifications({ certifications }: PitchCertificationsProps) {
	const carouselRef = useRef<HTMLDivElement>(null);

	if (certifications.length === 0) return null;

	const scrollCarousel = (direction: 'left' | 'right') => {
		if (carouselRef.current) {
			const scrollAmount = 320;
			carouselRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth',
			});
		}
	};

	return (
		<section>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-(--primary)">Certifications</h2>
				<div className="flex gap-2">
					<button onClick={() => scrollCarousel('left')} className="p-2 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors">
						<svg className="w-4 h-4 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button onClick={() => scrollCarousel('right')} className="p-2 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors">
						<svg className="w-4 h-4 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
			<div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
				{certifications.map((cert, idx) => (
					<div key={idx} className="min-w-[280px] max-w-[300px] snap-start shrink-0 p-5 rounded-xl border border-(--border) bg-(--surface) hover:shadow-md transition-all">
						{cert.imageUrl && (
							<div className="w-full h-36 rounded-lg overflow-hidden mb-4 bg-(--surface-hover)">
								<img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-contain" />
							</div>
						)}
						<h4 className="font-semibold text-(--primary) text-sm mb-1">{cert.title}</h4>
						{cert.issuer && <p className="text-xs text-(--secondary)">{cert.issuer}</p>}
						{cert.dateAwarded && (
							<p className="text-xs text-(--secondary) mt-1">
								{new Date(cert.dateAwarded).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
							</p>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
