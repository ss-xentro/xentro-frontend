'use client';

import { Card, Button } from '@/components/ui';

interface AchievementsCardProps {
	achievements: string[];
	setAchievements: (a: string[]) => void;
	achievementInput: string;
	setAchievementInput: (v: string) => void;
}

export function AchievementsCard({ achievements, setAchievements, achievementInput, setAchievementInput }: AchievementsCardProps) {
	const addAchievement = () => {
		const text = achievementInput.trim();
		if (!text) return;
		setAchievements([...achievements, text]);
		setAchievementInput('');
	};
	const removeAchievement = (i: number) => setAchievements(achievements.filter((_, idx) => idx !== i));

	return (
		<Card className="p-6 space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">Achievements &amp; Highlights</h3>
			<p className="text-sm text-gray-500">Add key accomplishments one at a time</p>
			<div className="flex gap-2">
				<input
					type="text"
					value={achievementInput}
					onChange={(e) => setAchievementInput(e.target.value)}
					onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(); } }}
					placeholder="e.g., Mentored 50+ startups to Series A"
					className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
					maxLength={300}
				/>
				<Button variant="secondary" size="sm" onClick={addAchievement} disabled={!achievementInput.trim()}>Add</Button>
			</div>
			{achievements.length > 0 && (
				<ul className="space-y-2">
					{achievements.map((item, i) => (
						<li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
							<span className="mt-0.5 text-amber-500">&bull;</span>
							<span className="flex-1 text-sm text-gray-800">{item}</span>
							<button onClick={() => removeAchievement(i)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
}
