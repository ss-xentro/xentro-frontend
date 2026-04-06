'use client';

import { useState, useMemo } from 'react';
import type {
	ExperienceEntry,
	EducationEntry,
	CertificationEntry,
	HonorsAwardEntry,
} from '../_lib/constants';

/* ── Shared ── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function parseMonthYear(value: string): { month: string; year: string } {
	if (!value || value === 'Present') return { month: '', year: '' };
	const parts = value.split(' ');
	if (parts.length === 2 && MONTHS.includes(parts[0] as typeof MONTHS[number])) {
		return { month: parts[0], year: parts[1] };
	}
	// Might be year-only (e.g. "2020")
	if (/^\d{4}$/.test(value)) return { month: '', year: value };
	return { month: '', year: '' };
}

function formatMonthYear(month: string, year: string): string {
	if (!year) return '';
	if (!month) return year;
	return `${month} ${year}`;
}

/** Numeric index (0-11) for a month abbreviation, or -1 */
function monthIndex(m: string): number {
	return MONTHS.indexOf(m as typeof MONTHS[number]);
}

/** True when start comes after end (both in "Mon YYYY" or "YYYY" format) */
function isAfter(start: string, end: string): boolean {
	if (!start || !end || end === 'Present') return false;
	const s = parseMonthYear(start);
	const e = parseMonthYear(end);
	if (!s.year || !e.year) return false;
	const sy = Number(s.year), ey = Number(e.year);
	if (sy > ey) return true;
	if (sy === ey && s.month && e.month && monthIndex(s.month) > monthIndex(e.month)) return true;
	return false;
}

function MonthYearPicker({ label, value, onChange, allowPresent, error }: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	allowPresent?: boolean;
	error?: string;
}) {
	const { month, year } = parseMonthYear(value);
	const isPresent = value === 'Present';
	const currentYear = new Date().getFullYear();
	const years = useMemo(() => {
		const yrs: number[] = [];
		for (let y = currentYear; y >= currentYear - 60; y--) yrs.push(y);
		return yrs;
	}, [currentYear]);

	const selectCls =
		'px-3 py-2 rounded-lg bg-(--accent-subtle) border border-(--border) text-sm text-(--primary) focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer';

	return (
		<div className="block">
			<span className="text-xs text-(--secondary) mb-1 block">{label}</span>
			{allowPresent && (
				<label className="flex items-center gap-1.5 mb-1.5 cursor-pointer">
					<input
						type="checkbox"
						checked={isPresent}
						onChange={(e) => onChange(e.target.checked ? 'Present' : '')}
						className="accent-violet-500 rounded"
					/>
					<span className="text-xs text-(--secondary-light)">Present</span>
				</label>
			)}
			{!isPresent && (
				<div className="flex gap-2">
					<select
						value={month}
						onChange={(e) => onChange(formatMonthYear(e.target.value, year))}
						className={`flex-1 ${selectCls}${error ? ' border-red-500/60' : ''}`}
					>
						<option value="">Month</option>
						{MONTHS.map((m) => (
							<option key={m} value={m}>{m}</option>
						))}
					</select>
					<select
						value={year}
						onChange={(e) => onChange(formatMonthYear(month, e.target.value))}
						className={`flex-1 ${selectCls}${error ? ' border-red-500/60' : ''}`}
					>
						<option value="">Year</option>
						{years.map((y) => (
							<option key={y} value={String(y)}>{y}</option>
						))}
					</select>
				</div>
			)}
			{error && <span className="text-xs text-red-400 mt-0.5 block">{error}</span>}
		</div>
	);
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
	return (
		<div className="flex items-center justify-between mb-4">
			<h3 className="font-semibold text-(--primary)">{title}</h3>
			<button type="button" onClick={onAdd} className="text-xs font-semibold text-violet-400 hover:text-violet-300">
				+ Add
			</button>
		</div>
	);
}

