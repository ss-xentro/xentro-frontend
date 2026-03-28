'use client';

import { Button } from '@/components/ui';
import { FounderEmailCheck } from './FounderEmailCheck';

interface Founder {
	id: string;
	name: string;
	email: string;
	phone: string;
}

interface FoundersStepProps {
	founders: Founder[];
	setFounders: (founders: Founder[]) => void;
}

export function FoundersStep({ founders, setFounders }: FoundersStepProps) {
	const addFounder = () => {
		setFounders([...founders, { id: Date.now().toString(), name: '', email: '', phone: '' }]);
	};

	const removeFounder = (id: string) => {
		if (founders.length > 1) {
			setFounders(founders.filter(f => f.id !== id));
		}
	};

	const updateFounder = (id: string, field: 'name' | 'email' | 'phone', value: string) => {
		setFounders(founders.map(f => f.id === id ? { ...f, [field]: value } : f));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-base font-semibold text-gray-900">Founders</h3>
				<Button
					variant="ghost"
					size="sm"
					type="button"
					onClick={addFounder}
				>
					+ Add Another Founder
				</Button>
			</div>

			{founders.map((founder, index) => (
				<div key={founder.id} className="p-6 border border-gray-200 rounded-lg space-y-4 relative">
					{founders.length > 1 && (
						<button
							type="button"
							onClick={() => removeFounder(founder.id)}
							className="absolute top-4 right-4 text-red-600 hover:text-red-700"
							aria-label="Remove founder"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}

					<p className="text-sm font-medium text-gray-700">Founder {index + 1}</p>

					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Name *</label>
						<input
							type="text"
							value={founder.name}
							onChange={(e) => updateFounder(founder.id, 'name', e.target.value)}
							className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
							placeholder="Full name"
							aria-label="Founder name"
						/>
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Email *</label>
						<input
							type="email"
							value={founder.email}
							onChange={(e) => updateFounder(founder.id, 'email', e.target.value)}
							className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
							placeholder="founder@startup.com"
							aria-label="Founder email"
						/>
						<FounderEmailCheck email={founder.email} />
					</div>

					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Phone *</label>
						<input
							type="tel"
							value={founder.phone}
							onChange={(e) => updateFounder(founder.id, 'phone', e.target.value)}
							className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
							placeholder="+1 555 123 4567"
							aria-label="Founder phone"
						/>
					</div>
				</div>
			))}
		</div>
	);
}
