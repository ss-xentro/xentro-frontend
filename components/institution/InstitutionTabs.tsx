'use client';

import { useState } from 'react';
import { Card, Badge } from '@/components/ui';

type Program = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  duration: string | null;
};

type Event = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startTime: Date | null;
};

type Startup = {
  id: string;
  name: string;
  stage: string | null;
  location: string | null;
  oneLiner: string | null;
};

interface InstitutionTabsProps {
  programs: Program[];
  events: Event[];
  startups: Startup[];
}

export function InstitutionTabs({ programs, events, startups }: InstitutionTabsProps) {
  const [activeTab, setActiveTab] = useState<'programs' | 'events' | 'startups' | 'projects' | 'team'>('programs');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-(--border)">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'programs'
                ? 'border-accent text-accent'
                : 'border-transparent text-(--secondary) hover:text-(--primary)'
            }`}
          >
            Programs
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-accent text-accent'
                : 'border-transparent text-(--secondary) hover:text-(--primary)'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('startups')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'startups'
                ? 'border-accent text-accent'
                : 'border-transparent text-(--secondary) hover:text-(--primary)'
            }`}
          >
            Startups
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-accent text-accent'
                : 'border-transparent text-(--secondary) hover:text-(--primary)'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-accent text-accent'
                : 'border-transparent text-(--secondary) hover:text-(--primary)'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === 'programs' && (
          <div>
            <h2 className="text-xl font-bold text-(--primary) mb-4">Active Programs</h2>
            {programs.length > 0 ? (
              <div className="space-y-4">
                {programs.map((program) => (
                  <Card key={program.id} className="flex gap-4 p-6" hoverable>
                    <div className="w-12 h-12 rounded-lg bg-(--accent-light) flex items-center justify-center text-accent shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-(--primary) text-lg">{program.name}</h3>
                      <p className="text-(--secondary) mt-1 mb-3">{program.description ?? 'No description provided.'}</p>
                      <div className="flex gap-3">
                        <Badge variant="outline">{program.type}</Badge>
                        {program.duration && <Badge variant="info">{program.duration}</Badge>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-(--secondary) italic">No active programs listed.</p>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <h2 className="text-xl font-bold text-(--primary) mb-4">Upcoming Events</h2>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="flex gap-4 p-6" hoverable>
                    <div className="w-12 h-12 rounded-lg bg-(--warning-light) flex items-center justify-center text-[#B45309] shrink-0 font-bold text-center leading-none">
                      <div>
                        <span className="block text-xs uppercase">{event.startTime ? new Date(event.startTime).toLocaleString('default', { month: 'short' }) : '--'}</span>
                        <span className="block text-xl">{event.startTime ? new Date(event.startTime).getDate() : '--'}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-(--primary) text-lg">{event.name}</h3>
                      <p className="text-(--secondary) mt-1 mb-2">{event.description ?? 'No description provided.'}</p>
                      <p className="text-sm text-(--secondary) flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location ?? 'TBC'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-(--secondary) italic">No upcoming events listed.</p>
            )}
          </div>
        )}

        {activeTab === 'startups' && (
          <div>
            {startups.length > 0 ? (
              <div className="space-y-4">
                {startups.map((startup) => (
                  <Card key={startup.id} className="flex gap-4 p-6" hoverable>
                    <div className="w-12 h-12 rounded-lg bg-(--accent-light) flex items-center justify-center text-accent shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-(--primary) text-lg">{startup.name}</h3>
                      {startup.oneLiner && (
                        <p className="text-(--secondary) mt-1 mb-3">{startup.oneLiner}</p>
                      )}
                      <div className="flex gap-3 flex-wrap">
                        {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                        {startup.location && (
                          <span className="text-sm text-(--secondary) flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {startup.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-(--primary) mb-2">No startups listed yet</h3>
                <p className="text-(--secondary) max-w-md mx-auto">
                  This institution hasn't added any startups to their portfolio yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No projects listed yet</h3>
            <p className="text-(--secondary) max-w-md mx-auto">
              This institution hasn't added any projects to showcase yet.
            </p>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No team members listed yet</h3>
            <p className="text-(--secondary) max-w-md mx-auto">
              This institution hasn't added team member profiles yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
