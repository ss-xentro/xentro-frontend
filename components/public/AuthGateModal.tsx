'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';

interface AuthGateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthGateModal({ isOpen, onClose }: AuthGateModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} variant="dark" className="max-w-md">
            {/* Content */}
            <div className="text-center -mt-1">
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
                    <a href="/terms" className="text-gray-400 hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-gray-400 hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </Modal>
    );
}
