import { Card } from '@/components/ui/Card';
import { STAT_CARDS } from '../_lib/constants';
import { formatCurrency } from '../_lib/constants';

interface StatsGridProps {
	sectorCount: number;
	portfolioCount: number;
	totalInvested: number;
	investmentCount: number;
}

export default function StatsGrid({ sectorCount, portfolioCount, totalInvested, investmentCount }: StatsGridProps) {
	const values = [
		String(sectorCount),
		String(portfolioCount),
		totalInvested > 0 ? formatCurrency(totalInvested) : '$0',
		String(investmentCount),
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{STAT_CARDS.map((card, i) => (
				<Card key={card.label} className="p-6">
					<div className="flex items-center gap-4">
						<div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center`}>
							<svg className={`w-6 h-6 ${card.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
							</svg>
						</div>
						<div>
							<p className="text-sm text-(--secondary)">{card.label}</p>
							<p className="text-2xl font-bold text-(--primary)">{values[i]}</p>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
