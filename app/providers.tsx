'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import CookieConsent from '@/components/ui/CookieConsent';
import StartupOnboardingGuard from '@/components/auth/StartupOnboardingGuard';
import MentorOnboardingGuard from '@/components/auth/MentorOnboardingGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
                <StartupOnboardingGuard>
                    <MentorOnboardingGuard>{children}</MentorOnboardingGuard>
                </StartupOnboardingGuard>
                <CookieConsent />
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    duration={4000}
                    toastOptions={{
                        classNames: {
                            toast: 'font-sans',
                        },
                    }}
                />
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
