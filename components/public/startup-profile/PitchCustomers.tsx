'use client';

import type { PitchCustomer } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchCustomersProps {
	customers: PitchCustomer[];
}

/** Check if a string contains HTML tags */
function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchCustomers({ customers }: PitchCustomersProps) {
	if (customers.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">What Customers Say</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{customers.map((customer, idx) => (
					<div key={idx} className="p-5 rounded-xl border border-(--border) bg-(--surface)">
						<svg className="w-5 h-5 text-(--border) mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" /></svg>
						{isHtml(customer.testimonial) ? (
							<RichTextDisplay html={customer.testimonial} compact className="text-sm text-(--primary) mb-4" />
						) : (
							<p className="text-sm text-(--primary) leading-relaxed mb-4">{customer.testimonial}</p>
						)}
						<div className="flex items-center gap-3 pt-3 border-t border-(--border)">
							<div className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center overflow-hidden shrink-0">
								{customer.avatar ? (
									<img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
								) : (
									<span className="text-xs font-semibold text-(--secondary)">{customer.name.charAt(0)}</span>
								)}
							</div>
							<div>
								<p className="text-sm font-medium text-(--primary)">{customer.name}</p>
								<p className="text-xs text-(--secondary)">
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
