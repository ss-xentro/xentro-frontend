import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
	() => import('@/components/ui/RichTextEditor').then(m => m.RichTextEditor ?? m.default),
	{ ssr: false, loading: () => <div className="h-32 bg-(--surface) rounded-lg animate-pulse" /> }
);
import RichTextDisplay from '@/components/ui/RichTextDisplay';
import { useMemo, useState } from 'react';

interface Props {
	achievements: string[];
	highlights: string[];
	achievementDraft: string;
	highlightDraft: string;
	achievementDraftCount: number;
	highlightDraftCount: number;
	onAchievementDraftChange: (value: string) => void;
	onHighlightDraftChange: (value: string) => void;
	onAddAchievement: () => void;
	onAddHighlight: () => void;
	onUpdateAchievement: (index: number, value: string) => void;
	onUpdateHighlight: (index: number, value: string) => void;
	onRemoveAchievement: (index: number) => void;
	onRemoveHighlight: (index: number) => void;
	getContentLength: (value: string) => number;
}

export default function AchievementsSection({
	achievements,
	highlights,
	achievementDraft,
	highlightDraft,
	achievementDraftCount,
	highlightDraftCount,
	onAchievementDraftChange,
	onHighlightDraftChange,
	onAddAchievement,
	onAddHighlight,
	onUpdateAchievement,
	onUpdateHighlight,
	onRemoveAchievement,
	onRemoveHighlight,
	getContentLength,
}: Props) {
	const [composerType, setComposerType] = useState<'achievement' | 'highlight'>('achievement');
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<{ type: 'achievement' | 'highlight'; index: number } | null>(null);
	const [editingValue, setEditingValue] = useState('');

	const currentDraft = composerType === 'achievement' ? achievementDraft : highlightDraft;
	const currentCount = composerType === 'achievement' ? achievementDraftCount : highlightDraftCount;

	const sectionSummary = useMemo(() => {
		return `${achievements.length} achievement${achievements.length !== 1 ? 's' : ''} and ${highlights.length} highlight${highlights.length !== 1 ? 's' : ''} added`;
	}, [achievements.length, highlights.length]);

	const handleComposerChange = (value: string) => {
		if (composerType === 'achievement') {
			onAchievementDraftChange(value);
			return;
		}
		onHighlightDraftChange(value);
	};

	const handleSaveEntry = () => {
		if (composerType === 'achievement') {
			onAddAchievement();
		} else {
			onAddHighlight();
		}
		setIsComposerOpen(false);
	};

	const handleAddNewEntry = () => {
		if (composerType === 'achievement') {
			onAchievementDraftChange('');
		} else {
			onHighlightDraftChange('');
		}
		setIsComposerOpen(true);
		cancelEditor();
	};

	const handleCancelComposer = () => {
		if (composerType === 'achievement') {
			onAchievementDraftChange('');
		} else {
			onHighlightDraftChange('');
		}
		setIsComposerOpen(false);
	};

	const openEditor = (type: 'achievement' | 'highlight', index: number, value: string) => {
		setEditingItem({ type, index });
		setEditingValue(value);
	};

	const cancelEditor = () => {
		setEditingItem(null);
		setEditingValue('');
	};

	const saveEditor = () => {
		if (!editingItem) return;
		const count = getContentLength(editingValue);
		if (count === 0 || count > 500) return;

		if (editingItem.type === 'achievement') {
			onUpdateAchievement(editingItem.index, editingValue);
		} else {
			onUpdateHighlight(editingItem.index, editingValue);
		}

		cancelEditor();
	};

	const renderList = (type: 'achievement' | 'highlight', items: string[]) => {
		const title = type === 'achievement' ? 'Achievements' : 'Highlights';

		if (items.length === 0) {
			return (
				<div className="rounded-lg border border-(--border) bg-(--surface-hover) p-4 text-sm text-(--secondary)">
					No {type}s added yet.
				</div>
			);
		}

		return (
			<div className="space-y-3">
				<h4 className="text-sm font-semibold text-(--primary)">{title}</h4>
				{items.map((item, index) => {
					const isEditing = editingItem?.type === type && editingItem.index === index;
					const count = getContentLength(isEditing ? editingValue : item);

					return (
						<div key={`${type}-${index}`} className="p-3 bg-(--surface-hover) rounded-lg border border-(--border) space-y-3">
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs font-semibold text-(--secondary)">
									{type === 'achievement' ? 'Achievement' : 'Highlight'} #{index + 1} ({count}/500)
								</span>
								<div className="flex items-center gap-2">
									{isEditing ? (
										<>
											<Button variant="secondary" size="sm" onClick={cancelEditor}>Cancel</Button>
											<Button variant="primary" size="sm" onClick={saveEditor} disabled={count === 0 || count > 500}>Save</Button>
										</>
									) : (
										<Button variant="secondary" size="sm" onClick={() => openEditor(type, index, item)}>Edit</Button>
									)}
									<button
										onClick={() => (type === 'achievement' ? onRemoveAchievement(index) : onRemoveHighlight(index))}
										className="w-8 h-8 flex items-center justify-center rounded-md text-(--secondary) hover:text-red-500 hover:bg-(--surface) transition-all shrink-0"
										aria-label={`Remove ${type}`}
									>
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>

							{isEditing ? (
								<RichTextEditor
									value={editingValue}
									onChange={setEditingValue}
									placeholder={`Update ${type}`}
									minimal
								/>
							) : (
								<RichTextDisplay html={item} compact className="rounded-md border border-(--border) bg-(--surface) p-3" />
							)}
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<>
			<div className="flex items-center gap-3 mb-5">
				<div className="w-8 h-8 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center">
					<svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
					</svg>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-(--primary)">Achievements & Highlights</h3>
					<p className="text-sm text-(--secondary)">Add rich, short entries. Each item allows up to 500 characters.</p>
				</div>
			</div>

			<div className="space-y-3">
				{isComposerOpen ? (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setComposerType('achievement')}
								className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${composerType === 'achievement' ? 'border-accent bg-(--accent-subtle) text-accent' : 'border-(--border) bg-(--surface-hover) text-(--secondary)'}`}
							>
								Achievement
							</button>
							<button
								type="button"
								onClick={() => setComposerType('highlight')}
								className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${composerType === 'highlight' ? 'border-accent bg-(--accent-subtle) text-accent' : 'border-(--border) bg-(--surface-hover) text-(--secondary)'}`}
							>
								Highlight
							</button>
						</div>
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-semibold text-(--primary)">Add {composerType === 'achievement' ? 'Achievement' : 'Highlight'}</h4>
							<span className="text-xs text-(--secondary)">{currentCount}/500</span>
						</div>
						<RichTextEditor
							value={currentDraft}
							onChange={handleComposerChange}
							placeholder={composerType === 'achievement' ? 'e.g., Mentored 50+ startups to sustainable traction' : 'e.g., Built repeatable playbooks for founder decision-making'}
							minimal
						/>
						<div className="flex justify-end gap-2">
							<Button variant="secondary" size="sm" onClick={handleCancelComposer}>
								Cancel
							</Button>
							<Button variant="primary" size="sm" onClick={handleSaveEntry} disabled={currentCount === 0 || currentCount > 500}>
								Save Entry
							</Button>
						</div>
					</div>
				) : (
					<div className="flex justify-end">
						<Button variant="secondary" size="sm" onClick={handleAddNewEntry}>
							Add New Entry
						</Button>
					</div>
				)}
			</div>

			<div className="space-y-6 mt-5">
				{renderList('achievement', achievements)}
				{renderList('highlight', highlights)}
			</div>

			{(achievements.length > 0 || highlights.length > 0) && (
				<p className="mt-3 text-xs text-(--secondary)">
					{sectionSummary}
				</p>
			)}
		</>
	);
}
