"use client";

import { VerifiedBadge, InstitutionalBadge } from "./MentorProfileHelpers";
import type { MentorDetail, ConnectBtnConfig } from "../_lib/constants";

interface HeroSectionProps {
	mentor: MentorDetail;
	connectionStatus: string | null;
	btnConfig: ConnectBtnConfig;
	onAction: () => void;
}

export function HeroSection({
	mentor,
	connectionStatus,
	btnConfig,
	onAction,
}: HeroSectionProps) {
	return (
		<div className="bg-(--accent-subtle) border border-(--border) rounded-xl p-6 sm:p-8 mb-5">
			<div className="flex flex-col sm:flex-row items-start gap-6">
				<div className="relative shrink-0">
					<div className="w-24 h-24 rounded-full bg-(--accent-light) border-2 border-(--border) flex items-center justify-center overflow-hidden">
						{mentor.avatar ? (
							<img
								src={mentor.avatar}
								alt={mentor.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-3xl font-bold text-(--secondary)">
								{mentor.name.charAt(0).toUpperCase()}
							</span>
						)}
					</div>
					{mentor.verified && (
						<div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 border-[3px] border-(--background) flex items-center justify-center">
							<svg
								className="w-3.5 h-3.5 text-(--primary)"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div>
							<div className="flex items-center gap-3 flex-wrap mb-1">
								<h1 className="text-2xl font-bold text-(--primary)">{mentor.name}</h1>
								{mentor.institutionName ? (
									<InstitutionalBadge name={mentor.institutionName} />
								) : (
									<VerifiedBadge
										verified={mentor.verified}
										status={mentor.status}
									/>
								)}
							</div>
							{mentor.occupation && (
								<p className="text-sm text-(--secondary) mt-1">
									{mentor.occupation}
								</p>
							)}
						</div>
						<div className="flex gap-2 shrink-0 items-start">
							{connectionStatus === "accepted" && (
								<span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
									<svg
										className="w-3.5 h-3.5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									Connected
								</span>
							)}
							{mentor.institutionId ? (
								<div className="flex flex-col items-center gap-1 min-w-16">
									<div className="w-14 h-14 rounded-xl border border-(--border) bg-(--accent-light) overflow-hidden flex items-center justify-center">
										{mentor.institutionLogo ? (
											<img
												src={mentor.institutionLogo}
												alt={mentor.institutionName ?? "Institution"}
												className="w-full h-full object-contain p-1.5"
											/>
										) : (
											<svg
												className="w-7 h-7 text-(--secondary-light)"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z"
												/>
											</svg>
										)}
									</div>
									<p className="text-[10px] text-(--secondary-light) text-center leading-tight">
										Endorsed by
									</p>
									<p className="text-[11px] font-semibold text-(--secondary) text-center leading-tight max-w-20 truncate">
										{mentor.institutionName}
									</p>
								</div>
							) : (
								<button
									onClick={onAction}
									disabled={btnConfig.disabled}
									className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${btnConfig.className}`}
								>
									{btnConfig.label}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
