'use client';

import type { PitchCustomer } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchCustomersProps {
	customers: PitchCustomer[];
}

function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchCustomers({ customers }: PitchCustomersProps) {
	if (customers.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-8">What Customers Say</h2>
			<div className="divide-y divide-(--border)">
				{customers.map((customer, idx) => (
					<div key={idx} className="py-8 first:pt-0 last:pb-0">
						<svg className="w-6 h-6 text-(--border) mb-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
						</svg>
						{isHtml(customer.testimonial) ? (
							<RichTextDisplay html={customer.testimonial} compact className="text-xl leading-8 text-(--primary) mb-6" />
						) : (
							<p className="text-xl leading-8 text-(--primary) mb-6">{customer.testimonial}</p>
						)}
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-(--surface-hover) flex items-center justify-center overflow-hidden shrink-0">
								{customer.avatar ? (
									<img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
								) : (
									<span className="text-sm font-semibold text-(--secondary)">{customer.name.charAt(0)}</span>
								)}
							</div>
							<div>
								<p className="font-semibold text-(--primary)">{customer.name}</p>
								<p className="text-sm text-(--secondary)">
									{[customer.role, customer.company].filter(Boolean).join(', ')}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
