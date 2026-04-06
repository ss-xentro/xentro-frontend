"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSessionToken } from "@/lib/auth-utils";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { AppIcon } from "@/components/ui/AppIcon";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { StartupProfileNavbar } from "@/components/public/StartupProfileNavbar";
import { StatCard, Section } from "./_components/MentorProfileHelpers";
import ConnectModal from "./_components/ConnectModal";
import MentorPackages from "./_components/MentorPackages";
import { HeroSection } from "./_components/HeroSection";
import {
	AboutSection,
	ExperienceSection,
	EducationSection,
	CertificationsSection,
	SkillsSection,
	HonorsAwardsSection,
} from "./_components/LinkedInSections";
import { DocumentsSection } from "./_components/DocumentsSection";
import AvailabilityBookingSection from "./_components/AvailabilityBookingSection";
import { parseMentorData, getConnectBtnConfig } from "./_lib/constants";
import type { MentorDetail, MentorSlot } from "./_lib/constants";

export default function MentorDetailPage() {
	const params = useParams();
	const router = useRouter();
	const mentorId = params.id as string;

	const [mentor, setMentor] = useState<MentorDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [slots, setSlots] = useState<MentorSlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview" | "mentoredStartups">(
		"overview",
	);
	const [showSlotsModal, setShowSlotsModal] = useState(false);
	const [showRequestModal, setShowRequestModal] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
	const [selectedDate, setSelectedDate] = useState("");
	const [requestMessage, setRequestMessage] = useState("");
	const [bookingSubmitting, setBookingSubmitting] = useState(false);


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

	const getNextDateForDay = (dayName: string): string => {
		const dayIndex: Record<string, number> = {
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
			sunday: 0,
		};
		const target = dayIndex[(dayName || "").toLowerCase()];
		if (target === undefined) return "";
		const now = new Date();
		const current = now.getDay();
		let diff = target - current;
		if (diff <= 0) diff += 7;
		const next = new Date(now);
		next.setDate(now.getDate() + diff);
		return next.toISOString().split("T")[0];
	};

	const formatTime = (t: string) => {
		const [h, m] = t.split(":").map(Number);
		const period = h >= 12 ? "PM" : "AM";
		const hour = h % 12 || 12;
		return `${hour}:${String(m).padStart(2, "0")} ${period}`;
	};

	const slotsByDay = slots.reduce<Record<string, MentorSlot[]>>((acc, slot) => {
		const key = (slot.dayOfWeek || "").toLowerCase();
		if (!acc[key]) acc[key] = [];
		acc[key].push(slot);
		return acc;
	}, {});

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
					if (match.status === "accepted") {
						await loadSlots();
					}
				}
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

	const openSlotBookingModal = async () => {
		await loadSlots();
		setShowSlotsModal(true);
	};

	const handlePickSlot = (slot: MentorSlot) => {
		setSelectedSlot(slot);
		setSelectedDate(getNextDateForDay(slot.dayOfWeek));
		setRequestMessage("");
		setShowSlotsModal(false);
		setShowRequestModal(true);
	};

	const handleSubmitBookingRequest = async () => {
		const token = getSessionToken();
		if (!selectedSlot || !selectedDate) return;
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(selectedSlot.id)) {
			toast.error(
				"Selected slot is invalid. Please refresh and choose an available slot again.",
			);
			return;
		}

		setBookingSubmitting(true);
		try {
			const res = await fetch("/api/mentor-bookings/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					slotId: selectedSlot.id,
					scheduledDate: selectedDate,
					notes: requestMessage,
					mentorUserId: mentorId,
				}),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.error || "Failed to send booking request");
			}
			setShowRequestModal(false);
			toast.success(
				"Booking request sent. Mentor can review and accept it from their dashboard.",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to send booking request",
			);
		} finally {
			setBookingSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background text-(--primary)">
				<StartupProfileNavbar />
				<div className="p-6 max-w-5xl mx-auto animate-pulse space-y-5">
					<div className="h-5 w-36 bg-(--accent-subtle) rounded-lg" />
					<div className="h-48 bg-(--accent-subtle) border border-(--border-light) rounded-xl" />
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="h-20 bg-(--accent-subtle) border border-(--border-light) rounded-xl"
							/>
						))}
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						<div className="lg:col-span-2 space-y-5">
							<div className="h-40 bg-(--accent-subtle) border border-(--border-light) rounded-xl" />
							<div className="h-28 bg-(--accent-subtle) border border-(--border-light) rounded-xl" />
						</div>
						<div className="h-64 bg-(--accent-subtle) border border-(--border-light) rounded-xl" />
					</div>
				</div>
			</div>
		);
	}

	if (!mentor) {
		return (
			<div className="min-h-screen bg-background text-(--primary)">
				<StartupProfileNavbar />
				<div className="p-6 flex flex-col items-center justify-center py-24 text-center">
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
			<div className="p-6 max-w-5xl mx-auto">
				<Link
					href="/explore/mentors"
					className="inline-flex items-center gap-1.5 text-sm text-(--secondary-light) hover:text-(--primary) mb-6 transition-colors"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to Mentors
				</Link>

				<HeroSection
					mentor={mentor}
					connectionStatus={connectionStatus}
					btnConfig={btnConfig}
					onAction={openSlotBookingModal}
				/>

				{hourlyRate && (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
						<StatCard
							icon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							}
							label="Hourly Rate"
							value={formatCurrency(Number(hourlyRate), 'INR')}
						/>
						<StatCard
							icon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							}
							label="Status"
							value={
								mentor.verified
									? "Verified"
									: mentor.status === "approved"
										? "Approved"
										: "Pending"
							}
						/>
						<StatCard
							icon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
									/>
								</svg>
							}
							label="Expertise Areas"
							value={String(mentor.expertise.length)}
						/>
						<StatCard
							icon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
									/>
								</svg>
							}
							label="Achievements"
							value={String(mentor.achievements.length)}
						/>
					</div>
				)}

				<div className="mb-5">
					<div className="inline-flex items-center p-1 rounded-xl bg-(--accent-subtle) border border-(--border-light)">
						<button
							type="button"
							onClick={() => setActiveTab("overview")}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "overview"
								? "bg-(--primary) text-(--background)"
								: "text-(--primary-light) hover:text-(--primary)"
								}`}
						>
							Overview
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("mentoredStartups")}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "mentoredStartups"
								? "bg-(--primary) text-(--background)"
								: "text-(--primary-light) hover:text-(--primary)"
								}`}
						>
							Previously Mentored Startups
						</button>
					</div>
				</div>

				{activeTab === "overview" && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						<div className="lg:col-span-2 space-y-5">
							{mentor.about && <AboutSection about={mentor.about} />}

							{mentor.expertise.length > 0 && (
								<Section title="Areas of Expertise">
									<div className="flex flex-wrap gap-2">
										{mentor.expertise.map((tag) => (
											<span
												key={tag}
												className="text-sm px-4 py-1.5 rounded-full bg-(--accent-subtle) text-(--primary-light) border border-(--border)"
											>
												{tag}
											</span>
										))}
									</div>
								</Section>
							)}

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

							{mentor.honorsAwards && mentor.honorsAwards.length > 0 && (
								<HonorsAwardsSection items={mentor.honorsAwards} />
							)}

							{mentor.achievements.length > 0 && (
								<Section
									title="Achievements"
									icon={
										<svg
											className="w-4 h-4 text-amber-500"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
										</svg>
									}
								>
									<ul className="space-y-3">
										{mentor.achievements.map((a, i) => (
											<li
												key={i}
												className="flex items-start gap-3 text-sm text-(--secondary)"
											>
												<div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
													<svg
														className="w-3 h-3 text-amber-500"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path d="M10 1l2.39 6.34H19l-5.19 3.78L15.82 18 10 14.27 4.18 18l2.01-6.88L1 7.34h6.61L10 1z" />
													</svg>
												</div>
												<RichTextDisplay
													html={a}
													compact
													className="text-sm text-(--primary-light)"
												/>
											</li>
										))}
									</ul>
								</Section>
							)}

							{mentor.packages.length > 0 && (
								<Section title="Highlights">
									<ul className="space-y-2.5">
										{mentor.packages.map((pkg, i) => (
											<li
												key={i}
												className="flex items-start gap-2.5 text-sm text-(--secondary)"
											>
												<svg
													className="w-4 h-4 text-violet-400 shrink-0 mt-0.5"
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
												<RichTextDisplay
													html={pkg}
													compact
													className="text-sm text-(--primary-light)"
												/>
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
							/>
						</div>

						<MentorPackages
							hourlyRate={hourlyRate ?? null}
							packages={[]}
							pricingPlans={mentor.pricingPlans}
							connectionStatus={connectionStatus}
							connectBtnDisabled={btnConfig.disabled}
							onConnectOrBook={openSlotBookingModal}
						/>
					</div>
				)}

				{activeTab === "mentoredStartups" && (
					<div className="bg-(--accent-subtle) border border-(--border-light) rounded-xl p-5">
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

				{showSlotsModal && (
					<Modal isOpen={showSlotsModal} onClose={() => setShowSlotsModal(false)} variant="dark" title="Select an Available Slot" className="max-w-2xl max-h-[80vh] overflow-y-auto">
						{slotsLoading ? (
							<p className="text-sm text-(--secondary)">Loading slots...</p>
						) : slots.length === 0 ? (
							<p className="text-sm text-(--secondary)">
								This mentor has not published any slots yet.
							</p>
						) : (
							<div className="space-y-3">
								{Object.entries(slotsByDay).map(([day, daySlots]) => (
									<div
										key={day}
										className="rounded-xl border border-(--border-light) p-3 bg-(--accent-subtle)"
									>
										<p className="text-sm font-semibold text-(--primary) mb-2 capitalize">
											{day}
										</p>
										<div className="flex flex-wrap gap-2">
											{daySlots.map((slot) => (
												<button
													key={slot.id}
													onClick={() => handlePickSlot(slot)}
													className="text-xs px-3 py-1.5 rounded-lg border border-(--border) text-(--primary-light) hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10"
												>
													{formatTime(slot.startTime)} –{" "}
													{formatTime(slot.endTime)}
												</button>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</Modal>
				)}

				{showRequestModal && selectedSlot && (
					<Modal isOpen={showRequestModal} onClose={() => !bookingSubmitting && setShowRequestModal(false)} variant="dark" title="Request Booking" className="max-w-md">
						<p className="text-xs text-(--secondary-light) mb-4 -mt-2">
							{selectedSlot.dayOfWeek} · {formatTime(selectedSlot.startTime)}{" "}
							– {formatTime(selectedSlot.endTime)}
						</p>

						<div className="space-y-3">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-1">
									Date
								</label>
								<input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
									className="w-full px-3 py-2 rounded-lg bg-(--accent-subtle) border border-(--border) text-sm text-(--primary) focus:outline-none focus:border-violet-500/50"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-1">
									Message to mentor
								</label>
								<textarea
									rows={4}
									value={requestMessage}
									onChange={(e) => setRequestMessage(e.target.value)}
									placeholder="Tell the mentor what you want to discuss..."
									className="w-full px-3 py-2 rounded-lg bg-(--accent-subtle) border border-(--border) text-sm text-(--primary) placeholder:text-(--secondary-light) focus:outline-none focus:border-violet-500/50 resize-none"
								/>
							</div>


							<div className="mt-4 flex items-center gap-2">
								<button
									onClick={() =>
										!bookingSubmitting && setShowRequestModal(false)
									}
									className="flex-1 px-4 py-2.5 rounded-lg border border-(--border) text-sm text-(--primary-light) hover:text-(--primary)"
									disabled={bookingSubmitting}
								>
									Cancel
								</button>
								<button
									onClick={handleSubmitBookingRequest}
									className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white disabled:bg-violet-600/50"
									disabled={
										bookingSubmitting || !selectedDate || !requestMessage.trim()
									}
								>
									{bookingSubmitting ? "Sending..." : "Send Request"}
								</button>
							</div>
						</div>
					</Modal>
				)}
			</div>
		</div>
	);
}
