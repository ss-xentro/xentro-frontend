import Link from 'next/link';
import { Button, Card } from '@/components/ui';

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-(--surface) via-white to-(--surface-hover) text-(--primary)" role="main">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-sm font-semibold text-accent mb-3 uppercase tracking-wide">Welcome to Xentro</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Choose your path</h1>
          <p className="text-lg text-(--secondary)">Access tailored tools designed for mentors, xplorers, and institutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xl font-bold mb-4" aria-hidden="true">🚀</div>
              <h2 className="text-2xl font-semibold mb-2">For Startups</h2>
              <p className="text-(--secondary) text-sm">Build your dream company, find co-founders, and get funded.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/onboarding/startup" className="flex-1">
                <Button className="w-full min-h-12" size="lg" aria-label="Create Startup">Create Startup</Button>
              </Link>
              <Link href="/startups" className="flex-1">
                <Button variant="ghost" className="w-full min-h-12" size="lg" aria-label="Explore Startups">Xplore Startups</Button>
              </Link>
            </div>
          </Card>
          <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-lg bg-(--accent-light) text-accent flex items-center justify-center text-xl font-bold mb-4" aria-hidden="true">M</div>
              <h2 className="text-2xl font-semibold mb-2">For Mentors</h2>
              <p className="text-(--secondary) text-sm">Guide xplorers, manage sessions, and share your expertise.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/mentor-login" className="flex-1">
                <Button className="w-full min-h-12" size="lg" aria-label="Sign in as mentor">Sign In</Button>
              </Link>
              <Link href="/mentor-signup" className="flex-1">
                <Button variant="ghost" className="w-full min-h-12" size="lg" aria-label="Apply to become a mentor">Apply as Mentor</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-lg bg-(--primary) text-white flex items-center justify-center text-xl font-bold mb-4" aria-hidden="true">X</div>
              <h2 className="text-2xl font-semibold mb-2">For Xplorers</h2>
              <p className="text-(--secondary) text-sm">Join cohorts, connect with mentors, and accelerate your growth.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/xplorer-login" className="flex-1">
                <Button variant="secondary" className="w-full min-h-12" size="lg" aria-label="Sign in as xplorer">Sign In</Button>
              </Link>
              <Link href="/xplorer-signup" className="flex-1">
                <Button variant="ghost" className="w-full min-h-12" size="lg" aria-label="Create xplorer account">Create Account</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 border-(--border) bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-lg bg-green-500 text-white flex items-center justify-center text-xl font-bold mb-4" aria-hidden="true">🏛️</div>
              <h2 className="text-2xl font-semibold mb-2">For Institutions</h2>
              <p className="text-(--secondary) text-sm">Showcase programs and connect with aspiring entrepreneurs.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/institution-login" className="flex-1">
                <Button className="w-full min-h-12" size="lg" aria-label="Login to institution dashboard">Login to Dashboard</Button>
              </Link>
              <Link href="/institutions" className="flex-1">
                <Button variant="ghost" className="w-full min-h-12" size="lg" aria-label="Explore institutions">Xplore Institutions</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-(--secondary) bg-white px-6 py-3 rounded-full shadow-sm">
            <span>Admin?</span>
            <Link href="/login" className="text-accent font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded" aria-label="Go to admin console">
              Access Console
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
