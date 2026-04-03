'use client';

import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

interface CompleteProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CompleteProfileModal({ isOpen, onClose }: CompleteProfileModalProps) {
    const router = useRouter();

    const handleComplete = () => {
        onClose();
        // Navigate to profile form
        router.push('/mentor-dashboard/profile');
    };

    const handleLater = () => {
        // Mark as dismissed for this session
        sessionStorage.setItem('profile_prompt_dismissed', 'true');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleLater} className="max-w-md">
            {/* Gradient accent bar */}
            <div className="h-1 bg-linear-to-r from-accent to-purple-500 -mx-6 -mt-4 mb-6 rounded-t-2xl" />

            <div>
                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-(--primary) text-center mb-2">
                    Complete your profile
                </h2>
                <p className="text-sm text-(--secondary) text-center mb-6">
                    A complete profile helps mentees find you and builds trust in the community.
                </p>

                {/* Incomplete sections */}
                <div className="bg-(--surface-hover) rounded-xl p-4 mb-6 space-y-3">
                    <p className="text-xs font-medium text-(--secondary) uppercase tracking-wide">Missing sections</p>
                    <div className="flex items-center gap-3 text-sm text-(--primary)">
                        <div className="w-5 h-5 rounded-full border-2 border-(--border) flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-(--border)" />
                        </div>
                        Packages & Pricing
                    </div>
                    <div className="flex items-center gap-3 text-sm text-(--primary)">
                        <div className="w-5 h-5 rounded-full border-2 border-(--border) flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-(--border)" />
                        </div>
                        Achievements & Highlights
                    </div>
                    <div className="flex items-center gap-3 text-sm text-(--primary)">
                        <div className="w-5 h-5 rounded-full border-2 border-(--border) flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-(--border)" />
                        </div>
                        Profile Photo
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleComplete}
                        className="w-full py-3 bg-accent text-background rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors"
                    >
                        Complete Now
                    </button>
                    <button
                        onClick={handleLater}
                        className="w-full py-3 bg-(--surface-hover) text-(--secondary) rounded-xl text-sm font-medium hover:bg-(--border) transition-colors"
                    >
                        I&apos;ll do it later
                    </button>
                </div>
            </div>
        </Modal>
    );
}
