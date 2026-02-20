"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'startup' | 'mentor' | 'institution' | 'investor' | null;

const PURPOSE_DESTINATIONS: Record<Exclude<Role, null>, string> = {
  startup: '/onboarding/startup',
  mentor: '/mentor-signup',
  institution: '/institution-onboarding',
  investor: '/feed',
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
      description: 'Support founders through guidance and expertise.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'institution' as const,
      title: 'Institution',
      description: 'Run programs, incubators, or accelerators.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'investor' as const,
      title: 'Investor',
      description: 'Discover and fund emerging startups.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-250">
          {/* Step Indicator */}
          <div className="text-center mb-8">
            <p className="text-xs font-medium text-gray-500 tracking-[0.15em] uppercase mb-6">
              STEP 1 OF 3
            </p>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Select Your Role
            </h1>
            
            <p className="text-lg text-gray-600">
              Choose how you will participate in the Xentro ecosystem.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-12">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`group relative border p-8 text-left transition-all duration-200 ${
                  selectedRole === role.id
                    ? 'bg-gray-900 border-gray-900 scale-[1.02]'
                    : 'bg-white border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* Hover glow */}
                <div 
                  className={`absolute inset-0 opacity-0 transition-opacity duration-200 pointer-events-none ${
                    selectedRole === role.id ? 'opacity-5' : 'group-hover:opacity-5'
                  }`}
                >
                  <div className="absolute inset-0 bg-gray-900 blur-xl" />
                </div>

                <div className="relative z-10">
                  <div className={`mb-4 ${selectedRole === role.id ? 'text-white' : 'text-gray-900'}`}>
                    {role.icon}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${selectedRole === role.id ? 'text-white' : 'text-gray-900'}`}>
                    {role.title}
                  </h3>
                  
                  <p className={`text-sm mb-6 ${selectedRole === role.id ? 'text-gray-300' : 'text-gray-600'}`}>
                    {role.description}
                  </p>
                  
                  <div className={`flex items-center text-sm group-hover:translate-x-1 transition-transform duration-200 ${selectedRole === role.id ? 'text-gray-200' : 'text-gray-700'}`}>
                    <span className="mr-2">Continue</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-900 text-sm font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Back
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`px-8 py-3 text-sm font-medium transition-all duration-200 ${
                selectedRole
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
