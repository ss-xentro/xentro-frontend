import { Spinner } from '@/components/ui/Spinner';
import { DocumentEntry } from '../_lib/constants';

interface Props {
	documents: DocumentEntry[];
	uploading: boolean;
	uploadError: string | null;
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemove: (index: number) => void;
}

export default function DocumentsSection({ documents, uploading, uploadError, onUpload, onRemove }: Props) {
	return (
		<>
			<div className="flex items-center gap-3 mb-5">
				<div className="w-8 h-8 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center">
					<svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-(--primary)">Documents</h3>
					<p className="text-sm text-(--secondary)">Upload certifications, resume, or portfolio documents</p>
				</div>
			</div>

			{/* Upload area */}
			<label className={`flex flex-col items-center justify-center w-full h-40 px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:border-accent hover:bg-(--accent-subtle) ${uploading ? 'opacity-50 pointer-events-none' : 'border-(--border) bg-(--surface)'}`}>
				<input
					type="file"
					accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
					onChange={onUpload}
					className="hidden"
					disabled={uploading}
				/>
				<div className="flex flex-col items-center">
					{uploading ? (
						<>
							<Spinner size="lg" className="text-accent mb-3" />
							<p className="text-sm font-medium text-(--primary)">Uploading...</p>
						</>
					) : (
						<>
							<div className="w-10 h-10 mb-3 rounded-full bg-(--accent-light) flex items-center justify-center">
								<svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
							</div>
							<p className="text-sm font-medium text-(--primary)">
								Drag & drop or <span className="text-accent">browse files</span>
							</p>
							<p className="mt-1 text-xs text-(--secondary)">
								PDF, DOC, JPG, PNG up to 10MB
							</p>
						</>
					)}
				</div>
			</label>

			{uploadError && (
				<p className="mt-2 text-sm text-red-500">{uploadError}</p>
			)}

			{/* Uploaded documents list */}
			{documents.length > 0 && (
				<div className="mt-4 space-y-2">
					{documents.map((doc, index) => (
						<div key={index} className="flex items-center gap-3 p-3 bg-(--surface-hover) rounded-lg group">
							<div className="w-8 h-8 rounded-lg bg-(--surface) border border-(--border) flex items-center justify-center shrink-0">
								<svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-(--primary) truncate">{doc.name}</p>
								<p className="text-xs text-(--secondary)">
									Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
								</p>
							</div>
							<a
								href={doc.url}
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-accent hover:bg-accent/10 transition-colors"
								aria-label="View document"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
							</a>
							<button
								onClick={() => onRemove(index)}
								className="w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-red-500 hover:bg-(--surface) transition-colors opacity-0 group-hover:opacity-100"
								aria-label="Remove document"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					))}
				</div>
			)}
		</>
	);
}
