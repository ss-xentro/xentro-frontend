'use client';

import { FileUpload } from '@/components/ui';
import { cn } from '@/lib/utils';

interface LogoUploadSlideProps {
    value: string | null;
    onChange: (value: string | null) => void;
    className?: string;
}

export default function LogoUploadSlide({ value, onChange, className }: LogoUploadSlideProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Upload their logo
                </h2>
                <p className="text-(--secondary)">
                    A high-quality transparent PNG or SVG works best.
                </p>
            </div>

            <div className="max-w-md mx-auto">
                <FileUpload
                    value={value}
                    onChange={onChange}
                    accept="image/png, image/jpeg, image/svg+xml"
                    maxSize={2} // 2MB
                    folder="logos/institutions"
                    entityType="institution"
                />
            </div>
        </div>
    );
}
