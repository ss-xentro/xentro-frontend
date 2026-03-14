'use client';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D10]/90 border-b border-white/10">
        <div className="px-6 pt-5 pb-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">Explore</h1>
          <p className="text-sm text-gray-500 mt-0.5">Discover institutions, startups, and mentors on Xentro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  );
}
