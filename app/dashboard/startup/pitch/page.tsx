'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { hasValidPitchContent, hasValidPitchItem } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUpload } from '@/components/ui/FileUpload';
import {
    StartupPitchData,
    PitchAbout,
    PitchCompetitor,
    PitchCustomer,
    PitchBusinessModelItem,
    PitchMarketSizeItem,
    PitchVisionStrategyItem,
    PitchImpactItem,
    PitchCertificationItem,
} from '@/lib/types';

/* ─── Section config ─── */
const SECTIONS = [
    {
        key: 'about',
        label: 'Story',
        subtitle: 'About, Problem & Solution',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        ),
    },
    {
        key: 'competitors',
        label: 'Competitors',
        subtitle: 'Competitive landscape',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
        ),
    },
    {
        key: 'customers',
        label: 'Customers',
        subtitle: 'Testimonials & proof',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        ),
    },
    {
        key: 'businessModels',
        label: 'Business Model',
        subtitle: 'Revenue & monetization',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ),
    },
    {
        key: 'marketSizes',
        label: 'Market Size',
        subtitle: 'TAM, SAM & SOM',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        ),
    },
    {
        key: 'visionStrategies',
        label: 'Vision',
        subtitle: 'Vision & strategy',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        ),
    },
    {
        key: 'impacts',
        label: 'Impact',
        subtitle: 'Social & environmental',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ),
    },
    {
        key: 'certifications',
        label: 'Certifications',
        subtitle: 'Awards & credentials',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
        ),
    },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);

/* ─── Helper: check icon ─── */
function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className || 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

/* ─── Helper: plus icon ─── */
function PlusIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    );
}

/* ─── Helper: trash icon ─── */
function TrashIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

/* ─── Empty state component ─── */
function EmptyState({ icon, title, description, action }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-(--surface-hover) border border-(--border) flex items-center justify-center text-(--secondary) mb-5">
                {icon}
            </div>
            <h4 className="text-base font-semibold text-(--primary) mb-1.5">{title}</h4>
            <p className="text-sm text-(--secondary) max-w-xs mb-6">{description}</p>
            {action}
        </div>
    );
}

