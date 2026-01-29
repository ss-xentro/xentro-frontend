import { OnboardingFormData } from '@/lib/types';
import { useState } from 'react';

interface LegalDocumentsSlideProps {
  formData: OnboardingFormData;
  onChange: (updated: Partial<OnboardingFormData>) => void;
}

export default function LegalDocumentsSlide({ formData, onChange }: LegalDocumentsSlideProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('folder', 'legal-documents');

        const res = await fetch('/api/media', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!res.ok) throw new Error('Failed to upload document');
        const payload = await res.json();
        uploadedUrls.push(payload.url);
      }

      onChange({ legalDocuments: [...(formData.legalDocuments || []), ...uploadedUrls] });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    const updated = [...(formData.legalDocuments || [])];
    updated.splice(index, 1);
    onChange({ legalDocuments: updated });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-(--accent-light) mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-(--primary)">Legal Documents</h2>
        <p className="text-(--secondary) max-w-xl mx-auto">
          Upload legal documents that recognize your institution in India (e.g., Certificate of Incorporation, Trust Deed, Society Registration, DPIIT Recognition, etc.)
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-blue-900 font-semibold mb-1">Accepted Documents</p>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>Certificate of Incorporation</li>
              <li>Trust Deed / Society Registration</li>
              <li>DPIIT Recognition Certificate</li>
              <li>MOA/AOA (Memorandum & Articles of Association)</li>
              <li>PAN Card of the Institution</li>
              <li>GST Registration Certificate</li>
            </ul>
            <p className="text-blue-800 text-sm mt-2">
              <strong>Formats:</strong> PDF, JPG, PNG (Max 10MB per file)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-(--border) rounded-xl p-8 text-center hover:border-accent transition-colors">
        <input
          type="file"
          id="legal-docs-upload"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <label 
          htmlFor="legal-docs-upload" 
          className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-12 h-12 text-(--secondary) mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-(--primary) font-semibold mb-1">
            {uploading ? 'Uploading...' : 'Click to upload documents'}
          </p>
          <p className="text-(--secondary) text-sm">
            or drag and drop multiple files
          </p>
        </label>
      </div>

      {/* Uploaded Documents List */}
      {formData.legalDocuments && formData.legalDocuments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-(--primary)">Uploaded Documents ({formData.legalDocuments.length})</h3>
          {formData.legalDocuments.map((doc, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-(--surface-hover) rounded-lg">
              <svg className="w-8 h-8 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--primary) truncate">
                  Document {index + 1}
                </p>
                <a 
                  href={doc} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-accent hover:underline truncate block"
                >
                  View document
                </a>
              </div>
              <button
                onClick={() => handleRemoveDocument(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-900 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            These documents are required for verification. They will be reviewed by our team and kept confidential. Ensure all documents are clear and legible.
          </span>
        </p>
      </div>
    </div>
  );
}
