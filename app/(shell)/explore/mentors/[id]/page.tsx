"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSessionToken } from "@/lib/auth-utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppIcon } from "@/components/ui/AppIcon";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { StartupProfileNavbar } from "@/components/public/StartupProfileNavbar";
import { Section } from "./_components/MentorProfileHelpers";
import ConnectModal from "./_components/ConnectModal";
import MentorPackages from "./_components/MentorPackages";
import { HeroSection } from "./_components/HeroSection";
import {
	ExperienceSection,
	EducationSection,
	CertificationsSection,
	SkillsSection,
	HonorsAwardsSection,
} from "./_components/LinkedInSections";
import { DocumentsSection } from "./_components/DocumentsSection";
import AvailabilityBookingSection from "./_components/AvailabilityBookingSection";
import BookSessionModal from "./_components/BookSessionModal";
import { parseMentorData, getConnectBtnConfig } from "./_lib/constants";
import type { MentorDetail, MentorSlot } from "./_lib/constants";

export default function MentorDetailPage() {
	const params = useParams();
	const router = useRouter();
	const mentorId = params.id as string;
	const { user } = useAuth();
	const currentUserId = user?.id ?? "";

	const [mentor, setMentor] = useState<MentorDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [slots, setSlots] = useState<MentorSlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview" | "mentoredStartups">(
		"overview",
	);
	const [showBookingModal, setShowBookingModal] = useState(false);
	const [preselectedSlot, setPreselectedSlot] = useState<MentorSlot | null>(null);


	useEffect(() => {
		async function load() {
			try {
				setLoading(true);
				const res = await fetch(`/api/mentors/${mentorId}`);
				if (!res.ok) return;
				const json = await res.json();
				const found = json.data;
				if (found) setMentor(parseMentorData(found));
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [mentorId]);

	const loadSlots = async () => {
		const mentorUserId = mentor?.userId;
		if (!mentorUserId) {
			setSlots([]);
			return;
		}
		setSlotsLoading(true);
		try {
			const token = getSessionToken();
			const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
			const res = await fetch(`/api/mentor-slots/?mentorId=${mentorUserId}`, {
				headers,
			});
			if (res?.ok) {
				const json = await res.json();
				const apiSlots = (json.data ?? []).filter(
					(s: MentorSlot) => s.isActive && !!s.id,
				);
				setSlots(apiSlots);
				return;
			}

			setSlots([]);
		} catch (err) {
			console.error(err);
			setSlots([]);
		} finally {
			setSlotsLoading(false);
		}
	};


	useEffect(() => {
		async function loadConnection() {
			const token = getSessionToken();
			if (!token) return;
			try {
				const res = await fetch("/api/mentor-connections/", {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) return;
				const json = await res.json();
				const match = (json.data ?? []).find(
					(r: { mentor?: string | { id?: string } }) => {
						const mentorRef =
							typeof r.mentor === "string"
								? r.mentor
								: r.mentor &&
									typeof r.mentor === "object" &&
									typeof r.mentor.id === "string"
									? r.mentor.id
									: null;
						return mentorRef === mentorId;
					},
				);
				if (match) {
					setConnectionStatus(match.status);
				}
				// Always try to pre-load slots for authenticated users
				await loadSlots();
			} catch {
				/* ignore */
			}
		}
		loadConnection();
	}, [mentorId, mentor?.userId]);

	const handleSubmitConnection = async (message: string) => {
		const token = getSessionToken();
		if (!token || !mentor) return;
		try {
			const res = await fetch("/api/mentor-connections/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ mentorId: mentor.id, message }),
			});
			if (res.ok || res.status === 409) {
				setConnectionStatus("pending");
				setShowConnectModal(false);
			} else {
				const data = await res.json();
				alert(data.error || "Failed to send connection request");
			}
		} catch {
			alert("Failed to send connection request");
		}
	};

	const btnConfig = getConnectBtnConfig(connectionStatus);

	const openSlotBookingModal = () => {
		setPreselectedSlot(null);
		setShowBookingModal(true);
		loadSlots();
	};

	const handleSlotClickFromAvailability = (slot: MentorSlot) => {
		setPreselectedSlot(slot);
		setShowBookingModal(true);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background text-(--primary)">
				<StartupProfileNavbar />
				<div className="px-4 sm:px-6 max-w-5xl mx-auto py-6 animate-pulse space-y-5">
					<div className="h-5 w-36 bg-(--accent-subtle) rounded-lg" />
					<div className="border border-(--border) rounded-xl overflow-hidden">
						<div className="h-28 sm:h-36 bg-(--surface-hover)" />
						<div className="px-6 sm:px-8 pb-6">
							<div className="flex items-end -mt-12 sm:-mt-16 mb-3">
								<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-(--surface) border-4 border-(--surface)" />
							</div>
							<div className="h-6 w-48 bg-(--surface-hover) rounded mb-2" />
							<div className="h-4 w-64 bg-(--surface-hover) rounded mb-4" />
							<div className="h-9 w-28 bg-(--surface-hover) rounded-full" />
						</div>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
						<div className="lg:col-span-2 space-y-4">
							<div className="h-32 bg-(--surface) border border-(--border) rounded-xl" />
							<div className="h-48 bg-(--surface) border border-(--border) rounded-xl" />
						</div>
						<div className="h-48 bg-(--surface) border border-(--border) rounded-xl" />
					</div>
				</div>
			</div>
		);
	}

	if (!mentor) {
		return (
			<div className="min-h-screen bg-background text-(--primary)">
				<StartupProfileNavbar />
				<div className="px-4 sm:px-6 flex flex-col items-center justify-center py-24 text-center">
					<div className="w-16 h-16 rounded-full bg-(--accent-subtle) flex items-center justify-center mb-4">
						<AppIcon name="brain" className="w-8 h-8 text-(--secondary-light)" />
					</div>
					<h3 className="text-lg font-semibold text-(--primary) mb-1">
						Mentor not found
					</h3>
					<p className="text-sm text-(--secondary-light) mb-4">
						This mentor profile doesn&apos;t exist or has been removed.
					</p>
					<button
						onClick={() => router.back()}
						className="text-sm text-violet-400 hover:text-violet-300"
					>
						&larr; Go back
					</button>
				</div>
			</div>
		);
	}

	const hourlyRate = mentor.pricingPerHour || mentor.rate;

	return (
		<div className="min-h-screen bg-background text-(--primary)">
			<StartupProfileNavbar />
			<div className="px-4 sm:px-6 max-w-5xl mx-auto py-6">
				<Link
					href="/explore/mentors"
					className="inline-flex items-center gap-1.5 text-sm text-(--secondary-light) hover:text-(--primary) mb-5 transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Back to Mentors
				</Link>

				<HeroSection
					mentor={mentor}
					connectionStatus={connectionStatus}
					onAction={openSlotBookingModal}
					currentUserId={currentUserId}
				/>

				{/* LinkedIn-style underline tabs */}
				<div className="border-b border-(--border) mt-5 mb-6">
					<div className="flex gap-6">
						<button
							type="button"
							onClick={() => setActiveTab("overview")}
							className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "overview"
								? "border-violet-500 text-(--primary)"
								: "border-transparent text-(--secondary-light) hover:text-(--primary)"
								}`}
						>
							Overview
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("mentoredStartups")}
							className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "mentoredStartups"
								? "border-violet-500 text-(--primary)"
								: "border-transparent text-(--secondary-light) hover:text-(--primary)"
								}`}
						>
							Mentored Startups
							{mentor.mentoredStartups.length > 0 && (
								<span className="ml-1.5 text-xs text-(--secondary-light)">({mentor.mentoredStartups.length})</span>
							)}
						</button>
					</div>
				</div>

				{activeTab === "overview" && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						<div className="lg:col-span-2 space-y-4">

							{mentor.experience && mentor.experience.length > 0 && (
								<ExperienceSection items={mentor.experience} />
							)}

							{mentor.education && mentor.education.length > 0 && (
								<EducationSection items={mentor.education} />
							)}

							{mentor.certifications && mentor.certifications.length > 0 && (
								<CertificationsSection items={mentor.certifications} />
							)}

							{mentor.skills && mentor.skills.length > 0 && (
								<SkillsSection items={mentor.skills} />
							)}

							{(mentor.expertise.length > 0 && !(mentor.skills && mentor.skills.length > 0)) && (
								<Section title="Areas of Expertise">
									<div className="flex flex-wrap gap-2">
										{mentor.expertise.map((tag) => (
											<span key={tag} className="text-sm px-3.5 py-1.5 rounded-full bg-(--accent-light) text-(--primary-light) border border-(--border)">
												{tag}
											</span>
										))}
									</div>
								</Section>
							)}

							{mentor.honorsAwards && mentor.honorsAwards.length > 0 && (
								<HonorsAwardsSection items={mentor.honorsAwards} />
							)}

							{mentor.achievements.length > 0 && (
								<Section
									title="Achievements"
									icon={<svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" /></svg>}
								>
									<ul className="divide-y divide-(--border-light)">
										{mentor.achievements.map((a, i) => (
											<li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
												<div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
													<svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
														<path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
													</svg>
												</div>
												<RichTextDisplay html={a} compact className="text-sm text-(--primary-light) pt-1" />
											</li>
										))}
									</ul>
								</Section>
							)}

							<DocumentsSection
								documents={mentor.documents}
								verified={mentor.verified}
							/>

							<AvailabilityBookingSection
								mentorId={mentorId}
								mentorName={mentor.name}
								connectionStatus={connectionStatus}
								slots={slots}
								slotsLoading={slotsLoading}
								availability={mentor.availability}
								onSlotClick={handleSlotClickFromAvailability}
							/>
						</div>

						<div className="space-y-4">
							<MentorPackages
								hourlyRate={hourlyRate ?? null}
								packages={[]}
								pricingPlans={mentor.pricingPlans}
								connectionStatus={connectionStatus}
								connectBtnDisabled={btnConfig.disabled}
								onConnectOrBook={openSlotBookingModal}
							/>

							{/* Expertise sidebar card (when skills section already shows) */}
							{mentor.expertise.length > 0 && mentor.skills && mentor.skills.length > 0 && (
								<div className="border border-(--border) rounded-xl p-5 bg-(--surface)">
									<h3 className="text-sm font-semibold text-(--primary) mb-3">Areas of Expertise</h3>
									<div className="flex flex-wrap gap-1.5">
										{mentor.expertise.map((tag) => (
											<span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-(--accent-light) text-(--secondary) border border-(--border)">
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{activeTab === "mentoredStartups" && (
					<div className="bg-(--surface) border border-(--border) rounded-xl p-5">
						<div className="flex items-start justify-between gap-3 mb-4">
							<div>
								<h3 className="text-lg font-semibold text-(--primary)">
									Previously Mentored Startups
								</h3>
								<p className="text-sm text-(--secondary) mt-0.5">
									Startups this mentor has completed sessions with on Xentro.
								</p>
							</div>
							<span className="px-2.5 py-1 rounded-full text-xs bg-(--accent-light) text-(--primary-light) border border-(--border)">
								{mentor.mentoredStartups.length}
							</span>
						</div>

						{mentor.mentoredStartups.length === 0 ? (
							<div className="border border-dashed border-(--border) rounded-xl p-8 text-center">
								<div className="w-12 h-12 rounded-full bg-(--accent-subtle) flex items-center justify-center mx-auto mb-3">
									<svg
										className="w-6 h-6 text-(--secondary-light)"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={1.8}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
										/>
									</svg>
								</div>
								<p className="text-sm font-medium text-(--primary)">
									No mentoring experience on platform yet
								</p>
								<p className="text-xs text-(--secondary-light) mt-1">
									Completed startup mentorships will appear here.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{mentor.mentoredStartups.map((startup) => (
									<Link
										key={startup.id}
										href={`/startups/${startup.id}`}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-xl border border-(--border-light) bg-(--accent-subtle) p-4 hover:bg-(--accent-subtle) hover:border-(--border-hover) transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-(--accent-subtle) border border-(--border) overflow-hidden flex items-center justify-center shrink-0">
												{startup.logo ? (
													<img
														src={startup.logo}
														alt={startup.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<span className="text-sm font-bold text-(--primary-light)">
														{startup.name.charAt(0).toUpperCase()}
													</span>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold text-(--primary) truncate">
													{startup.name}
												</p>
												{startup.isExternalInstitution &&
													startup.institutionName && (
														<p className="text-xs text-amber-300 mt-0.5 truncate">
															Associated with {startup.institutionName}
														</p>
													)}
												<p className="text-[11px] text-(--secondary-light) mt-1">
													View startup profile
												</p>
											</div>
											<svg
												className="w-4 h-4 text-(--secondary-light) shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				)}

				{showConnectModal && mentor && (
					<ConnectModal
						mentorName={mentor.name}
						mentorAvatar={mentor.avatar}
						mentorOccupation={mentor.occupation}
						onClose={() => setShowConnectModal(false)}
						onSubmit={handleSubmitConnection}
					/>
				)}

				{showBookingModal && (
					<BookSessionModal
						isOpen={showBookingModal}
						onClose={() => {
							setShowBookingModal(false);
							setPreselectedSlot(null);
						}}
						mentorId={mentorId}
						mentorUserId={mentor.userId ?? null}
						mentorName={mentor.name}
						mentorAvatar={mentor.avatar}
						slots={slots}
						slotsLoading={slotsLoading}
						availability={mentor.availability}
						preselectedSlot={preselectedSlot}
					/>
				)}
			</div>
		</div>
	);
}
