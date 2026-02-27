import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StartupStage = 'idea' | 'mvp' | 'early_traction' | 'growth' | 'scale';
export type StartupStatus = 'public' | 'private';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'unicorn';
export type FounderRole = 'ceo' | 'cto' | 'coo' | 'cfo' | 'cpo' | 'founder' | 'co_founder';

export type WhyXentroOption = 'mentorship' | 'invest' | 'raise_funding' | 'networking';

export interface Founder {
    name: string;
    email: string;
    role: FounderRole;
    linkedin?: string;
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
    whyXentro: WhyXentroOption | '';

    // Card 4 – Email
    primaryContactEmail: string;

    // Carried over from legacy (populated with defaults on submit)
    pitch: string;
    foundedDate: string;
    status: StartupStatus;
    location: string;
    founders: Founder[];
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
    toggleSector: (sector: string) => void;
    reset: () => void;
}

const initialData: StartupData = {
    name: '',
    tagline: '',
    logo: null,
    sectors: [],
    stage: '',
    whyXentro: '',
    primaryContactEmail: '',
    pitch: '',
    foundedDate: '',
    status: 'private',
    location: '',
    founders: [{ name: '', email: '', role: 'founder' }],
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
                        founders: [...state.data.founders, { name: '', email: '', role: 'founder' }],
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
            toggleSector: (sector) =>
                set((state) => {
                    const current = state.data.sectors;
                    const next = current.includes(sector)
                        ? current.filter(s => s !== sector)
                        : [...current, sector];
                    return { data: { ...state.data, sectors: next } };
                }),
            reset: () => set({ currentStep: 1, data: initialData }),
        }),
        {
            name: 'startup-onboarding-storage',
            version: 3,
            migrate: () => ({
                currentStep: 1,
                data: initialData,
            }),
        }
    )
);
