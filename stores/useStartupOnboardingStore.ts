import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StartupStage = 'ideation' | 'pre_seed_prototype' | 'seed_mvp' | 'early_traction' | 'growth' | 'scaling';
export type StartupStatus = 'public' | 'private';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'unicorn';
export type FounderRole = 'founder' | 'co_founder';
export type TeamMemberRole = 'team_member' | 'employee';



export interface Founder {
    name: string;
    email: string;
    role: FounderRole;
    title?: string;
    avatar?: string | null;
}

export interface TeamMember {
    name: string;
    email: string;
    role: TeamMemberRole;
    title?: string;
    avatar?: string | null;
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
    reset: () => void;
}

const initialData: StartupData = {
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
    status: 'private',
    location: '',
    founders: [{ name: '', email: '', role: 'founder', title: 'Founder', avatar: null }],
    teamMembers: [],
    fundingRound: 'bootstrapped',
    fundsRaised: '',
    fundingCurrency: 'USD',
    investors: [],
};

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
                        founders: [...state.data.founders, { name: '', email: '', role: 'co_founder', title: 'Co-Founder', avatar: null }],
                    },
                })),
            updateFounder: (index, founder) =>
                set((state) => {
                    const newFounders = [...state.data.founders];
                    newFounders[index] = { ...newFounders[index], ...founder };

                    const newData = { ...state.data, founders: newFounders };
                    if (index === 0 && founder.email !== undefined) {
                        newData.primaryContactEmail = founder.email;
                    }
                    return { data: newData };
                }),
            removeFounder: (index) =>
                set((state) => {
                    const newFounders = state.data.founders.filter((_, i) => i !== index);
                    const newData = { ...state.data, founders: newFounders };
                    if (newFounders.length > 0) {
                        newData.primaryContactEmail = newFounders[0].email;
                    } else {
                        newData.primaryContactEmail = '';
                    }
                    return { data: newData };
                }),
            addTeamMember: () =>
                set((state) => ({
                    data: {
                        ...state.data,
                        teamMembers: [...state.data.teamMembers, { name: '', email: '', role: 'team_member', title: '', avatar: null }],
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
            reset: () => set({ currentStep: 1, data: initialData }),
        }),
        {
            name: 'startup-onboarding-storage',
            version: 4,
            migrate: () => ({
                currentStep: 1,
                data: initialData,
            }),
        }
    )
);
