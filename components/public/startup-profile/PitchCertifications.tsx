'use client';

import type { PitchCertificationItem } from './types';

interface PitchCertificationsProps {
	certifications: PitchCertificationItem[];
}

export function PitchCertifications({ certifications }: PitchCertificationsProps) {
	if (certifications.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Certifications</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{certifications.map((cert, idx) => (
					<div key={idx} className="p-4 rounded-xl border border-(--border) bg-(--surface) hover:border-(--primary)/20 transition-colors">
						{cert.imageUrl && (
							<div className="w-full h-28 rounded-lg overflow-hidden mb-3 bg-(--surface-hover)">
								<img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-contain" />
							</div>
						)}
						<h4 className="text-sm font-medium text-(--primary) mb-0.5">{cert.title}</h4>
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
