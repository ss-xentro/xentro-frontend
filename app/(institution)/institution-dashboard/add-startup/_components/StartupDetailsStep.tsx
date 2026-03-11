'use client';

import { Select, FileUpload } from '@/components/ui';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';

const stageOptions = [
	{ value: 'ideation', label: 'Ideation' },
	{ value: 'pre_seed_prototype', label: 'Pre seed / Prototype' },
	{ value: 'seed_mvp', label: 'Seed / MVP' },
	{ value: 'early_traction', label: 'Early Traction' },
	{ value: 'growth', label: 'Growth' },
	{ value: 'scaling', label: 'Scaling' },
];

interface ProgramOption {
	id: string;
	name: string;
	type: string;
}

interface StartupFormData {
	name: string;
	stage: string;
	city: string;
	country: string;
	countryCode: string;
	oneLiner: string;
	logo: string | null;
	programId: string;
}

interface Step1Props {
	formData: StartupFormData;
	setFormData: (data: StartupFormData) => void;
	locationSearch: string;
	setLocationSearch: (v: string) => void;
	programs: ProgramOption[];
}

export function StartupDetailsStep({ formData, setFormData, locationSearch, setLocationSearch, programs }: Step1Props) {
	const handleLocationSelect = (location: { city: string; country: string; countryCode: string; displayName: string }) => {
		setFormData({
			...formData,
			city: location.city,
			country: location.country,
			countryCode: location.countryCode,
		});
		setLocationSearch(location.displayName);
	};

	return (
		<>
			<div className="space-y-6">
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Startup Logo</label>
					<FileUpload
						value={formData.logo}
						onChange={(logo) => setFormData({ ...formData, logo })}
						accept="image/*"
						maxSize={2}
						folder="startup-logos"
						enableCrop={true}
						aspectRatio={1}
					/>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-500 mb-2">Startup Name *</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
						placeholder="e.g., TechVenture"
						required
						aria-label="Startup name"
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">Stage</label>
						<Select
							value={formData.stage}
							onChange={(value) => setFormData({ ...formData, stage: value })}
							options={stageOptions}
							placeholder="Select stage"
							aria-label="Startup stage"
						/>
					</div>
					<div>
						<LocationAutocomplete
							value={locationSearch}
							onInputChange={setLocationSearch}
							onSelect={handleLocationSelect}
							label="Location"
							placeholder="Start typing city..."
							required
						/>
					</div>
				</div>

				{programs.length > 0 && (
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-2">
							Assign to Program <span className="text-gray-400">(optional)</span>
						</label>
						<select
							value={formData.programId}
							onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
							className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors"
							aria-label="Assign to program"
						>
							<option value="">No program</option>
							{programs.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name} &mdash; {p.type}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			<div className="space-y-3">
				<label className="block text-xs font-medium text-gray-500">What You&apos;re Building</label>
				<textarea
					value={formData.oneLiner}
					onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
					rows={4}
					maxLength={280}
					className="w-full px-4 py-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all resize-none"
					placeholder="Describe your startup in one clear sentence"
					aria-label="Startup one-liner"
				/>
				<p className="text-xs text-gray-400">{formData.oneLiner.length} / 280</p>
			</div>
		</>
	);
}
