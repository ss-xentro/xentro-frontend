'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { hasValidPitchContent, hasValidPitchItem } from '@/lib/utils';
import { getSessionToken } from '@/lib/auth-utils';
import { toast } from 'sonner';
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
	PitchCustomSection,
} from '@/lib/types';
import { SECTIONS, WRITE_ROLES, CheckIcon, PlusIcon } from './_components/PitchHelpers';
import type { SectionKey } from './_components/PitchHelpers';
import PitchSectionContent from './_components/PitchSectionContent';
import PitchSectionReadOnly from './_components/PitchSectionReadOnly';

export default function PitchEditorPage() {
	const [startupId, setStartupId] = useState<string | null>(null);
	const [myRole, setMyRole] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

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
	const [customSections, setCustomSections] = useState<PitchCustomSection[]>([]);
	const [isCreatingStep, setIsCreatingStep] = useState(false);
	const [newStepTitle, setNewStepTitle] = useState('');
	const [newStepDescription, setNewStepDescription] = useState('');

	const canEdit = WRITE_ROLES.has(myRole);

	const getCustomSectionKey = useCallback((section: PitchCustomSection, index: number) => {
		return `custom-${section.id || index}`;
	}, []);

	const allSections = useMemo(() => {
		const custom = customSections.map((section, index) => ({
			key: getCustomSectionKey(section, index),
			label: section.title || `Custom Step ${index + 1}`,
			subtitle: section.shortDescription || 'Additional pitch details',
			icon: (
				<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
				</svg>
			),
		}));
		return [...SECTIONS, ...custom];
	}, [customSections, getCustomSectionKey]);

	/* ─── Completion tracking ─── */
	const sectionCompletion = useMemo(() => {
		const completion: Record<string, boolean> = {
			videoPitch: !!demoVideoUrl,
			about: hasValidPitchContent(aboutData.about) || hasValidPitchContent(aboutData.problemStatement) || hasValidPitchContent(aboutData.solutionProposed),
			competitors: competitors.some(hasValidPitchItem),
			customers: customers.some(hasValidPitchItem),
			businessModels: businessModels.some(hasValidPitchItem),
			marketSizes: marketSizes.some(hasValidPitchItem),
			visionStrategies: visionStrategies.some(hasValidPitchItem),
			impacts: impacts.some(hasValidPitchItem),
			certifications: certifications.some(hasValidPitchItem),
		};

		customSections.forEach((section, index) => {
			completion[getCustomSectionKey(section, index)] = (section.items || []).some(hasValidPitchItem);
		});

		return completion;
	}, [aboutData, competitors, customers, businessModels, marketSizes, visionStrategies, impacts, certifications, demoVideoUrl, customSections, getCustomSectionKey]);

	const completedCount = useMemo(() => Object.values(sectionCompletion).filter(Boolean).length, [sectionCompletion]);
	const totalSections = allSections.length;
	const progressPct = Math.round((completedCount / totalSections) * 100);

	useEffect(() => { fetchStartupAndPitch(); }, []);

	useEffect(() => {
		if (!allSections.some((section) => section.key === activeSection) && allSections.length > 0) {
			setActiveSection(allSections[0].key);
		}
	}, [activeSection, allSections]);

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
				if (pitchData.customSections) setCustomSections(pitchData.customSections);
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
		try {
			const token = getSessionToken('founder');
			const payload: StartupPitchData = { about: aboutData, competitors, customers, businessModels, marketSizes, visionStrategies, impacts, certifications, customSections };
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
			toast.success('All changes saved successfully.');
			setIsEditMode(false);
		} catch {
			toast.error('Failed to save. Please try again.');
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
	const currentIdx = allSections.findIndex(s => s.key === activeSection);
	const goNext = () => {
		if (currentIdx < allSections.length - 1) setActiveSection(allSections[currentIdx + 1].key);
	};
	const goPrev = () => {
		if (currentIdx > 0) setActiveSection(allSections[currentIdx - 1].key);
	};

	const handleCreateCustomStep = () => {
		const title = newStepTitle.trim();
		if (!title) {
			toast.error('Step title is required.');
			return;
		}

		const newSection: PitchCustomSection = {
			id: `temp-${Date.now()}`,
			title,
			shortDescription: newStepDescription.trim(),
			items: [],
		};

		setCustomSections((prev) => {
			const next = [...prev, newSection];
			setActiveSection(getCustomSectionKey(newSection, next.length - 1));
			return next;
		});

		setNewStepTitle('');
		setNewStepDescription('');
		setIsCreatingStep(false);
	};

	const activeCustomSectionIndex = customSections.findIndex((section, index) => getCustomSectionKey(section, index) === activeSection);
	const activeCustomSection = activeCustomSectionIndex >= 0 ? customSections[activeCustomSectionIndex] : null;

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
			{isCreatingStep && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<button
						type="button"
						aria-label="Close add section dialog"
						onClick={() => {
							setIsCreatingStep(false);
							setNewStepTitle('');
							setNewStepDescription('');
						}}
						className="absolute inset-0 bg-black/45 backdrop-blur-sm"
					/>
					<div className="relative z-10 w-full max-w-xl rounded-2xl border border-(--border) bg-background p-5 shadow-(--shadow-lg)">
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-(--primary)">Add New Section</h3>
							<p className="text-sm text-(--secondary)">Create a custom step by entering a title and short description.</p>
						</div>

						<div className="mb-4 rounded-xl border border-(--border) bg-(--surface) p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-(--secondary)">Step Description Card</p>
							<p className="mt-1 text-sm text-(--primary)">This step will be added to your pitch sidebar and its section will appear in the public profile About page footer.</p>
						</div>

						<div className="space-y-3">
							<input
								type="text"
								value={newStepTitle}
								onChange={(e) => setNewStepTitle(e.target.value)}
								placeholder="Step title"
								className="w-full rounded-lg border border-(--border) bg-background px-3 py-2 text-sm text-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
							/>
							<input
								type="text"
								value={newStepDescription}
								onChange={(e) => setNewStepDescription(e.target.value)}
								placeholder="Short description for this step"
								className="w-full rounded-lg border border-(--border) bg-background px-3 py-2 text-sm text-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
							/>
						</div>

						<div className="mt-5 flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setIsCreatingStep(false);
									setNewStepTitle('');
									setNewStepDescription('');
								}}
							>
								Cancel
							</Button>
							<Button type="button" onClick={handleCreateCustomStep}>Create Section</Button>
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl font-bold text-(--primary) tracking-tight">Pitch Deck</h1>
						<p className="text-sm text-(--secondary) mt-1">
							{canEdit ? (isEditMode ? 'Edit mode is on. Update sections and save when done.' : 'Review your pitch content. Click Edit Pitch Deck when you want to make changes.') : 'Viewing your pitch in read-only mode.'}
						</p>
					</div>
					{canEdit && (
						<div className="flex items-center gap-2">
							{isEditMode && (
								<Button type="button" variant="secondary" size="sm" onClick={() => setIsEditMode(false)}>
									Cancel
								</Button>
							)}
							<Button onClick={isEditMode ? handleSave : () => setIsEditMode(true)} isLoading={isSaving} size="sm">
								{isEditMode ? (
									<>
										<CheckIcon className="w-4 h-4 mr-1.5" />
										Save Changes
									</>
								) : (
									'Edit Pitch Deck'
								)}
							</Button>
						</div>
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
						{allSections.map((s, idx) => {
							const isActive = activeSection === s.key;
							const isDone = sectionCompletion[s.key];
							return (
								<button
									key={s.key}
									onClick={() => setActiveSection(s.key)}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${isActive ? 'bg-(--surface) shadow-(--shadow-sm) border border-(--border)' : 'hover:bg-(--surface-hover)'
										}`}
								>
									<span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${isDone ? 'bg-success/10 text-success' : isActive ? 'bg-(--primary) text-(--background)' : 'bg-(--surface-hover) text-(--secondary) group-hover:bg-(--surface-pressed)'
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
						{canEdit && isEditMode && (
							<button
								type="button"
								onClick={() => setIsCreatingStep(true)}
								className="mt-2 w-full rounded-xl border border-dashed border-gray-400/70 bg-(--surface-hover)/40 px-3 py-3 text-left transition-colors hover:bg-(--surface-hover)"
							>
								<div className="flex items-start gap-3">
									<span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-400/70 text-(--secondary)">
										<PlusIcon />
									</span>
									<div className="min-w-0">
										<p className="text-sm font-medium text-(--primary)">Add New Section</p>
										<p className="text-[11px] text-(--secondary)">Create another step for extra pitch details</p>
									</div>
								</div>
							</button>
						)}
					</div>
				</nav>

				{/* Mobile horizontal nav */}
				<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--surface)/95 backdrop-blur-lg border-t border-(--border) px-2 py-2 overflow-x-auto">
					<div className="flex gap-1 min-w-max">
						{allSections.map((s, idx) => {
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
						{canEdit && isEditMode && (
							<button
								type="button"
								onClick={() => setIsCreatingStep(true)}
								className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-400/70 text-(--secondary) min-w-20 hover:bg-(--surface-hover) transition-colors"
							>
								<PlusIcon />
								<span className="text-[10px] font-medium">New Section</span>
							</button>
						)}
					</div>
				</div>

				{/* Content area */}
				<div className="flex-1 min-w-0 pb-24 lg:pb-0">
					{/* Section header */}
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 rounded-xl bg-(--surface-hover) border border-(--border) flex items-center justify-center text-(--secondary)">
							{allSections.find(s => s.key === activeSection)?.icon}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-(--primary)">{allSections.find(s => s.key === activeSection)?.label}</h2>
							<p className="text-xs text-(--secondary)">{allSections.find(s => s.key === activeSection)?.subtitle}</p>
						</div>
					</div>

					{canEdit && isEditMode ? (
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
							activeCustomSection={activeCustomSection}
							onChangeCustomSection={(updater) => {
								if (activeCustomSectionIndex < 0) return;
								setCustomSections((prev) => prev.map((section, idx) => (
									idx === activeCustomSectionIndex ? updater(section) : section
								)));
							}}
							addItem={addItem}
							removeItem={removeItem}
							updateItem={updateItem}
						/>
					) : (
						<PitchSectionReadOnly
							activeSection={activeSection}
							demoVideoUrl={demoVideoUrl}
							aboutData={aboutData}
							competitors={competitors}
							customers={customers}
							businessModels={businessModels}
							marketSizes={marketSizes}
							visionStrategies={visionStrategies}
							impacts={impacts}
							certifications={certifications}
							activeCustomSection={activeCustomSection}
						/>
					)}

					{/* Section navigation */}
					<div className="flex items-center justify-between mt-8 pt-6 border-t border-(--border)">
						<button
							type="button"
							onClick={goPrev}
							disabled={currentIdx === 0}
							className="inline-flex items-center gap-2 text-sm font-medium text-(--secondary) hover:text-(--primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
							{currentIdx > 0 ? allSections[currentIdx - 1].label : 'Previous'}
						</button>
						{canEdit && isEditMode && <Button onClick={handleSave} isLoading={isSaving} size="sm" variant="secondary">Save Draft</Button>}
						<button
							type="button"
							onClick={goNext}
							disabled={currentIdx === allSections.length - 1}
							className="inline-flex items-center gap-2 text-sm font-medium text-(--secondary) hover:text-(--primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							{currentIdx < allSections.length - 1 ? allSections[currentIdx + 1].label : 'Next'}
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
