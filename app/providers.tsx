'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from '@/components/ui/Toast';
import CookieConsent from '@/components/ui/CookieConsent';
import StartupOnboardingGuard from '@/components/auth/StartupOnboardingGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
                <StartupOnboardingGuard>
                    <ToastProvider>
                        {children}
                        <CookieConsent />
                    </ToastProvider>
                </StartupOnboardingGuard>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
