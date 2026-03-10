import { Button } from '@/components/ui/Button';

interface Props {
	achievements: string[];
	achievementInput: string;
	onInputChange: (value: string) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function AchievementsSection({
	achievements, achievementInput, onInputChange, onAdd, onRemove, onKeyDown,
}: Props) {
	return (
		<>
			<div className="flex items-center gap-3 mb-5">
				<div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
					<svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
					</svg>
				</div>
				<div>
					<h3 className="text-lg font-semibold text-(--primary)">Achievements & Highlights</h3>
					<p className="text-sm text-(--secondary)">Add your key accomplishments one at a time</p>
				</div>
			</div>

			<div className="flex gap-2 mb-4">
				<input
					type="text"
					value={achievementInput}
					onChange={(e) => onInputChange(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder="e.g., Mentored 50+ startups to Series A funding"
					className="flex-1 h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) placeholder:text-(--secondary)/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light) transition-colors"
					maxLength={300}
				/>
				<Button variant="secondary" size="sm" onClick={onAdd} disabled={!achievementInput.trim()}>
					<svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add
				</Button>
			</div>

			{achievements.length > 0 ? (
				<ul className="space-y-2">
					{achievements.map((item, index) => (
						<li key={index} className="flex items-start gap-3 p-3 bg-(--surface-hover) rounded-lg group transition-colors hover:bg-(--surface-hover)/80">
							<span className="mt-0.5 text-amber-500 shrink-0">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" /></svg>
							</span>
							<span className="flex-1 text-sm text-(--primary) leading-relaxed">{item}</span>
							<button onClick={() => onRemove(index)} className="w-7 h-7 flex items-center justify-center rounded-md text-(--secondary) hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0" aria-label="Remove achievement">
								<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</li>
					))}
				</ul>
			) : (
				<div className="text-center py-6 text-(--secondary)">
					<p className="text-sm">No achievements added yet. Type one above and press Enter or click Add.</p>
				</div>
			)}

			{achievements.length > 0 && (
				<p className="mt-3 text-xs text-(--secondary)">{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} added</p>
			)}
		</>
	);
}
