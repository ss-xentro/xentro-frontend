'use client';

import { Section } from './MentorProfileHelpers';

interface MentorDocument {
	name?: string;
	url?: string;
	type?: string;
}

interface DocumentsSectionProps {
	documents?: MentorDocument[];
	verified: boolean;
}

const BADGE_SVG = (
	<svg className="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z" clipRule="evenodd" /></svg>
);

function VerifiedBanner() {
	return (
		<div className="bg-(--success-light) border border-(--success)/20 rounded-lg p-4 flex items-start gap-3">
			<svg className="w-5 h-5 text-(--success) shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
			<div>
				<p className="text-sm font-semibold text-(--success)">Identity Verified</p>
				<p className="text-xs text-(--success)/70 mt-0.5">This mentor&apos;s identity has been verified through document review and credential checks.</p>
			</div>
		</div>
	);
}

export function DocumentsSection({ documents, verified }: DocumentsSectionProps) {
	const hasDocs = documents && documents.length > 0;

	if (!hasDocs && !verified) return null;

	// Verified banner only (no documents)
	if (!hasDocs && verified) {
		return (
			<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-3">
				<svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
				<div>
					<p className="text-sm font-semibold text-emerald-400">Identity Verified</p>
					<p className="text-xs text-emerald-400/70 mt-0.5">This mentor&apos;s identity has been verified through document review and credential checks.</p>
				</div>
			</div>
		);
	}

	// Documents section (with optional verified banner)
	return (
		<Section title="Certifications & Verification" icon={BADGE_SVG}>
			<div className="space-y-3">
				{documents!.map((doc, i) => (
					<div key={i} className="flex items-start gap-3 bg-(--accent-subtle) border border-(--border) rounded-lg p-4">
						<div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
							<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-(--primary)">{doc.name || `Document ${i + 1}`}</p>
							{doc.type && <p className="text-xs text-(--secondary-light) mt-0.5">{doc.type}</p>}
							{doc.url && (
								<a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors">
									View Document
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
								</a>
							)}
						</div>
					</div>
				))}
			</div>
			{verified && <div className="mt-4"><VerifiedBanner /></div>}
		</Section>
	);
}