function Input({ label, value, onChange, placeholder, type = 'text' }: {
	label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
	return (
		<label className="block">
			<span className="text-xs text-(--secondary) mb-1 block">{label}</span>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full px-3 py-2 rounded-lg bg-(--accent-subtle) border border-(--border) text-sm text-(--primary) placeholder:text-(--secondary-light) focus:outline-none focus:border-violet-500/50"
			/>
		</label>
	);
}

function TextArea({ label, value, onChange, placeholder, rows = 2 }: {
	label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
	return (
		<label className="block">
			<span className="text-xs text-(--secondary) mb-1 block">{label}</span>
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				className="w-full px-3 py-2 rounded-lg bg-(--accent-subtle) border border-(--border) text-sm text-(--primary) placeholder:text-(--secondary-light) focus:outline-none focus:border-violet-500/50 resize-none"
			/>
		</label>
	);
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
	return (
		<button type="button" onClick={onClick} className="text-xs text-red-400 hover:text-red-300 mt-2">
			Remove
		</button>
	);
}

/* ── About ── */
export function AboutEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<h3 className="font-semibold text-(--primary) mb-3">About</h3>
			<TextArea label="" value={value} onChange={onChange} placeholder="Write a brief summary about yourself, your background, and what drives you..." rows={4} />
		</div>
	);
}

