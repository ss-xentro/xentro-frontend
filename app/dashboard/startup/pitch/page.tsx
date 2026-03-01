'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { hasValidPitchContent, hasValidPitchItem } from '@/lib/utils';
import { getSessionToken } from '@/lib/auth-utils';
import { Button } from '@/components/ui/Button';
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
import { SECTIONS, WRITE_ROLES, CheckIcon } from './_components/PitchHelpers';
import type { SectionKey } from './_components/PitchHelpers';
import PitchSectionContent from './_components/PitchSectionContent';

export default function PitchEditorPage() {
	const [startupId, setStartupId] = useState<string | null>(null);
	const [myRole, setMyRole] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [activeSection, setActiveSection] = useState<SectionKey>('videoPitch');

	const [demoVideoUrl, setDemoVideoUrl] = useState<string | null>(null);
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
	const sectionCompletion = useMemo(() => ({
		videoPitch: !!demoVideoUrl,
		about: hasValidPitchContent(aboutData.about) || hasValidPitchContent(aboutData.problemStatement) || hasValidPitchContent(aboutData.solutionProposed),
		competitors: competitors.some(hasValidPitchItem),
		customers: customers.some(hasValidPitchItem),
		businessModels: businessModels.some(hasValidPitchItem),
		marketSizes: marketSizes.some(hasValidPitchItem),
		visionStrategies: visionStrategies.some(hasValidPitchItem),
		impacts: impacts.some(hasValidPitchItem),
		certifications: certifications.some(hasValidPitchItem),
	}), [aboutData, competitors, customers, businessModels, marketSizes, visionStrategies, impacts, certifications, demoVideoUrl]);

	const completedCount = useMemo(() => Object.values(sectionCompletion).filter(Boolean).length, [sectionCompletion]);
	const totalSections = SECTIONS.length;
	const progressPct = Math.round((completedCount / totalSections) * 100);

	useEffect(() => { fetchStartupAndPitch(); }, []);
	useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); } }, [message]);

	const fetchStartupAndPitch = async () => {
		try {
			const token = getSessionToken('founder');
			if (!token) return;
			const startupRes = await fetch('/api/founder/my-startup', { headers: { Authorization: `Bearer ${token}` } });
			const startupJson = await startupRes.json();
			if (!startupRes.ok) return;
			const startup = startupJson.data?.startup ?? startupJson;
			const sid = startup.id;
			setStartupId(sid);
			if (startupJson.data?.founderRole) setMyRole(startupJson.data.founderRole);
			if (startup.demoVideoUrl) setDemoVideoUrl(startup.demoVideoUrl);

			const pitchRes = await fetch(`/api/startups/${sid}/pitch/`, { headers: { 'x-public-view': 'true' } });
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
			const token = getSessionToken('founder');
			const payload: StartupPitchData = { about: aboutData, competitors, customers, businessModels, marketSizes, visionStrategies, impacts, certifications };
			const res = await fetch(`/api/startups/${startupId}/pitch/`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error('Failed to save pitch sections');
			const startupRes = await fetch(`/api/founder/startups/${startupId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ demoVideoUrl }),
			});
			if (!startupRes.ok) throw new Error('Failed to save video pitch');
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

	/* ─── Navigation ─── */
	const currentIdx = SECTIONS.findIndex(s => s.key === activeSection);
	const goNext = () => {
		if (currentIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[currentIdx + 1].key);
	};
	const goPrev = () => {
		if (currentIdx > 0) setActiveSection(SECTIONS[currentIdx - 1].key);
	};

	/* ─── Loading state ─── */
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
			{/* Toast */}
			{message && (
				<div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-(--shadow-lg) text-sm font-medium transition-all duration-300 animate-slideInRight ${message.type === 'success' ? 'bg-white border border-success/20 text-success' : 'bg-white border border-error/20 text-error'
					}`}>
					{message.type === 'success' ? <CheckIcon className="w-4 h-4" /> : (
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
					)}
					{message.text}
				</div>
			)}

			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl font-bold text-(--primary) tracking-tight">Pitch Deck</h1>
						<p className="text-sm text-(--secondary) mt-1">
							{canEdit ? 'Build your pitch — each section appears on your public profile.' : 'Viewing your pitch in read-only mode.'}
						</p>
					</div>
					{canEdit && (
						<Button onClick={handleSave} isLoading={isSaving} size="sm">
							<CheckIcon className="w-4 h-4 mr-1.5" />
							Save Changes
						</Button>
					)}
				</div>
				<div className="flex items-center gap-4">
					<div className="flex-1 h-1.5 bg-(--surface-hover) rounded-full overflow-hidden">
						<div className="h-full bg-linear-to-r from-(--primary) to-(--primary-light) rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
					</div>
					<span className="text-xs font-medium text-(--secondary) whitespace-nowrap tabular-nums">{completedCount}/{totalSections} sections</span>
				</div>
			</div>

			{/* Main layout */}
			<div className="flex gap-8">
				{/* Sidebar nav (desktop) */}
				<nav className="hidden lg:block w-56 shrink-0">
					<div className="sticky top-8 space-y-1">
						{SECTIONS.map((s, idx) => {
							const isActive = activeSection === s.key;
							const isDone = sectionCompletion[s.key];
							return (
								<button
									key={s.key}
									onClick={() => setActiveSection(s.key)}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${isActive ? 'bg-(--surface) shadow-(--shadow-sm) border border-(--border)' : 'hover:bg-(--surface-hover)'
										}`}
								>
									<span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${isDone ? 'bg-success/10 text-success' : isActive ? 'bg-(--primary) text-white' : 'bg-(--surface-hover) text-(--secondary) group-hover:bg-(--surface-pressed)'
										}`}>
										{isDone ? <CheckIcon className="w-3.5 h-3.5" /> : <span className="text-xs font-semibold">{idx + 1}</span>}
									</span>
									<div className="min-w-0">
										<div className={`text-sm font-medium truncate ${isActive ? 'text-(--primary)' : 'text-(--secondary) group-hover:text-(--primary)'}`}>{s.label}</div>
										<div className="text-[11px] text-(--secondary) truncate">{s.subtitle}</div>
									</div>
								</button>
							);
						})}
					</div>
				</nav>

				{/* Mobile horizontal nav */}
				<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--surface)/95 backdrop-blur-lg border-t border-(--border) px-2 py-2 overflow-x-auto">
					<div className="flex gap-1 min-w-max">
						{SECTIONS.map((s, idx) => {
							const isActive = activeSection === s.key;
							const isDone = sectionCompletion[s.key];
							return (
								<button
									key={s.key}
									onClick={() => setActiveSection(s.key)}
									className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all min-w-15 ${isActive ? 'bg-(--primary) text-white' : isDone ? 'text-success' : 'text-(--secondary)'
										}`}
								>
									{isDone && !isActive ? <CheckIcon className="w-3.5 h-3.5" /> : <span className="text-[10px]">{idx + 1}</span>}
									{s.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Content area */}
				<div className="flex-1 min-w-0 pb-24 lg:pb-0">
					{/* Section header */}
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 rounded-xl bg-(--surface-hover) border border-(--border) flex items-center justify-center text-(--secondary)">
							{SECTIONS.find(s => s.key === activeSection)?.icon}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-(--primary)">{SECTIONS.find(s => s.key === activeSection)?.label}</h2>
							<p className="text-xs text-(--secondary)">{SECTIONS.find(s => s.key === activeSection)?.subtitle}</p>
						</div>
					</div>

					<fieldset disabled={!canEdit} className={!canEdit ? 'opacity-75' : ''}>
						<PitchSectionContent
							activeSection={activeSection}
							canEdit={canEdit}
							demoVideoUrl={demoVideoUrl}
							setDemoVideoUrl={setDemoVideoUrl}
							aboutData={aboutData}
							setAboutData={setAboutData}
							competitors={competitors}
							setCompetitors={setCompetitors}
							customers={customers}
							setCustomers={setCustomers}
							businessModels={businessModels}
							setBusinessModels={setBusinessModels}
							marketSizes={marketSizes}
							setMarketSizes={setMarketSizes}
							visionStrategies={visionStrategies}
							setVisionStrategies={setVisionStrategies}
							impacts={impacts}
							setImpacts={setImpacts}
							certifications={certifications}
							setCertifications={setCertifications}
							addItem={addItem}
							removeItem={removeItem}
							updateItem={updateItem}
						/>
					</fieldset>

					{/* Section navigation */}
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
						{canEdit && <Button onClick={handleSave} isLoading={isSaving} size="sm" variant="secondary">Save Draft</Button>}
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
