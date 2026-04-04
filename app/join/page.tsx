"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Role = 'startup' | 'mentor' | 'institution' | null;

const PURPOSE_DESTINATIONS: Record<Exclude<Role, null>, string> = {
  startup: '/onboarding/startup',
  mentor: '/onboarding/mentor',
  institution: '/onboarding/institution',
};

const LOGIN_DESTINATIONS: Record<Exclude<Role, null>, string> = {
  startup: '/login',
  mentor: '/login',
  institution: '/login',
};

export default function JoinPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push(PURPOSE_DESTINATIONS[selectedRole]);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const roles = [
    {
      id: 'startup' as const,
      title: 'Startup',
      description: 'Apply as a founder building a venture.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'mentor' as const,
      title: 'Mentor',
      description: 'Guide founders with your expertise.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'institution' as const,
      title: 'Institution',
      description: 'Run programs & accelerators.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    // investor role hidden for v1 — will be re-enabled in v2
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-250">
          {/* Step Indicator */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs font-medium text-(--secondary-light) tracking-[0.15em] uppercase mb-4 sm:mb-6">
              Step 1
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-(--primary) mb-3 sm:mb-4 tracking-tight">
              Select Your Role
            </h1>

            <p className="text-base sm:text-lg text-(--secondary-light)">
              Choose your role.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 mt-8 sm:mt-12">
            {roles.map((role) => (
              <div key={role.id} className="flex flex-col">
                <button
                  onClick={() => setSelectedRole(role.id)}
                  className={`group relative border text-left transition-all duration-200 aspect-square sm:aspect-auto p-3 sm:p-4 md:p-8 flex-1 rounded-lg sm:rounded-none ${selectedRole === role.id
                    ? 'bg-(--primary) border-(--primary) scale-[1.02]'
                    : 'bg-(--background) border-(--border) hover:border-(--border-hover)'
                    }`}
                >
                  {/* Hover glow */}
                  <div
                    className={`absolute inset-0 opacity-0 transition-opacity duration-200 pointer-events-none ${selectedRole === role.id ? 'opacity-5' : 'group-hover:opacity-5'
                      }`}
                  >
                    <div className="absolute inset-0 bg-(--surface) blur-xl" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`mb-2 sm:mb-3 ${selectedRole === role.id ? 'text-(--background)' : 'text-(--primary)'}`}>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 [&>svg]:w-full [&>svg]:h-full">
                        {role.icon}
                      </div>
                    </div>

                    <h3 className={`text-sm sm:text-lg md:text-2xl font-bold mb-1 md:mb-2 ${selectedRole === role.id ? 'text-(--background)' : 'text-(--primary)'}`}>
                      {role.title}
                    </h3>

                    <p className={`text-[10px] sm:text-xs md:text-sm mb-0 md:mb-6 flex-1 leading-snug ${selectedRole === role.id ? 'text-(--secondary-light)' : 'text-(--secondary-light)'}`}>
                      {role.description}
                    </p>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(PURPOSE_DESTINATIONS[role.id]);
                      }}
                      className={`hidden md:flex items-center text-sm group-hover:translate-x-1 transition-transform duration-200 cursor-pointer hover:opacity-80 ${selectedRole === role.id ? 'text-(--secondary-light)' : 'text-(--primary-light)'}`}
                    >
                      <span className="mr-2">Continue</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Login Link */}
                <Link
                  href={LOGIN_DESTINATIONS[role.id]}
                  className="mt-2 text-center text-xs text-(--secondary-light) hover:text-(--primary) transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  Already have an account? <span className="font-medium underline">Log in →</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12">
            <button
              onClick={handleBack}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-(--border-hover) text-(--primary) text-sm font-medium hover:bg-(--accent-subtle) transition-all duration-200 rounded-lg sm:rounded-none"
            >
              Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 rounded-lg sm:rounded-none ${selectedRole
                ? 'bg-(--primary) text-(--background) hover:bg-(--primary-light)'
                : 'bg-(--border) text-(--secondary) cursor-not-allowed'
                }`}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
