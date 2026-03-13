import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import RichTextDisplay from '@/components/ui/RichTextDisplay';

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

			<div className="space-y-6">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-semibold text-(--primary)">Add Achievement</h4>
						<span className="text-xs text-(--secondary)">{achievementDraftCount}/500</span>
					</div>
					<RichTextEditor
						value={achievementDraft}
						onChange={onAchievementDraftChange}
						placeholder="e.g., Mentored 50+ startups to sustainable traction"
						minimal
					/>
					<div className="flex justify-end">
						<Button variant="secondary" size="sm" onClick={onAddAchievement} disabled={achievementDraftCount === 0 || achievementDraftCount > 500}>
							Add Achievement
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-semibold text-(--primary)">Add Highlight</h4>
						<span className="text-xs text-(--secondary)">{highlightDraftCount}/500</span>
					</div>
					<RichTextEditor
						value={highlightDraft}
						onChange={onHighlightDraftChange}
						placeholder="e.g., Built repeatable playbooks for founder decision-making"
						minimal
					/>
					<div className="flex justify-end">
						<Button variant="secondary" size="sm" onClick={onAddHighlight} disabled={highlightDraftCount === 0 || highlightDraftCount > 500}>
							Add Highlight
						</Button>
					</div>
				</div>
			</div>

			{achievements.length > 0 ? (
				<ul className="space-y-3 mt-5">
					{achievements.map((item, index) => (
						<li key={index} className="p-3 bg-(--surface-hover) rounded-lg space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-(--secondary)">Achievement #{index + 1} ({getContentLength(item)}/500)</span>
								<button onClick={() => onRemoveAchievement(index)} className="w-7 h-7 flex items-center justify-center rounded-md text-(--secondary) hover:text-red-500 hover:bg-(--surface) transition-all shrink-0" aria-label="Remove achievement">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<RichTextEditor value={item} onChange={(value) => onUpdateAchievement(index, value)} minimal />
							<RichTextDisplay html={item} compact className="rounded-md border border-(--border) bg-(--surface) p-3" />
						</li>
					))}
				</ul>
			) : (
				<div className="text-center py-4 text-(--secondary)">
					<p className="text-sm">No achievements added yet.</p>
				</div>
			)}

			{highlights.length > 0 ? (
				<ul className="space-y-3 mt-5">
					{highlights.map((item, index) => (
						<li key={index} className="p-3 bg-(--surface-hover) rounded-lg space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-(--secondary)">Highlight #{index + 1} ({getContentLength(item)}/500)</span>
								<button onClick={() => onRemoveHighlight(index)} className="w-7 h-7 flex items-center justify-center rounded-md text-(--secondary) hover:text-red-500 hover:bg-(--surface) transition-all shrink-0" aria-label="Remove highlight">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<RichTextEditor value={item} onChange={(value) => onUpdateHighlight(index, value)} minimal />
							<RichTextDisplay html={item} compact className="rounded-md border border-(--border) bg-(--surface) p-3" />
						</li>
					))}
				</ul>
			) : (
				<div className="text-center py-6 text-(--secondary)">
					<p className="text-sm">No highlights added yet.</p>
				</div>
			)}

			{(achievements.length > 0 || highlights.length > 0) && (
				<p className="mt-3 text-xs text-(--secondary)">
					{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} and {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} added
				</p>
			)}
		</>
	);
}