/* ─── Item card wrapper ─── */
function ItemCard({ index, onRemove, canEdit, children }: {
    index: number;
    onRemove: () => void;
    canEdit: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="group relative bg-(--surface) rounded-xl border border-(--border) p-5 transition-all duration-200 hover:shadow-(--shadow-sm) animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-(--secondary) bg-(--surface-hover) px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-(--secondary-light)" />
                    Item {index + 1}
                </span>
                {canEdit && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 text-xs font-medium text-(--secondary) hover:text-error px-2 py-1 rounded-lg hover:bg-error/5 transition-all duration-200"
                    >
                        <TrashIcon /> Remove
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

export default function PitchEditorPage() {
    const [startupId, setStartupId] = useState<string | null>(null);
    const [myRole, setMyRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeSection, setActiveSection] = useState<SectionKey>('about');

    // Pitch data state
    const [aboutData, setAboutData] = useState<PitchAbout>({ about: '', problemStatement: '', solutionProposed: '' });
    const [competitors, setCompetitors] = useState<PitchCompetitor[]>([]);
    const [customers, setCustomers] = useState<PitchCustomer[]>([]);
    const [businessModels, setBusinessModels] = useState<PitchBusinessModelItem[]>([]);
    const [marketSizes, setMarketSizes] = useState<PitchMarketSizeItem[]>([]);
    const [visionStrategies, setVisionStrategies] = useState<PitchVisionStrategyItem[]>([]);
    const [impacts, setImpacts] = useState<PitchImpactItem[]>([]);
    const [certifications, setCertifications] = useState<PitchCertificationItem[]>([]);

    const canEdit = WRITE_ROLES.has(myRole);

    /* ─── Completion tracking ─── */
    const sectionCompletion = useMemo(() => {
        return {
            about: hasValidPitchContent(aboutData.about) || hasValidPitchContent(aboutData.problemStatement) || hasValidPitchContent(aboutData.solutionProposed),
            competitors: competitors.some(hasValidPitchItem),
            customers: customers.some(hasValidPitchItem),
            businessModels: businessModels.some(hasValidPitchItem),
            marketSizes: marketSizes.some(hasValidPitchItem),
            visionStrategies: visionStrategies.some(hasValidPitchItem),
            impacts: impacts.some(hasValidPitchItem),
            certifications: certifications.some(hasValidPitchItem),
        };
    }, [aboutData, competitors, customers, businessModels, marketSizes, visionStrategies, impacts, certifications]);

    const completedCount = useMemo(
        () => Object.values(sectionCompletion).filter(Boolean).length,
        [sectionCompletion]
    );
    const totalSections = SECTIONS.length;
    const progressPct = Math.round((completedCount / totalSections) * 100);

    useEffect(() => {
        fetchStartupAndPitch();
    }, []);

    // Auto-dismiss messages
    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(t);
        }
    }, [message]);

    const fetchStartupAndPitch = async () => {
        try {
            const token = localStorage.getItem('founder_token');
            if (!token) return;

            const startupRes = await fetch('/api/founder/my-startup', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const startupJson = await startupRes.json();
            if (!startupRes.ok) return;

            const startup = startupJson.data?.startup ?? startupJson;
            const sid = startup.id;
            setStartupId(sid);
            if (startupJson.data?.founderRole) setMyRole(startupJson.data.founderRole);

            const pitchRes = await fetch(`/api/startups/${sid}/pitch/`, {
                headers: { 'x-public-view': 'true' },
            });
            if (pitchRes.ok) {
                const pitchData: StartupPitchData = await pitchRes.json();
                if (pitchData.about) setAboutData(pitchData.about);
                if (pitchData.competitors) setCompetitors(pitchData.competitors);
                if (pitchData.customers) setCustomers(pitchData.customers);
                if (pitchData.businessModels) setBusinessModels(pitchData.businessModels);
                if (pitchData.marketSizes) setMarketSizes(pitchData.marketSizes);
                if (pitchData.visionStrategies) setVisionStrategies(pitchData.visionStrategies);
                if (pitchData.impacts) setImpacts(pitchData.impacts);
                if (pitchData.certifications) setCertifications(pitchData.certifications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!startupId) return;
        setIsSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('founder_token');
            const payload: StartupPitchData = {
                about: aboutData,
                competitors,
                customers,
                businessModels,
                marketSizes,
                visionStrategies,
                impacts,
                certifications,
            };

            const res = await fetch(`/api/startups/${startupId}/pitch/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save');
            setMessage({ type: 'success', text: 'All changes saved successfully.' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    /* ─── Array item helpers ─── */
    const addItem = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, template: T) => {
        setter(prev => [...prev, template]);
    }, []);

    const removeItem = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number) => {
        setter(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const updateItem = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, updates: Partial<T>) => {
        setter(prev => prev.map((item, i) => (i === idx ? { ...item, ...updates } : item)));
    }, []);

    /* ─── Navigation helpers ─── */
    const currentIdx = SECTIONS.findIndex(s => s.key === activeSection);
    const goNext = () => {
        if (currentIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[currentIdx + 1].key);
    };
    const goPrev = () => {
        if (currentIdx > 0) setActiveSection(SECTIONS[currentIdx - 1].key);
    };

    /* ─── Loading / error states ─── */
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-(--border) border-t-(--primary) animate-spin" />
                <p className="text-sm text-(--secondary)">Loading your pitch...</p>
            </div>
        );
    }

    if (!startupId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-(--primary)">Startup not found</p>
                <p className="text-xs text-(--secondary)">Please make sure you have a startup associated with your account.</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* ─── Toast message ─── */}
            {message && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-(--shadow-lg) text-sm font-medium transition-all duration-300 animate-slideInRight ${message.type === 'success'
                    ? 'bg-white border border-success/20 text-success'
                    : 'bg-white border border-error/20 text-error'
                    }`}>
                    {message.type === 'success' ? <CheckIcon className="w-4 h-4" /> : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    {message.text}
                </div>
            )}

            {/* ─── Header ─── */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-(--primary) tracking-tight">Pitch Deck</h1>
                        <p className="text-sm text-(--secondary) mt-1">
                            {canEdit
                                ? 'Build your pitch — each section appears on your public profile.'
                                : 'Viewing your pitch in read-only mode.'}
                        </p>
                    </div>
                    {canEdit && (
                        <Button onClick={handleSave} isLoading={isSaving} size="sm">
                            <CheckIcon className="w-4 h-4 mr-1.5" />
                            Save Changes
                        </Button>
                    )}
                </div>

                {/* ─── Progress bar ─── */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-(--surface-hover) rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-(--primary) to-(--primary-light) rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-(--secondary) whitespace-nowrap tabular-nums">
                        {completedCount}/{totalSections} sections
                    </span>
                </div>
            </div>

            {/* ─── Main layout: sidebar nav + content ─── */}
            <div className="flex gap-8">
                {/* ─── Sidebar nav (desktop) ─── */}
                <nav className="hidden lg:block w-56 shrink-0">
                    <div className="sticky top-8 space-y-1">
                        {SECTIONS.map((s, idx) => {
                            const isActive = activeSection === s.key;
                            const isDone = sectionCompletion[s.key];
                            return (
                                <button
                                    key={s.key}
                                    onClick={() => setActiveSection(s.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${isActive
                                        ? 'bg-(--surface) shadow-(--shadow-sm) border border-(--border)'
                                        : 'hover:bg-(--surface-hover)'
                                        }`}
                                >
                                    {/* Step indicator */}
                                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${isDone
                                        ? 'bg-success/10 text-success'
                                        : isActive
                                            ? 'bg-(--primary) text-white'
                                            : 'bg-(--surface-hover) text-(--secondary) group-hover:bg-(--surface-pressed)'
                                        }`}>
                                        {isDone ? <CheckIcon className="w-3.5 h-3.5" /> : (
                                            <span className="text-xs font-semibold">{idx + 1}</span>
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <div className={`text-sm font-medium truncate ${isActive ? 'text-(--primary)' : 'text-(--secondary) group-hover:text-(--primary)'
                                            }`}>
                                            {s.label}
                                        </div>
                                        <div className="text-[11px] text-(--secondary) truncate">{s.subtitle}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* ─── Mobile horizontal nav ─── */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--surface)/95 backdrop-blur-lg border-t border-(--border) px-2 py-2 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {SECTIONS.map((s, idx) => {
                            const isActive = activeSection === s.key;
                            const isDone = sectionCompletion[s.key];
                            return (
                                <button
                                    key={s.key}
                                    onClick={() => setActiveSection(s.key)}
                                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all min-w-15 ${isActive
                                        ? 'bg-(--primary) text-white'
                                        : isDone
                                            ? 'text-success'
                                            : 'text-(--secondary)'
                                        }`}
                                >
                                    {isDone && !isActive ? <CheckIcon className="w-3.5 h-3.5" /> : (
                                        <span className="text-[10px]">{idx + 1}</span>
                                    )}
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Content area ─── */}
                <div className="flex-1 min-w-0 pb-24 lg:pb-0">
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-(--surface-hover) border border-(--border) flex items-center justify-center text-(--secondary)">
                            {SECTIONS.find(s => s.key === activeSection)?.icon}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-(--primary)">
                                {SECTIONS.find(s => s.key === activeSection)?.label}
                            </h2>
                            <p className="text-xs text-(--secondary)">
                                {SECTIONS.find(s => s.key === activeSection)?.subtitle}
                            </p>
                        </div>
                    </div>

                    <fieldset disabled={!canEdit} className={!canEdit ? 'opacity-75' : ''}>
                        {/* ─── About / Problem / Solution ─── */}
                        {activeSection === 'about' && (
                            <div className="space-y-5 animate-fadeInUp">
                                <Card padding="none" className="overflow-hidden">
                                    <div className="px-6 py-4 bg-linear-to-r from-(--surface-hover) to-transparent border-b border-(--border)">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-(--primary)" />
                                            <span className="text-sm font-medium text-(--primary)">About Your Startup</span>
                                        </div>
                                        <p className="text-xs text-(--secondary) mt-0.5 ml-4">Give a concise overview of what your startup does.</p>
                                    </div>
                                    <div className="p-6">
                                        <RichTextEditor
                                            value={aboutData.about || ''}
                                            onChange={html => setAboutData({ ...aboutData, about: html })}
                                            placeholder="We are building..."
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </Card>

                                <Card padding="none" className="overflow-hidden">
                                    <div className="px-6 py-4 bg-linear-to-r from-error/5 to-transparent border-b border-(--border)">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-error" />
                                            <span className="text-sm font-medium text-(--primary)">Problem Statement</span>
                                        </div>
                                        <p className="text-xs text-(--secondary) mt-0.5 ml-4">What pain point or gap in the market are you addressing?</p>
                                    </div>
                                    <div className="p-6">
                                        <RichTextEditor
                                            value={aboutData.problemStatement || ''}
                                            onChange={html => setAboutData({ ...aboutData, problemStatement: html })}
                                            placeholder="The core problem is..."
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </Card>

                                <Card padding="none" className="overflow-hidden">
                                    <div className="px-6 py-4 bg-linear-to-r from-success/5 to-transparent border-b border-(--border)">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-success" />
                                            <span className="text-sm font-medium text-(--primary)">Proposed Solution</span>
                                        </div>
                                        <p className="text-xs text-(--secondary) mt-0.5 ml-4">How does your product/service solve this problem uniquely?</p>
                                    </div>
                                    <div className="p-6">
                                        <RichTextEditor
                                            value={aboutData.solutionProposed || ''}
                                            onChange={html => setAboutData({ ...aboutData, solutionProposed: html })}
                                            placeholder="Our solution works by..."
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* ─── Competitors ─── */}
                        {activeSection === 'competitors' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {competitors.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
                                            title="No competitors yet"
                                            description="Map your competitive landscape to show investors you understand the market."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setCompetitors, { name: '', description: '', logo: '', website: '' } as PitchCompetitor)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add First Competitor</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setCompetitors, { name: '', description: '', logo: '', website: '' } as PitchCompetitor)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Competitor</span>
                                                </Button>
                                            </div>
                                        )}
                                        {competitors.map((comp, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setCompetitors, idx)} canEdit={canEdit}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input label="Name" value={comp.name} onChange={e => updateItem(setCompetitors, idx, { name: e.target.value })} required placeholder="Competitor name" />
                                                    <Input label="Website" value={comp.website || ''} onChange={e => updateItem(setCompetitors, idx, { website: e.target.value })} placeholder="https://..." />
                                                </div>
                                                <div className="mt-4">
                                                    <RichTextEditor label="Description" value={comp.description || ''} onChange={html => updateItem(setCompetitors, idx, { description: html })} placeholder="What do they do? How are you different?" minimal disabled={!canEdit} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Logo</label>
                                                    <FileUpload value={comp.logo || ''} onChange={url => updateItem(setCompetitors, idx, { logo: url })} folder="pitch-competitors" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── Customers / Testimonials ─── */}
                        {activeSection === 'customers' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {customers.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                            title="No testimonials yet"
                                            description="Social proof builds trust. Add testimonials from happy customers or early users."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setCustomers, { name: '', testimonial: '', role: '', company: '', avatar: '' } as PitchCustomer)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add First Testimonial</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setCustomers, { name: '', testimonial: '', role: '', company: '', avatar: '' } as PitchCustomer)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Testimonial</span>
                                                </Button>
                                            </div>
                                        )}
                                        {customers.map((cust, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setCustomers, idx)} canEdit={canEdit}>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <Input label="Name" value={cust.name} onChange={e => updateItem(setCustomers, idx, { name: e.target.value })} required placeholder="John Doe" />
                                                    <Input label="Role" value={cust.role || ''} onChange={e => updateItem(setCustomers, idx, { role: e.target.value })} placeholder="CEO" />
                                                    <Input label="Company" value={cust.company || ''} onChange={e => updateItem(setCustomers, idx, { company: e.target.value })} placeholder="Acme Inc." />
                                                </div>
                                                <div className="mt-4">
                                                    <RichTextEditor label="Testimonial" value={cust.testimonial} onChange={html => updateItem(setCustomers, idx, { testimonial: html })} placeholder="What they said about your product..." minimal disabled={!canEdit} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Avatar</label>
                                                    <FileUpload value={cust.avatar || ''} onChange={url => updateItem(setCustomers, idx, { avatar: url })} folder="pitch-customers" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── Business Model ─── */}
                        {activeSection === 'businessModels' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {businessModels.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            title="No business model yet"
                                            description="Explain how you make money and your path to profitability."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setBusinessModels, { title: '', description: '', imageUrl: '' } as PitchBusinessModelItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add First Block</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setBusinessModels, { title: '', description: '', imageUrl: '' } as PitchBusinessModelItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Block</span>
                                                </Button>
                                            </div>
                                        )}
                                        {businessModels.map((item, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setBusinessModels, idx)} canEdit={canEdit}>
                                                <Input label="Title" value={item.title} onChange={e => updateItem(setBusinessModels, idx, { title: e.target.value })} required placeholder="Revenue stream name" />
                                                <div className="mt-4">
                                                    <RichTextEditor label="Description" value={item.description || ''} onChange={html => updateItem(setBusinessModels, idx, { description: html })} placeholder="Describe this revenue stream..." minimal disabled={!canEdit} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
                                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setBusinessModels, idx, { imageUrl: url })} folder="pitch-business-model" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── Market Size ─── */}
                        {activeSection === 'marketSizes' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {marketSizes.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                                            title="No market data yet"
                                            description="Define your Total Addressable Market, Serviceable Market, and target segments."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setMarketSizes, { title: '', description: '', imageUrl: '' } as PitchMarketSizeItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Market Data</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setMarketSizes, { title: '', description: '', imageUrl: '' } as PitchMarketSizeItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Block</span>
                                                </Button>
                                            </div>
                                        )}
                                        {marketSizes.map((item, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setMarketSizes, idx)} canEdit={canEdit}>
                                                <Input label="Title" value={item.title} onChange={e => updateItem(setMarketSizes, idx, { title: e.target.value })} required placeholder="e.g., Total Addressable Market" />
                                                <div className="mt-4">
                                                    <RichTextEditor label="Description" value={item.description || ''} onChange={html => updateItem(setMarketSizes, idx, { description: html })} placeholder="Market size details and data sources..." minimal disabled={!canEdit} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
                                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setMarketSizes, idx, { imageUrl: url })} folder="pitch-market-size" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── Vision & Strategy ─── */}
                        {activeSection === 'visionStrategies' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {visionStrategies.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                            title="No vision cards yet"
                                            description="Share your long-term vision and the strategy to get there."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setVisionStrategies, { title: '', description: '', icon: '' } as PitchVisionStrategyItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Vision Card</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setVisionStrategies, { title: '', description: '', icon: '' } as PitchVisionStrategyItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Card</span>
                                                </Button>
                                            </div>
                                        )}
                                        {visionStrategies.map((item, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setVisionStrategies, idx)} canEdit={canEdit}>
                                                <Input label="Title" value={item.title} onChange={e => updateItem(setVisionStrategies, idx, { title: e.target.value })} required placeholder="Vision milestone" />
                                                <div className="mt-4">
                                                    <RichTextEditor label="Description" value={item.description || ''} onChange={html => updateItem(setVisionStrategies, idx, { description: html })} placeholder="Describe this strategic goal..." minimal disabled={!canEdit} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Icon image (optional)</label>
                                                    <FileUpload value={item.icon || ''} onChange={url => updateItem(setVisionStrategies, idx, { icon: url })} folder="pitch-vision" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── Impact ─── */}
                        {activeSection === 'impacts' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {impacts.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            title="No impact data yet"
                                            description="Highlight your social, environmental, or economic impact and ESG alignment."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setImpacts, { title: '', description: '', imageUrl: '' } as PitchImpactItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Impact Block</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setImpacts, { title: '', description: '', imageUrl: '' } as PitchImpactItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Block</span>
                                                </Button>
                                            </div>
                                        )}
                                        {impacts.map((item, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setImpacts, idx)} canEdit={canEdit}>
                                                <Input label="Title" value={item.title} onChange={e => updateItem(setImpacts, idx, { title: e.target.value })} required placeholder="Impact area" />
                                                <div className="mt-4">
                                                    <RichTextEditor label="Description" value={item.description || ''} onChange={html => updateItem(setImpacts, idx, { description: html })} placeholder="Describe the impact..." minimal disabled={!canEdit} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
                                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setImpacts, idx, { imageUrl: url })} folder="pitch-impact" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── Certifications ─── */}
                        {activeSection === 'certifications' && (
                            <div className="space-y-4 animate-fadeInUp">
                                {certifications.length === 0 ? (
                                    <Card>
                                        <EmptyState
                                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                                            title="No certifications yet"
                                            description="Add awards, certifications, or standards your startup has earned."
                                            action={canEdit ? (
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setCertifications, { title: '', issuer: '', dateAwarded: '', imageUrl: '' } as PitchCertificationItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Certification</span>
                                                </Button>
                                            ) : undefined}
                                        />
                                    </Card>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <div className="flex justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => addItem(setCertifications, { title: '', issuer: '', dateAwarded: '', imageUrl: '' } as PitchCertificationItem)}>
                                                    <PlusIcon /> <span className="ml-1.5">Add Certification</span>
                                                </Button>
                                            </div>
                                        )}
                                        {certifications.map((item, idx) => (
                                            <ItemCard key={idx} index={idx} onRemove={() => removeItem(setCertifications, idx)} canEdit={canEdit}>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <Input label="Title" value={item.title} onChange={e => updateItem(setCertifications, idx, { title: e.target.value })} required placeholder="Certification name" />
                                                    <Input label="Issuer" value={item.issuer || ''} onChange={e => updateItem(setCertifications, idx, { issuer: e.target.value })} placeholder="Issuing organization" />
                                                    <Input label="Date Awarded" type="date" value={item.dateAwarded || ''} onChange={e => updateItem(setCertifications, idx, { dateAwarded: e.target.value })} />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-(--primary) mb-2">Certificate Image</label>
                                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setCertifications, idx, { imageUrl: url })} folder="pitch-certifications" accept="image/*" />
                                                </div>
                                            </ItemCard>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </fieldset>

                    {/* ─── Section navigation ─── */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-(--border)">
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={currentIdx === 0}
                            className="inline-flex items-center gap-2 text-sm font-medium text-(--secondary) hover:text-(--primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            {currentIdx > 0 ? SECTIONS[currentIdx - 1].label : 'Previous'}
                        </button>

                        {canEdit && (
                            <Button onClick={handleSave} isLoading={isSaving} size="sm" variant="secondary">
                                Save Draft
                            </Button>
                        )}

                        <button
                            type="button"
                            onClick={goNext}
                            disabled={currentIdx === SECTIONS.length - 1}
                            className="inline-flex items-center gap-2 text-sm font-medium text-(--secondary) hover:text-(--primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            {currentIdx < SECTIONS.length - 1 ? SECTIONS[currentIdx + 1].label : 'Next'}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
