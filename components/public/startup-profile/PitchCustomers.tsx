'use client';

import { Card } from '@/components/ui';
import type { PitchCustomer } from './types';

interface PitchCustomersProps {
	customers: PitchCustomer[];
}

export function PitchCustomers({ customers }: PitchCustomersProps) {
	if (customers.length === 0) return null;

	return (
		<section>
			<h2 className="text-xl font-bold text-(--primary) mb-6">What Our Customers Say</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{customers.map((customer, idx) => (
					<Card key={idx} className="p-6 hover:shadow-md transition-all">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-100 to-violet-100 flex items-center justify-center shrink-0 overflow-hidden">
								{customer.avatar ? (
									<img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
								) : (
									<span className="text-lg font-bold text-purple-600">{customer.name.charAt(0)}</span>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-(--secondary) italic mb-3 leading-relaxed">&ldquo;{customer.testimonial}&rdquo;</p>
								<div>
									<p className="font-semibold text-(--primary) text-sm">{customer.name}</p>
									<p className="text-xs text-(--secondary)">
										{[customer.role, customer.company].filter(Boolean).join(' · ')}
									</p>
								</div>
							</div>
						</div>
					</Card>
				))}
			</div>
		</section>
	);
}
