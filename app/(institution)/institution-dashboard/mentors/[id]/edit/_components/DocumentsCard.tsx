'use client';

import { Card } from '@/components/ui';
import { DocumentEntry } from './constants';

interface DocumentsCardProps {
	documents: DocumentEntry[];
	setDocuments: (docs: DocumentEntry[]) => void;
}

export function DocumentsCard({ documents, setDocuments }: DocumentsCardProps) {
	const removeDocument = (i: number) => setDocuments(documents.filter((_, idx) => idx !== i));

	return (
		<Card className="p-6 space-y-4">
			<h3 className="text-lg font-semibold text-(--primary)">Documents</h3>
			<p className="text-sm text-(--secondary-light)">Certifications, resume, or portfolio documents</p>
			{documents.length > 0 ? (
				<div className="space-y-2">
					{documents.map((doc, i) => (
						<div key={i} className="flex items-center gap-3 p-3 bg-(--accent-subtle) rounded-lg group">
							<svg className="w-5 h-5 text-(--secondary) shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-(--primary) truncate">{doc.name}</p>
								<p className="text-xs text-(--secondary-light)">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
							</div>
							<a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
							<button onClick={() => removeDocument(i)} className="text-(--secondary) hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity" aria-label="Remove document">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-(--secondary) py-4 text-center">No documents uploaded</p>
			)}
		</Card>
	);
}
