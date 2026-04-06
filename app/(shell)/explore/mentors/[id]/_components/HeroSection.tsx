"use client";

import { useState } from "react";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { VerifiedBadge, InstitutionalBadge } from "./MentorProfileHelpers";
import type { MentorDetail } from "../_lib/constants";

interface HeroSectionProps {
	mentor: MentorDetail;
	connectionStatus: string | null;
	onAction: () => void;
}

export function HeroSection({
	mentor,
	connectionStatus,
	onAction,
}: HeroSectionProps) {
	const [aboutExpanded, setAboutExpanded] = useState(false);

	const metaParts: string[] = [];
	if (mentor.expertise.length > 0)
		metaParts.push(`${mentor.expertise.length} expertise area${mentor.expertise.length !== 1 ? "s" : ""}`);
	if (mentor.achievements.length > 0)
		metaParts.push(`${mentor.achievements.length} achievement${mentor.achievements.length !== 1 ? "s" : ""}`);
	if (mentor.mentoredStartups.length > 0)
		metaParts.push(`${mentor.mentoredStartups.length} startup${mentor.mentoredStartups.length !== 1 ? "s" : ""} mentored`);

	return (
		<div className="border border-(--border) rounded-xl overflow-hidden bg-(--surface)">
			{/* Cover banner — clean surface, no gradients */}
			<div className="h-24 sm:h-36 relative bg-(--surface-hover)">
				{mentor.coverPhoto ? (
					<img src={mentor.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
				) : (
					<div className="absolute inset-0 bg-(--surface-hover)" />
				)}
			</div>

			{/* Profile content */}
			<div className="px-6 sm:px-8 pb-6">
				{/* Top row: avatar + right-side actions/endorsement */}
				<div className="flex items-end justify-between -mt-12 sm:-mt-16">
					{/* Avatar */}
					<div className="relative">
						<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-(--surface) border-4 border-(--surface) flex items-center justify-center overflow-hidden shadow-(--shadow-lg)">
							{mentor.avatar ? (
								<img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
							) : (
								<span className="text-3xl sm:text-4xl font-bold text-(--secondary)">
									{mentor.name.charAt(0).toUpperCase()}
								</span>
							)}
						</div>
						{mentor.verified && (
							<div className="absolute bottom-0.5 right-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 border-[3px] border-(--surface) flex items-center justify-center">
								<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z" clipRule="evenodd" />
								</svg>
							</div>
						)}
					</div>

					{/* Institution endorsement — right side */}
					{mentor.institutionId && (
						<div className="flex items-center gap-2.5 mb-1">
							<div className="w-10 h-10 rounded-lg border border-(--border-light) bg-(--surface-hover) overflow-hidden flex items-center justify-center shrink-0">
								{mentor.institutionLogo ? (
									<img src={mentor.institutionLogo} alt={mentor.institutionName ?? "Institution"} className="w-full h-full object-contain p-1" />
								) : (
									<svg className="w-5 h-5 text-(--secondary-light)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
									</svg>
								)}
							</div>
							<div className="text-right">
								<p className="text-[10px] text-(--secondary-light) leading-tight">Endorsed by</p>
								<p className="text-xs font-medium text-(--secondary) leading-tight max-w-28 truncate">{mentor.institutionName}</p>
							</div>
						</div>
					)}
				</div>

				{/* Name + headline */}
				<div className="mt-3">
					<div className="flex items-center gap-2 flex-wrap">
						<h1 className="text-xl sm:text-2xl font-bold text-(--primary) leading-tight">{mentor.name}</h1>
						{mentor.institutionName ? (
							<InstitutionalBadge name={mentor.institutionName} />
						) : (
							<VerifiedBadge verified={mentor.verified} status={mentor.status} />
						)}
					</div>

					{mentor.occupation && (
						<p className="text-sm text-(--secondary) mt-1 leading-snug">{mentor.occupation}</p>
					)}

					{metaParts.length > 0 && (
						<p className="text-xs text-(--secondary-light) mt-2">
							{metaParts.join(" · ")}
						</p>
					)}
				</div>

				{/* Action buttons */}
				<div className="flex items-center gap-2.5 mt-4 flex-wrap">
					<button
						onClick={onAction}
						className="px-5 py-2 rounded-full text-sm font-semibold bg-(--primary) text-background hover:opacity-90 transition-opacity"
					>
						Book Session
					</button>
					{connectionStatus === "accepted" && (
						<span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-500/30 text-emerald-400">
							<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							Connected
						</span>
					)}
				</div>

				{/* About */}
				{mentor.about?.trim() && (
					<div className="mt-5 pt-5 border-t border-(--border-light)">
						<p className={`text-sm text-(--secondary) leading-relaxed whitespace-pre-line ${!aboutExpanded && mentor.about.trim().length > 200 ? "line-clamp-3" : ""}`}>
							{mentor.about.trim()}
						</p>
						{mentor.about.trim().length > 200 && (
							<button
								onClick={() => setAboutExpanded(!aboutExpanded)}
								className="text-xs font-medium text-(--secondary-light) hover:text-(--primary) mt-1.5 transition-colors"
							>
								{aboutExpanded ? "Show less" : "...see more"}
							</button>
						)}
					</div>
				)}

				{/* Highlights */}
				{mentor.packages.length > 0 && (
					<div className={`${mentor.about?.trim() ? "mt-4" : "mt-5"} pt-4 border-t border-(--border-light)`}>
						<ul className="space-y-1.5">
							{mentor.packages.map((pkg, i) => (
								<li key={i} className="flex items-start gap-2 text-sm text-(--secondary)">
									<svg className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
									</svg>
									<RichTextDisplay html={pkg} compact className="text-sm text-(--primary-light)" />
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
