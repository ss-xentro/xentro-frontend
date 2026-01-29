import { PublicNavbar, Footer } from '@/components/public/Layout';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
