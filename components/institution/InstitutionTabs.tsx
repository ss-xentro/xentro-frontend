'use client';

import { useState } from 'react';
import { TAB_LABELS, TabKey } from './institution-tabs-config';
import type { Program, Startup, TeamMember, Project } from './institution-tabs-config';
import ProgramsTab from './tabs/ProgramsTab';
// events hidden — re-enable in v2
// import EventsTab from './tabs/EventsTab';
import StartupsTab from './tabs/StartupsTab';
import ProjectsTab from './tabs/ProjectsTab';
import TeamTab from './tabs/TeamTab';

interface InstitutionTabsProps {
    programs: Program[];
    events?: unknown[]; // events hidden — re-enable in v2
    startups: Startup[];
    team?: TeamMember[];
    projects?: Project[];
}

export function InstitutionTabs({ programs, startups, team = [], projects = [] }: InstitutionTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('programs');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-(--border)">
                <div className="flex gap-1 overflow-x-auto">
                    {TAB_LABELS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-3 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === key
                                ? 'border-violet-500 text-(--primary)'
                                : 'border-transparent text-(--secondary) hover:text-(--primary)'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
                {activeTab === 'programs' && <ProgramsTab programs={programs} />}
                {/* events hidden — re-enable in v2 */}
                {/* {activeTab === 'events' && <EventsTab events={events} />} */}
                {activeTab === 'startups' && <StartupsTab startups={startups} />}
                {activeTab === 'projects' && <ProjectsTab projects={projects} />}
                {activeTab === 'team' && <TeamTab team={team} />}
            </div>
        </div>
    );
}
