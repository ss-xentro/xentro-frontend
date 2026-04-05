'use client';

import type { PitchCertificationItem } from './types';

interface PitchCertificationsProps {
	certifications: PitchCertificationItem[];
}

export function PitchCertifications({ certifications }: PitchCertificationsProps) {
	if (certifications.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-8">Certifications</h2>
			<div className="divide-y divide-(--border)">
				{certifications.map((cert, idx) => (
					<div key={idx} className="py-8 first:pt-0 last:pb-0">
						<h4 className="text-2xl font-bold text-(--primary) mb-1">{cert.title}</h4>
						{cert.issuer && <p className="text-sm text-(--secondary) mb-1">{cert.issuer}</p>}
						{cert.dateAwarded && (
							<p className="text-sm text-(--secondary) mb-4">
								{new Date(cert.dateAwarded).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
							</p>
						)}
						{cert.imageUrl && (
							<a
								href={cert.imageUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--surface-hover) text-sm text-accent hover:bg-(--accent-subtle) transition-colors"
							>
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
								</svg>
								View Certificate
							</a>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
