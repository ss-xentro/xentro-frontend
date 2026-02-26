import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StartupStage = 'idea' | 'mvp' | 'early_traction' | 'growth' | 'scale';
export type StartupStatus = 'active' | 'stealth' | 'paused' | 'acquired' | 'shut_down';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'unicorn';
export type FounderRole = 'ceo' | 'cto' | 'coo' | 'cfo' | 'cpo' | 'founder' | 'co_founder';

export interface Founder {
    name: string;
    email: string;
    role: FounderRole;
    linkedin?: string;
}

export interface StartupData {
    // Identity
    name: string;
    tagline: string;
    logo: string | null;
    pitch: string;

    // Details
    foundedDate: string; // ISO string
    stage: StartupStage | '';
    status: StartupStatus;
    location: string;

    // Founders
    founders: Founder[];
    primaryContactEmail: string;

    // Funding
    fundingRound: FundingRound;
    fundsRaised: string;
    fundingCurrency: string;
    investors: string[]; // List of names
}

interface StartupOnboardingStore {
    currentStep: number;
    data: StartupData;
    setStep: (step: number) => void;
    updateData: (data: Partial<StartupData>) => void;
    addFounder: () => void;
    updateFounder: (index: number, founder: Partial<Founder>) => void;
    removeFounder: (index: number) => void;
    reset: () => void;
}

const initialData: StartupData = {
    name: '',
    tagline: '',
    logo: null,
    pitch: '',
    foundedDate: '',
    stage: '',
    status: 'active',
    location: '',
    founders: [{ name: '', email: '', role: 'founder' }],
    primaryContactEmail: '',
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
                    // Sync primary contact if updating first founder
                    if (index === 0 && founder.email !== undefined) {
                        newData.primaryContactEmail = founder.email;
                    }
                    return { data: newData };
                }),
            removeFounder: (index) =>
                set((state) => {
                    const newFounders = state.data.founders.filter((_, i) => i !== index);

                    const newData = { ...state.data, founders: newFounders };
                    // Sync primary contact to new first founder
                    if (newFounders.length > 0) {
                        newData.primaryContactEmail = newFounders[0].email;
                    } else {
                        newData.primaryContactEmail = '';
                    }

                    return {
                        data: newData,
                    };
                }),
            reset: () => set({ currentStep: 1, data: initialData }),
        }),
        {
            name: 'startup-onboarding-storage',
            version: 2,
            migrate: () => ({
                currentStep: 1,
                data: initialData,
            }),
        }
    )
);
