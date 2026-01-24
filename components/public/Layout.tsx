'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export function PublicNavbar() {
    return (
        <nav className="h-16 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                <Link href="/institutions" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--primary)] text-white flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-[var(--primary)]">XENTRO</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/institutions" className="text-sm font-medium text-[var(--primary)]">
                        Explore
                    </Link>
                    <a href="#" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                        For Startups
                    </a>
                    <a href="#" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                        For Investors
                    </a>
                    <a href="#" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                        About
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Admin Login
                        </Button>
                    </Link>
                    <Button size="sm">
                        Apply Now
                    </Button>
                </div>
            </div>
        </nav>
    );
}

export function Footer() {
    return (
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--primary)] text-white flex items-center justify-center">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <span className="font-bold text-[var(--primary)]">XENTRO</span>
                        </div>
                        <p className="text-sm text-[var(--secondary)]">
                            Connecting the world's innovation ecosystem. Discover top incubators, accelerators, and funds.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[var(--primary)] mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-[var(--secondary)]">
                            <li><a href="#" className="hover:text-[var(--primary)]">Explore Institutions</a></li>
                            <li><a href="#" className="hover:text-[var(--primary)]">Success Stories</a></li>
                            <li><a href="#" className="hover:text-[var(--primary)]">Impact Reports</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[var(--primary)] mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-[var(--secondary)]">
                            <li><a href="#" className="hover:text-[var(--primary)]">Blog</a></li>
                            <li><a href="#" className="hover:text-[var(--primary)]">Community</a></li>
                            <li><a href="#" className="hover:text-[var(--primary)]">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[var(--primary)] mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-[var(--secondary)]">
                            <li><a href="#" className="hover:text-[var(--primary)]">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[var(--primary)]">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[var(--primary)]">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--secondary)]">
                    © {new Date().getFullYear()} XENTRO Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
