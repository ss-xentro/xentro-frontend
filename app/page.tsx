import Link from 'next/link';
import { Button, Card } from '@/components/ui';

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-(--surface) via-white to-(--surface-hover) text-(--primary)">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold text-accent mb-3">Welcome to Xentro</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Sign in to launch your journey</h1>
          <p className="text-lg text-(--secondary)">Choose your path below to access tailored tools for mentors and xplorers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-(--accent-light) text-accent flex items-center justify-center text-lg font-bold">M</div>
              <div className="text-left">
                <h2 className="text-2xl font-semibold">Mentor Login</h2>
                <p className="text-(--secondary)">Review requests, manage sessions, and update your profile.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/mentor-login" className="flex-1">
                <Button className="w-full" size="lg">Continue as Mentor</Button>
              </Link>
              <Link href="/mentor-signup" className="flex-1">
                <Button variant="ghost" className="w-full" size="lg">Apply to mentor</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-(--primary) text-white flex items-center justify-center text-lg font-bold">X</div>
              <div className="text-left">
                <h2 className="text-2xl font-semibold">Xplorer Login</h2>
                <p className="text-(--secondary)">Join cohorts, track progress, and access resources curated for you.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/xplorer-login" className="flex-1">
                <Button variant="secondary" className="w-full" size="lg">Continue as Xplorer</Button>
              </Link>
              <Link href="/xplorer-signup" className="flex-1">
                <Button variant="ghost" className="w-full" size="lg">Create xplorer account</Button>
              </Link>
            </div>
          </Card>

            <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-(--secondary-light) text-white flex items-center justify-center text-lg font-bold">I</div>
                <div className="text-left">
                  <h2 className="text-2xl font-semibold">Institution Onboarding</h2>
                  <p className="text-(--secondary)">Submit your institution for review and get verified via magic link.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/institution-onboarding" className="flex-1">
                  <Button variant="secondary" className="w-full" size="lg">Start onboarding</Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button variant="ghost" className="w-full" size="lg">Admin console</Button>
                </Link>
              </div>
            </Card>
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center text-sm text-(--secondary)">
          Need the admin console? <Link href="/login" className="text-accent font-semibold hover:underline">Go to admin login</Link>
        </div>
      </div>
    </main>
  );
}
