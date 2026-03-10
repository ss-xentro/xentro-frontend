import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/AppIcon';

const ACTIONS = [
	{ href: '/explore/institute', icon: 'landmark' as const, label: 'Explore Institutions', desc: 'Discover incubators & accelerators' },
	{ href: '/events', icon: 'calendar' as const, label: 'Events', desc: 'Browse upcoming events' },
	{ href: '/feed', icon: 'newspaper' as const, label: 'Browse Feed', desc: 'Latest updates and news' },
	{ href: '/notifications', icon: 'bell' as const, label: 'Notifications', desc: 'Check your latest alerts' },
];

export default function QuickActionsCard() {
	return (
		<Card className="p-6 h-fit">
			<h3 className="text-lg font-semibold text-(--primary) mb-4">Quick Actions</h3>
			<div className="space-y-3">
				{ACTIONS.map((a) => (
					<Link key={a.href} href={a.href} className="block">
						<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
							<AppIcon name={a.icon} className="w-5 h-5" />
							<div>
								<p className="text-sm font-medium text-(--primary)">{a.label}</p>
								<p className="text-xs text-(--secondary)">{a.desc}</p>
							</div>
						</button>
					</Link>
				))}
			</div>
		</Card>
	);
}
