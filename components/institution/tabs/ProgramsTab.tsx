import { Card, Badge } from '@/components/ui';
import { Program } from '../institution-tabs-config';

export default function ProgramsTab({ programs }: { programs: Program[] }) {
	return (
		<div>
			<h2 className="text-xl font-bold text-(--primary) mb-4">Active Programs</h2>
			{programs.length > 0 ? (
				<div className="space-y-4">
					{programs.map((program) => (
						<Card key={program.id} className="flex gap-4 p-6 bg-(--accent-subtle) border-(--border) border" hoverable>
							<div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 shrink-0">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<div>
								<h3 className="font-bold text-(--primary) text-lg">{program.name}</h3>
								<p className="text-(--secondary) mt-1 mb-3">{program.description ?? 'No description provided.'}</p>
								<div className="flex gap-3">
									<Badge variant="outline" className="border-(--border) text-(--primary-light)">{program.type}</Badge>
									{program.duration && <Badge variant="info" className="border-(--border) text-(--primary-light)">{program.duration}</Badge>}
								</div>
							</div>
						</Card>
					))}
				</div>
			) : (
				<p className="text-(--secondary) italic">No active programs listed.</p>
			)}
		</div>
	);
}
