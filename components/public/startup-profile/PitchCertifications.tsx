'use client';

import type { PitchCertificationItem } from './types';

interface PitchCertificationsProps {
	certifications: PitchCertificationItem[];
}

export function PitchCertifications({ certifications }: PitchCertificationsProps) {
	if (certifications.length === 0) return null;

	return (
		<section>
			<h2 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-(--secondary) mb-4">Certifications</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{certifications.map((cert, idx) => (
					<div key={idx} className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden flex flex-col hover:border-(--primary)/20 transition-colors">
						{cert.imageUrl && (
							<img src={cert.imageUrl} alt={cert.title} className="w-full h-auto" />
						)}
						<div className="flex-1 p-4">
							<h4 className="text-base font-bold text-(--primary) mb-0.5">{cert.title}</h4>
							{cert.issuer && <p className="text-xs text-(--secondary)">{cert.issuer}</p>}
							{cert.dateAwarded && (
								<p className="text-xs text-(--secondary) mt-1">
									{new Date(cert.dateAwarded).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
								</p>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
