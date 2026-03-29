import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InvestorProfile, formatCurrency } from '../_lib/constants';

interface InvestmentProfileCardProps {
	profile: InvestorProfile | null;
}

export default function InvestmentProfileCard({ profile }: InvestmentProfileCardProps) {
	const portfolioCount = profile?.portfolioCompanies?.length ?? 0;
	const investmentCount = profile?.notableInvestments?.length ?? 0;

	return (
		<Card className="lg:col-span-2 p-6 h-fit space-y-5">
			<h3 className="text-lg font-semibold text-(--primary)">Investment Profile</h3>

			{profile?.firmName && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider">Firm</p>
					<p className="text-sm font-medium text-(--primary)">{profile.firmName}</p>
				</div>
			)}

			{(profile?.checkSizeMin || profile?.checkSizeMax) && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider">Check Size</p>
					<p className="text-sm font-medium text-(--primary)">
						{profile.checkSizeMin ? formatCurrency(Number(profile.checkSizeMin)) : '—'}
						{' — '}
						{profile.checkSizeMax ? formatCurrency(Number(profile.checkSizeMax)) : '—'}
						{' '}{profile?.currency || 'USD'}
					</p>
				</div>
			)}

			{profile?.investmentStages && profile.investmentStages.length > 0 && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider mb-1">Stages</p>
					<div className="flex flex-wrap gap-2">
						{profile.investmentStages.map((stage) => (
							<span key={stage} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200">
								{stage}
							</span>
						))}
					</div>
				</div>
			)}

			{profile?.sectors && profile.sectors.length > 0 && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider mb-1">Focus Sectors</p>
					<div className="flex flex-wrap gap-2">
						{profile.sectors.map((sector) => (
							<span key={sector} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200">
								{sector}
							</span>
						))}
					</div>
				</div>
			)}

			{profile?.dealFlowPreferences && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider">Deal Flow Preferences</p>
					<p className="text-sm text-(--primary) mt-0.5">{profile.dealFlowPreferences}</p>
				</div>
			)}

			{portfolioCount > 0 && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider mb-2">Portfolio Companies</p>
					<div className="space-y-1">
						{profile!.portfolioCompanies.map((co) => (
							<div key={co.id} className="flex items-center gap-2 text-sm">
								<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
								{co.url ? (
									<a href={co.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
										{co.name}
									</a>
								) : (
									<span className="text-(--primary)">{co.name}</span>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{investmentCount > 0 && (
				<div>
					<p className="text-xs text-(--secondary) uppercase tracking-wider mb-2">Notable Investments</p>
					<div className="space-y-1">
						{profile!.notableInvestments.map((inv) => (
							<div key={inv.id} className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
									<span className="text-(--primary)">{inv.name}</span>
								</div>
								{inv.amount && (
									<span className="text-(--secondary) text-xs">
										{formatCurrency(inv.amount)}
									</span>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{!profile && (
				<div className="text-center py-4">
					<p className="text-(--secondary)">No investor profile found.</p>
					<Link href="/investor-onboarding">
						<Button className="mt-3" size="sm">Complete Onboarding</Button>
					</Link>
				</div>
			)}
		</Card>
	);
}
