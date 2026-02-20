'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export function PublicNavbar() {
    return (
        <nav className="h-16 border-b border-(--border) bg-(--surface)/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                <Link href="/feed" className="flex items-center gap-2">
                    <img src="/xentro-logo.png" alt="Xentro" className="h-8 w-auto" />
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/institutions" className="text-sm font-medium text-(--primary) hover:text-accent transition-colors">
                        Institutions
                    </Link>
                    <Link href="/startups" className="text-sm font-medium text-(--primary) hover:text-accent transition-colors">
                        Startups
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/join">
                        <Button size="sm">
                            Join
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export function Footer() {
    return (
        <footer className="bg-(--surface) border-t border-(--border) py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/xentro-logo.png" alt="Xentro" className="h-6 w-auto" />
                        </div>
                        <p className="text-sm text-(--secondary)">
                            Connecting the world&apos;s innovation ecosystem. Discover top incubators, accelerators, and funds.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-(--primary) mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-(--secondary)">
                            <li><a href="#" className="hover:text-(--primary)">Explore Institutions</a></li>
                            <li><a href="#" className="hover:text-(--primary)">Success Stories</a></li>
                            <li><a href="#" className="hover:text-(--primary)">Impact Reports</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-(--primary) mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-(--secondary)">
                            <li><a href="#" className="hover:text-(--primary)">Blog</a></li>
                            <li><a href="#" className="hover:text-(--primary)">Community</a></li>
                            <li><a href="#" className="hover:text-(--primary)">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-(--primary) mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-(--secondary)">
                            <li><a href="#" className="hover:text-(--primary)">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-(--primary)">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-(--primary)">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-(--border) text-center text-sm text-(--secondary)">
                    © {new Date().getFullYear()} XENTRO Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
