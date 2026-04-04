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
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Sign Up
                </h2>
                <p className="text-(--secondary) text-sm mb-8 leading-relaxed">
                    Create an account to get started.
                </p>

                {/* Sign up button */}
                <Link
                    href="/join"
                    className="block w-full py-3.5 bg-accent text-background rounded-xl text-sm font-semibold hover:opacity-90 transition-colors mb-3"
                >
                    Sign up
                </Link>

                {/* Log in button */}
                <Link
                    href="/login"
                    className="block w-full py-3.5 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-xl text-sm font-semibold hover:bg-(--accent-light) transition-colors"
                >
                    Log in
                </Link>

                {/* Terms */}
                <p className="text-[11px] text-(--secondary-light) mt-6 leading-relaxed">
                    By signing up, you agree to our{' '}
                    <a href="/terms" className="text-(--secondary) hover:underline">Terms</a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-(--secondary) hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </Modal>
    );
}
