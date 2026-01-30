import { create } from 'zustand';

export type Program = {
    id: string;
    name: string;
    type: string;
    description: string | null;
    duration: string | null;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
};

export type Event = {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    startTime: string | null;
};

export type Startup = {
    id: string;
    name: string;
    stage: string | null;
    location: string | null;
    oneLiner: string | null;
};

export type TeamMember = {
    id: string;
    userId: string;
    role: 'owner' | 'admin' | 'manager' | 'viewer';
    invitedAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    } | null;
};

export type Project = {
    id: string;
    name: string;
    status: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
};

export type Institution = {
    id: string;
    slug: string;
    name: string;
    type: string;
    tagline: string | null;
    city: string | null;
    country: string | null;
    operatingMode: string | null;
    logo: string | null;
    website: string | null;
    email: string;
    description: string | null;
    sdgFocus: string[] | null;
    sectorFocus: string[] | null;
    startupsSupported: number;
    studentsMentored: number;
    fundingFacilitated: number;
    fundingCurrency: string | null;
    verified: boolean;
    status: string;
};

type InstitutionStore = {
    institution: Institution | null;
    programs: Program[];
    events: Event[];
    startups: Startup[];
    team: TeamMember[];
    projects: Project[];
    loading: boolean;
    error: string | null;

    // Actions
    setInstitution: (institution: Institution | null) => void;
    setPrograms: (programs: Program[]) => void;
    setEvents: (events: Event[]) => void;
    setStartups: (startups: Startup[]) => void;
    setTeam: (team: TeamMember[]) => void;
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    removeProject: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Fetch all institution data
    fetchInstitution: (id: string) => Promise<void>;
    reset: () => void;
};

const initialState = {
    institution: null,
    programs: [],
    events: [],
    startups: [],
    team: [],
    projects: [],
    loading: false,
    error: null,
};

export const useInstitutionStore = create<InstitutionStore>((set, get) => ({
    ...initialState,

    setInstitution: (institution) => set({ institution }),
    setPrograms: (programs) => set({ programs }),
    setEvents: (events) => set({ events }),
    setStartups: (startups) => set({ startups }),
    setTeam: (team) => set({ team }),
    setProjects: (projects) => set({ projects }),

    addProject: (project) => set((state) => ({
        projects: [project, ...state.projects],
    })),

    updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
        ),
    })),

    removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
    })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchInstitution: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/institutions/${id}`, {
                headers: { 'x-public-view': 'true' },
            });
            if (!res.ok) throw new Error('Institution not found');
            const data = await res.json();

            set({
                institution: data.institution,
                programs: data.programs || [],
                events: data.events || [],
                startups: data.startups || [],
                team: data.team || [],
                projects: data.projects || [],
                loading: false,
            });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    reset: () => set(initialState),
}));
