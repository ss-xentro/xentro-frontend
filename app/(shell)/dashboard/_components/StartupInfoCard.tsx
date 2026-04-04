'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { startupStageLabels, fundingRoundLabels } from '@/lib/types/labels';
import type { StartupStage, FundingRound } from '@/lib/types/startups';
import type { StartupData } from './types';

export function StartupInfoCard({ startup, founderRole }: { startup: StartupData; founderRole: string }) {
	return (
		<Card className="p-6">
			<div className="flex flex-col md:flex-row gap-6">
				{/* Logo */}
				<div className="w-24 h-24 rounded-xl bg-(--surface-hover) shrink-0 flex items-center justify-center border border-(--border) overflow-hidden">
					{startup.logo ? (
						<img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
					) : (
						<span className="text-2xl font-bold text-(--secondary)">
							{(startup?.name ?? '').substring(0, 2).toUpperCase()}
						</span>
					)}
				</div>

				<div className="flex-1 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center gap-3">
						<h2 className="text-xl font-bold text-(--primary)">{startup.name}</h2>
						<div className="flex flex-wrap gap-2">
							<Badge variant={startup.status === 'active' ? 'success' : 'secondary'}>
								{startup.status}
							</Badge>
							<Badge variant="info">{startupStageLabels[startup.stage as StartupStage]?.label ?? startup.stage}</Badge>
							<Badge variant="outline">{fundingRoundLabels[startup.fundingRound as FundingRound]?.label ?? startup.fundingRound}</Badge>
						</div>
					</div>

					<p className="text-(--primary) opacity-80 max-w-2xl">
						{startup.tagline || "No tagline set."}
					</p>

					<div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-(--secondary)">
						<div>
							<span className="font-medium text-(--primary)">Founded:</span>{' '}
							{new Date(startup.foundedDate).toLocaleDateString()}
						</div>
						<div>
							<span className="font-medium text-(--primary)">Funds Raised:</span>{' '}
							${Number(startup.fundsRaised || 0).toLocaleString()}
						</div>
						<div>
							<span className="font-medium text-(--primary)">Role:</span>{' '}
							<span className="capitalize">{(founderRole ?? '').replace('_', ' ')}</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
