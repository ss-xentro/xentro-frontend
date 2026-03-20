import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StartupStage = 'ideation' | 'pre_seed_prototype' | 'seed_mvp' | 'early_traction' | 'growth' | 'scaling';
export type StartupStatus = 'public' | 'private';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'unicorn';
export type FounderRole = 'founder' | 'co_founder';
export type TeamMemberRole = 'team_member' | 'employee';



export interface Founder {
    id?: string;
    name: string;
    email: string;
    role: FounderRole;
    title?: string;
    avatar?: string | null;
    bio?: string;
}

export interface TeamMember {
    id?: string;
    name: string;
    email: string;
    role: TeamMemberRole;
    title?: string;
    avatar?: string | null;
    bio?: string;
}

export interface StartupData {
    // Card 1 – Identity
    name: string;
    tagline: string;
    logo: string | null;

    // Card 2 – Sector & Stage
    sectors: string[];
    stage: StartupStage | '';

    // Card 3 – Why Xentro
    whyXentro: string[];
    whyXentroOther: string;

    // Card 4 – Email
    primaryContactEmail: string;

    // Carried over from legacy (populated with defaults on submit)
    pitch: string;
    foundedDate: string;
    status: StartupStatus;
    location: string;
    founders: Founder[];
    teamMembers: TeamMember[];
    fundingRound: FundingRound;
    fundsRaised: string;
    fundingCurrency: string;
    investors: string[];
}

export function createInitialStartupData(): StartupData {
    return {
        name: '',
        tagline: '',
        logo: null,
        sectors: [],
        stage: '',
        whyXentro: [],
        whyXentroOther: '',
        primaryContactEmail: '',
        pitch: '',
        foundedDate: '',
        status: 'public',
        location: '',
        founders: [{ id: undefined, name: '', email: '', role: 'founder', title: 'Founder', avatar: null, bio: '' }],
        teamMembers: [],
        fundingRound: 'bootstrapped',
        fundsRaised: '',
        fundingCurrency: 'USD',
        investors: [],
    };
}

export function createSignupDraftData(data: Pick<StartupData, 'name' | 'primaryContactEmail'>): StartupData {
    return {
        ...createInitialStartupData(),
        name: data.name,
        primaryContactEmail: data.primaryContactEmail,
    };
}

interface StartupOnboardingStore {
    currentStep: number;
    data: StartupData;
    setStep: (step: number) => void;
    updateData: (data: Partial<StartupData>) => void;
    addFounder: () => void;
    updateFounder: (index: number, founder: Partial<Founder>) => void;
    removeFounder: (index: number) => void;
    addTeamMember: () => void;
    updateTeamMember: (index: number, member: Partial<TeamMember>) => void;
    removeTeamMember: (index: number) => void;
    toggleSector: (sector: string) => void;
    toggleWhyXentro: (option: string) => void;
    resetToSignupDraft: () => void;
    reset: () => void;
}

const initialData = createInitialStartupData();

export const useStartupOnboardingStore = create<StartupOnboardingStore>()(
    persist(
        (set) => ({
            currentStep: 1,
            data: initialData,
            setStep: (step) => set({ currentStep: step }),
            updateData: (newData) =>
                set((state) => ({ data: { ...state.data, ...newData } })),
            addFounder: () =>
                set((state) => ({
                    data: {
                        ...state.data,
                        founders: [...state.data.founders, { id: undefined, name: '', email: '', role: 'co_founder', title: 'Co-Founder', avatar: null, bio: '' }],
                    },
                })),
            updateFounder: (index, founder) =>
                set((state) => {
                    const newFounders = [...state.data.founders];
                    newFounders[index] = { ...newFounders[index], ...founder };
                    return { data: { ...state.data, founders: newFounders } };
                }),
            removeFounder: (index) =>
                set((state) => {
                    const newFounders = state.data.founders.filter((_, i) => i !== index);
                    return { data: { ...state.data, founders: newFounders } };
                }),
            addTeamMember: () =>
                set((state) => ({
                    data: {
                        ...state.data,
                        teamMembers: [...state.data.teamMembers, { id: undefined, name: '', email: '', role: 'team_member', title: '', avatar: null, bio: '' }],
                    },
                })),
            updateTeamMember: (index, member) =>
                set((state) => {
                    const nextTeamMembers = [...state.data.teamMembers];
                    nextTeamMembers[index] = { ...nextTeamMembers[index], ...member };
                    return { data: { ...state.data, teamMembers: nextTeamMembers } };
                }),
            removeTeamMember: (index) =>
                set((state) => ({
                    data: {
                        ...state.data,
                        teamMembers: state.data.teamMembers.filter((_, i) => i !== index),
                    },
                })),
            toggleSector: (sector) =>
                set((state) => {
                    const current = state.data.sectors;
                    const next = current.includes(sector)
                        ? current.filter(s => s !== sector)
                        : [...current, sector];
                    return { data: { ...state.data, sectors: next } };
                }),
            toggleWhyXentro: (option) =>
                set((state) => {
                    const current = state.data.whyXentro;
                    const next = current.includes(option)
                        ? current.filter(o => o !== option)
                        : [...current, option];
                    return { data: { ...state.data, whyXentro: next } };
                }),
            resetToSignupDraft: () =>
                set((state) => ({
                    currentStep: 1,
                    data: createSignupDraftData({
                        name: state.data.name,
                        primaryContactEmail: state.data.primaryContactEmail,
                    }),
                })),
            reset: () => set({ currentStep: 1, data: createInitialStartupData() }),
        }),
        {
            name: 'startup-onboarding-storage',
            version: 4,
            migrate: () => ({
                currentStep: 1,
                data: createInitialStartupData(),
            }),
        }
    )
);
