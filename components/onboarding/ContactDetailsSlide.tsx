'use client';

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ContactDetailsSlideProps {
    email: string;
    phone: string;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    className?: string;
}

export default function ContactDetailsSlide({
    email,
    phone,
    onEmailChange,
    onPhoneChange,
    className,
}: ContactDetailsSlideProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Contact Details
                </h2>
                <p className="text-(--secondary)">
                    Provide official contact information for inquiries and partnerships.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <Input
                    label="Contact Email"
                    type="email"
                    placeholder="contact@institution.com"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    autoFocus
                    required
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                />

                <Input
                    label="Contact Phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    }
                />

                <div className="bg-(--accent-subtle) border border-(--accent-light) rounded-lg p-4 mt-6">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-(--secondary)">
                            <p className="font-medium text-(--primary) mb-1">Why we need this</p>
                            <p>This information will be displayed on your public profile so potential partners and startups can reach you directly.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