/* ── Experience ── */
export function ExperienceEditor({ items, onChange }: { items: ExperienceEntry[]; onChange: (v: ExperienceEntry[]) => void }) {
	const add = () => onChange([...items, { title: '', company: '', startDate: '', endDate: '', description: '' }]);
	const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
	const update = (i: number, field: keyof ExperienceEntry, val: string) =>
		onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));

	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<SectionHeader title="Experience" onAdd={add} />
			{items.length === 0 && <p className="text-sm text-(--secondary-light)">No experience added yet.</p>}
			<div className="space-y-4">
				{items.map((exp, i) => {
					const dateErr = isAfter(exp.startDate || '', exp.endDate || '') ? 'Start date must be before end date' : undefined;
					return (
						<div key={i} className="border border-(--border-light) rounded-lg p-4 space-y-3 bg-(--accent-subtle)">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Input label="Title *" value={exp.title} onChange={(v) => update(i, 'title', v)} placeholder="e.g. Senior Product Manager" />
								<Input label="Company *" value={exp.company} onChange={(v) => update(i, 'company', v)} placeholder="e.g. Google" />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<MonthYearPicker label="Start Date" value={exp.startDate || ''} onChange={(v) => update(i, 'startDate', v)} error={dateErr} />
								<MonthYearPicker label="End Date" value={exp.endDate || ''} onChange={(v) => update(i, 'endDate', v)} allowPresent />
							</div>
							<TextArea label="Description" value={exp.description || ''} onChange={(v) => update(i, 'description', v)} placeholder="Describe your role and impact..." />
							<RemoveBtn onClick={() => remove(i)} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ── Education ── */
export function EducationEditor({ items, onChange }: { items: EducationEntry[]; onChange: (v: EducationEntry[]) => void }) {
	const add = () => onChange([...items, { school: '', degree: '', field: '', startDate: '', endDate: '' }]);
	const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
	const update = (i: number, field: keyof EducationEntry, val: string) =>
		onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));

	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<SectionHeader title="Education" onAdd={add} />
			{items.length === 0 && <p className="text-sm text-(--secondary-light)">No education added yet.</p>}
			<div className="space-y-4">
				{items.map((edu, i) => {
					const dateErr = isAfter(edu.startDate || '', edu.endDate || '') ? 'Start date must be before end date' : undefined;
					return (
						<div key={i} className="border border-(--border-light) rounded-lg p-4 space-y-3 bg-(--accent-subtle)">
							<Input label="School *" value={edu.school} onChange={(v) => update(i, 'school', v)} placeholder="e.g. MIT" />
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Input label="Degree" value={edu.degree || ''} onChange={(v) => update(i, 'degree', v)} placeholder="e.g. Bachelor's" />
								<Input label="Field of Study" value={edu.field || ''} onChange={(v) => update(i, 'field', v)} placeholder="e.g. Computer Science" />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<MonthYearPicker label="Start Date" value={edu.startDate || ''} onChange={(v) => update(i, 'startDate', v)} error={dateErr} />
								<MonthYearPicker label="End Date" value={edu.endDate || ''} onChange={(v) => update(i, 'endDate', v)} allowPresent />
							</div>
							<RemoveBtn onClick={() => remove(i)} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ── Certifications ── */
export function CertificationsEditor({ items, onChange }: { items: CertificationEntry[]; onChange: (v: CertificationEntry[]) => void }) {
	const add = () => onChange([...items, { name: '', organization: '', issueDate: '', url: '' }]);
	const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
	const update = (i: number, field: keyof CertificationEntry, val: string) =>
		onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));

	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<SectionHeader title="Licenses & Certifications" onAdd={add} />
			{items.length === 0 && <p className="text-sm text-(--secondary-light)">No certifications added yet.</p>}
			<div className="space-y-4">
				{items.map((cert, i) => (
					<div key={i} className="border border-(--border-light) rounded-lg p-4 space-y-3 bg-(--accent-subtle)">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input label="Name *" value={cert.name} onChange={(v) => update(i, 'name', v)} placeholder="e.g. AWS Solutions Architect" />
							<Input label="Issuing Organization" value={cert.organization || ''} onChange={(v) => update(i, 'organization', v)} placeholder="e.g. Amazon Web Services" />
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<MonthYearPicker label="Issue Date" value={cert.issueDate || ''} onChange={(v) => update(i, 'issueDate', v)} />
							<Input label="Credential URL" value={cert.url || ''} onChange={(v) => update(i, 'url', v)} placeholder="https://..." />
						</div>
						<RemoveBtn onClick={() => remove(i)} />
					</div>
				))}
			</div>
		</div>
	);
}

/* ── Skills ── */
export function SkillsEditor({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
	const [draft, setDraft] = useState('');

	const add = () => {
		const trimmed = draft.trim();
		if (!trimmed || items.includes(trimmed)) return;
		onChange([...items, trimmed]);
		setDraft('');
	};

	const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<h3 className="font-semibold text-(--primary) mb-3">Skills</h3>
			<div className="flex gap-2 mb-3">
				<input
					type="text"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
					placeholder="Type a skill and press Enter..."
					className="flex-1 px-3 py-2 rounded-lg bg-(--accent-subtle) border border-(--border) text-sm text-(--primary) placeholder:text-(--secondary-light) focus:outline-none focus:border-violet-500/50"
				/>
				<button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 text-sm font-semibold hover:bg-violet-500/30 border border-violet-500/30">
					Add
				</button>
			</div>
			{items.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{items.map((skill, i) => (
						<span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-(--accent-subtle) text-(--primary-light) border border-(--border)">
							{skill}
							<button type="button" onClick={() => remove(i)} className="text-(--secondary-light) hover:text-red-400">
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</span>
					))}
				</div>
			)}
			{items.length === 0 && <p className="text-sm text-(--secondary-light)">No skills added yet.</p>}
		</div>
	);
}

/* ── Honors & Awards ── */
export function HonorsAwardsEditor({ items, onChange }: { items: HonorsAwardEntry[]; onChange: (v: HonorsAwardEntry[]) => void }) {
	const add = () => onChange([...items, { title: '', issuer: '', date: '', description: '' }]);
	const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
	const update = (i: number, field: keyof HonorsAwardEntry, val: string) =>
		onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));

	return (
		<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
			<SectionHeader title="Honors & Awards" onAdd={add} />
			{items.length === 0 && <p className="text-sm text-(--secondary-light)">No honors or awards added yet.</p>}
			<div className="space-y-4">
				{items.map((award, i) => (
					<div key={i} className="border border-(--border-light) rounded-lg p-4 space-y-3 bg-(--accent-subtle)">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input label="Title *" value={award.title} onChange={(v) => update(i, 'title', v)} placeholder="e.g. Dean's List" />
							<Input label="Issuer" value={award.issuer || ''} onChange={(v) => update(i, 'issuer', v)} placeholder="e.g. Stanford University" />
						</div>
						<MonthYearPicker label="Date" value={award.date || ''} onChange={(v) => update(i, 'date', v)} />
						<TextArea label="Description" value={award.description || ''} onChange={(v) => update(i, 'description', v)} placeholder="Briefly describe the award..." />
						<RemoveBtn onClick={() => remove(i)} />
					</div>
				))}
			</div>
		</div>
	);
}
