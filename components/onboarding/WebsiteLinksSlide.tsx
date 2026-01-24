'use client';

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface WebsiteLinksSlideProps {
    website: string;
    linkedin: string;
    onWebsiteChange: (value: string) => void;
    onLinkedinChange: (value: string) => void;
    className?: string;
}

export default function WebsiteLinksSlide({
    website,
    linkedin,
    onWebsiteChange,
    onLinkedinChange,
    className,
}: WebsiteLinksSlideProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                    Online Presence
                </h2>
                <p className="text-[var(--secondary)]">
                    Add links to their website and LinkedIn profile.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Input
                    label="Website URL"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => onWebsiteChange(e.target.value)}
                    autoFocus
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    }
                />

                <Input
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/company/..."
                    value={linkedin}
                    onChange={(e) => onLinkedinChange(e.target.value)}
                    icon={
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                    }
                />
            </div>
        </div>
    );
}
