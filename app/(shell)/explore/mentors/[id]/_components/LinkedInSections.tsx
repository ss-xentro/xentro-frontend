'use client';

import type { MentorDetail } from '../_lib/constants';

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="bg-(--accent-subtle) border border-(--border) rounded-xl p-6">
			<div className="flex items-center gap-2.5 mb-4">
				{icon}
				<h2 className="text-base font-semibold text-(--primary)">{title}</h2>
			</div>
			{children}
		</div>
	);
}

function formatDateRange(start?: string, end?: string) {
	const s = start || '';
	const e = end || 'Present';
	if (!s && e === 'Present') return '';
	return `${s}${s ? ' – ' : ''}${e}`;
}

/* ── About ── */
export function AboutSection({ about }: { about: string }) {
	return (
		<SectionCard
			title="About"
			icon={
				<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			}
		>
			<p className="text-sm text-(--secondary) leading-relaxed whitespace-pre-line">{about}</p>
		</SectionCard>
	);
}

/* ── Experience ── */
export function ExperienceSection({ items }: { items: NonNullable<MentorDetail['experience']> }) {
	return (
		<SectionCard
			title="Experience"
			icon={
				<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
				</svg>
			}
		>
			<div className="space-y-5">
				{items.map((exp, i) => (
					<div key={i} className="flex gap-3.5">
						<div className="w-10 h-10 rounded-lg bg-(--accent-light) border border-(--border-light) flex items-center justify-center shrink-0 overflow-hidden">
							{exp.logo ? (
								<img src={exp.logo} alt={exp.company} className="w-full h-full object-contain p-1" />
							) : (
								<svg className="w-5 h-5 text-(--secondary-light)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
								</svg>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-(--primary)">{exp.title}</p>
							<p className="text-sm text-(--secondary)">{exp.company}</p>
							{formatDateRange(exp.startDate, exp.endDate) && (
								<p className="text-xs text-(--secondary-light) mt-0.5">{formatDateRange(exp.startDate, exp.endDate)}</p>
							)}
							{exp.description && (
								<p className="text-xs text-(--secondary) mt-1.5 leading-relaxed">{exp.description}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}

/* ── Education ── */
export function EducationSection({ items }: { items: NonNullable<MentorDetail['education']> }) {
	return (
		<SectionCard
			title="Education"
			icon={
				<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
				</svg>
			}
		>
			<div className="space-y-5">
				{items.map((edu, i) => (
					<div key={i} className="flex gap-3.5">
						<div className="w-10 h-10 rounded-lg bg-(--accent-light) border border-(--border-light) flex items-center justify-center shrink-0 overflow-hidden">
							{edu.logo ? (
								<img src={edu.logo} alt={edu.school} className="w-full h-full object-contain p-1" />
							) : (
								<svg className="w-5 h-5 text-(--secondary-light)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
								</svg>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-(--primary)">{edu.school}</p>
							{(edu.degree || edu.field) && (
								<p className="text-sm text-(--secondary)">{[edu.degree, edu.field].filter(Boolean).join(', ')}</p>
							)}
							{formatDateRange(edu.startDate, edu.endDate) && (
								<p className="text-xs text-(--secondary-light) mt-0.5">{formatDateRange(edu.startDate, edu.endDate)}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}

/* ── Licenses & Certifications ── */
export function CertificationsSection({ items }: { items: NonNullable<MentorDetail['certifications']> }) {
	return (
		<SectionCard
			title="Licenses & Certifications"
			icon={
				<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
			}
		>
			<div className="space-y-4">
				{items.map((cert, i) => (
					<div key={i} className="flex gap-3.5">
						<div className="w-10 h-10 rounded-lg bg-(--accent-light) border border-(--border-light) flex items-center justify-center shrink-0">
							<svg className="w-5 h-5 text-(--secondary-light)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
							</svg>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-(--primary)">{cert.name}</p>
							{cert.organization && <p className="text-sm text-(--secondary)">{cert.organization}</p>}
							{cert.issueDate && <p className="text-xs text-(--secondary-light) mt-0.5">Issued {cert.issueDate}</p>}
							{cert.url && (
								<a href={cert.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-1">
									Show credential
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
								</a>
							)}
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}

/* ── Skills ── */
export function SkillsSection({ items }: { items: string[] }) {
	return (
		<SectionCard
			title="Skills"
			icon={
				<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
			}
		>
			<div className="flex flex-wrap gap-2">
				{items.map((skill, i) => (
					<span key={i} className="text-sm px-3.5 py-1.5 rounded-full bg-(--accent-light) text-(--primary-light) border border-(--border)">
						{skill}
					</span>
				))}
			</div>
		</SectionCard>
	);
}

/* ── Honors & Awards ── */
export function HonorsAwardsSection({ items }: { items: NonNullable<MentorDetail['honorsAwards']> }) {
	return (
		<SectionCard
			title="Honors & Awards"
			icon={
				<svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
					<path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
				</svg>
			}
		>
			<div className="space-y-4">
				{items.map((award, i) => (
					<div key={i} className="flex gap-3.5">
						<div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
							<svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
							</svg>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-(--primary)">{award.title}</p>
							{award.issuer && <p className="text-sm text-(--secondary)">{award.issuer}</p>}
							{award.date && <p className="text-xs text-(--secondary-light) mt-0.5">{award.date}</p>}
							{award.description && <p className="text-xs text-(--secondary) mt-1.5 leading-relaxed">{award.description}</p>}
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}
