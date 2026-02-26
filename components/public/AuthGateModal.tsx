'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AuthGateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthGateModal({ isOpen, onClose }: AuthGateModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-[#15181C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
                >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="px-8 py-10 text-center">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/xentro-logo.png"
                            alt="Xentro"
                            width={48}
                            height={48}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Join the Community
                    </h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        Sign up or log in to interact with posts, follow creators, and be part of the Xentro ecosystem.
                    </p>

                    {/* Sign up button */}
                    <Link
                        href="/join"
                        className="block w-full py-3.5 bg-white text-[#0B0D10] rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors mb-3"
                    >
                        Sign up
                    </Link>

                    {/* Log in button */}
                    <Link
                        href="/login"
                        className="block w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                        Log in
                    </Link>

                    {/* Terms */}
                    <p className="text-[11px] text-gray-600 mt-6 leading-relaxed">
                        By signing up, you agree to our{' '}
                        <span className="text-gray-400 hover:underline cursor-pointer">Terms of Service</span>{' '}
                        and{' '}
                        <span className="text-gray-400 hover:underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
