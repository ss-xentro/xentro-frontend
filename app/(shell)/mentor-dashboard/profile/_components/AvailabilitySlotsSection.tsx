"use client";

import { useEffect, useMemo, useState } from "react";
import { SlotEntry, DAYS_OF_WEEK, TIME_OPTIONS } from "../_lib/constants";

interface Props {
	slots: SlotEntry[];
	onAdd: (slot: SlotEntry) => void;
	onRemove: (index: number) => void;
	onUpdate: (index: number, field: keyof SlotEntry, value: string) => void;
}

const DAY_SHORT: Record<string, string> = {
	Monday: "Mon",
	Tuesday: "Tue",
	Wednesday: "Wed",
	Thursday: "Thu",
	Friday: "Fri",
	Saturday: "Sat",
	Sunday: "Sun",
};

export default function AvailabilitySlotsSection({
	slots,
	onAdd,
	onRemove,
	onUpdate,
}: Props) {
	const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);
	const [newStart, setNewStart] = useState("09:00");
	const [newEnd, setNewEnd] = useState("10:00");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editStart, setEditStart] = useState("09:00");
	const [editEnd, setEditEnd] = useState("10:00");
	const [addError, setAddError] = useState<string | null>(null);
	const [editError, setEditError] = useState<string | null>(null);

	/* ── helpers ── */

	const toMinutes = (v: string) => {
		const [h, m] = v.split(":").map(Number);
		return h * 60 + m;
	};

	const toHHMM = (mins: number) => {
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
	};

	const formatTime = (v: string) => {
		const [hRaw, mRaw] = v.split(":").map(Number);
		const suffix = hRaw >= 12 ? "PM" : "AM";
		const h = hRaw % 12 || 12;
		return `${h}:${String(mRaw).padStart(2, "0")} ${suffix}`;
	};

	const getDuration = (start: string, end: string) => {
		const mins = toMinutes(end) - toMinutes(start);
		if (mins <= 0) return "";
		if (mins % 60 === 0) return `${mins / 60}h`;
		if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
		return `${mins}m`;
	};

	const getPeriod = (v: string): "morning" | "afternoon" | "evening" => {
		const h = Number(v.split(":")[0]);
		if (h < 12) return "morning";
		if (h < 17) return "afternoon";
		return "evening";
	};

	const getNextOption = (v: string) => {
		const idx = TIME_OPTIONS.indexOf(v);
		return TIME_OPTIONS[Math.min(idx + 1, TIME_OPTIONS.length - 1)];
	};

	const getPrevOption = (v: string) => {
		const idx = TIME_OPTIONS.indexOf(v);
		return TIME_OPTIONS[Math.max(idx - 1, 0)];
	};

	/** Returns true if [startA, endA) overlaps with [startB, endB) */
	const overlaps = (
		startA: string,
		endA: string,
		startB: string,
		endB: string,
	) =>
		toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);

	/**
	 * Checks whether a proposed [start, end) range conflicts with any
	 * existing slot on `day`. Pass `excludeIndex` when editing so the
	 * slot being edited doesn't block itself.
	 */
	const getOverlapError = (
		day: string,
		start: string,
		end: string,
		excludeIndex?: number,
	): string | null => {
		for (let i = 0; i < slots.length; i++) {
			if (i === excludeIndex) continue;
			const s = slots[i];
			if (s.day !== day) continue;
			if (overlaps(start, end, s.startTime, s.endTime)) {
				const isDuplicate = s.startTime === start && s.endTime === end;
				if (isDuplicate) {
					return `${formatTime(start)} – ${formatTime(end)} already exists on ${day}.`;
				}
				return `Overlaps with ${formatTime(s.startTime)} – ${formatTime(s.endTime)} on ${day}.`;
			}
		}
		return null;
	};

	const splitByBoundaries = (start: string, end: string) => {
		const startMin = toMinutes(start);
		const endMin = toMinutes(end);
		if (endMin <= startMin)
			return [] as { startTime: string; endTime: string }[];
		const boundaries = [12 * 60, 17 * 60].filter(
			(b) => b > startMin && b < endMin,
		);
		const result: { startTime: string; endTime: string }[] = [];
		let cursor = startMin;
		for (const b of boundaries) {
			result.push({ startTime: toHHMM(cursor), endTime: toHHMM(b) });
			cursor = b;
		}
		result.push({ startTime: toHHMM(cursor), endTime: toHHMM(endMin) });
		return result;
	};

	/* ── derived ── */

	const isValidRange = newStart < newEnd;
	const isEditValid = editStart < editEnd;
	const targetPeriod = getPeriod(newStart);

	const dayStats = useMemo(
		() =>
			DAYS_OF_WEEK.map((day) => ({
				day,
				count: slots.filter((s) => s.day === day).length,
			})),
		[slots],
	);

	const daySlots = useMemo(
		() =>
			slots
				.map((s, index) => ({ ...s, index }))
				.filter((s) => s.day === selectedDay)
				.sort((a, b) => a.startTime.localeCompare(b.startTime)),
		[slots, selectedDay],
	);

	const buckets = useMemo(
		() => ({
			morning: daySlots.filter((s) => getPeriod(s.startTime) === "morning"),
			afternoon: daySlots.filter((s) => getPeriod(s.startTime) === "afternoon"),
			evening: daySlots.filter((s) => getPeriod(s.startTime) === "evening"),
		}),
		[daySlots],
	);

	const addSplits = useMemo(
		() => (isValidRange ? splitByBoundaries(newStart, newEnd) : []),
		[newStart, newEnd, isValidRange],
	);

	const editSplits = useMemo(
		() => (isEditValid ? splitByBoundaries(editStart, editEnd) : []),
		[editStart, editEnd, isEditValid],
	);

	/* ── handlers ── */

	const handleNewStartChange = (v: string) => {
		setAddError(null);
		setNewStart(v);
		if (toMinutes(v) >= toMinutes(newEnd)) setNewEnd(getNextOption(v));
	};

	const handleNewEndChange = (v: string) => {
		setAddError(null);
		setNewEnd(v);
		if (toMinutes(v) <= toMinutes(newStart)) setNewStart(getPrevOption(v));
	};

	const handleEditStartChange = (v: string) => {
		setEditError(null);
		setEditStart(v);
		if (toMinutes(v) >= toMinutes(editEnd)) setEditEnd(getNextOption(v));
	};

	const handleEditEndChange = (v: string) => {
		setEditError(null);
		setEditEnd(v);
		if (toMinutes(v) <= toMinutes(editStart)) setEditStart(getPrevOption(v));
	};

	const handleAddSlot = () => {
		if (!isValidRange) return;
		// Check each segment that would be created against existing slots
		for (const seg of addSplits) {
			const err = getOverlapError(selectedDay, seg.startTime, seg.endTime);
			if (err) {
				setAddError(err);
				return;
			}
		}
		setAddError(null);
		for (const seg of addSplits) {
			onAdd({
				day: selectedDay,
				startTime: seg.startTime,
				endTime: seg.endTime,
			});
		}
	};

	const handleQuickAdd = (period: "morning" | "afternoon" | "evening") => {
		const map = {
			morning: ["09:00", "10:00"],
			afternoon: ["14:00", "15:00"],
			evening: ["18:00", "19:00"],
		};
		const [s, e] = map[period];
		const err = getOverlapError(selectedDay, s, e);
		if (err) {
			setAddError(err);
			return;
		}
		setAddError(null);
		onAdd({ day: selectedDay, startTime: s, endTime: e });
	};

	const openEdit = (index: number) => {
		const slot = slots[index];
		if (!slot) return;
		setEditStart(slot.startTime);
		setEditEnd(slot.endTime);
		setEditingIndex(index);
	};

	const cancelEdit = () => {
		if (editingIndex !== null && slots[editingIndex]) {
			setEditStart(slots[editingIndex].startTime);
			setEditEnd(slots[editingIndex].endTime);
		}
		setEditingIndex(null);
		setEditError(null);
	};

	const saveEdit = () => {
		if (editingIndex === null || !isEditValid) return;
		const current = slots[editingIndex];
		if (!current) return;
		const segs = splitByBoundaries(editStart, editEnd);
		if (segs.length === 0) return;
		// Check all segments against existing slots, excluding the one being edited
		for (const seg of segs) {
			const err = getOverlapError(
				current.day,
				seg.startTime,
				seg.endTime,
				editingIndex,
			);
			if (err) {
				setEditError(err);
				return;
			}
		}
		setEditError(null);
		onUpdate(editingIndex, "startTime", segs[0].startTime);
		onUpdate(editingIndex, "endTime", segs[0].endTime);
		for (let i = 1; i < segs.length; i++) {
			onAdd({
				day: current.day,
				startTime: segs[i].startTime,
				endTime: segs[i].endTime,
			});
		}
		setEditingIndex(null);
	};

	const removeSlot = (index: number) => {
		onRemove(index);
		setEditingIndex(null);
	};

	useEffect(() => {
		if (editingIndex === null) return;
		const slot = slots[editingIndex];
		if (!slot) {
			setEditingIndex(null);
			return;
		}
		setEditStart(slot.startTime);
		setEditEnd(slot.endTime);
		setEditError(null);
	}, [editingIndex]);

	// Clear add-error when the selected day changes (different day = different context)
	useEffect(() => {
		setAddError(null);
	}, [selectedDay]);

	/* ── sub-components ── */

	const periodIcon = (p: "morning" | "afternoon" | "evening") => {
		if (p === "morning")
			return (
				<svg
					className="w-3.5 h-3.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
					/>
				</svg>
			);
		if (p === "afternoon")
			return (
				<svg
					className="w-3.5 h-3.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					strokeWidth={2}
				>
					<circle cx="12" cy="12" r="4" />
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 2v2m0 16v2M2 12h2m16 0h2"
					/>
				</svg>
			);
		return (
			<svg
				className="w-3.5 h-3.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		);
	};

	const periodColors: Record<string, string> = {
		morning: "text-amber-400",
		afternoon: "text-sky-400",
		evening: "text-indigo-400",
	};

	const selectClass = `
		h-10 w-full px-3 pr-8
		bg-(--accent-subtle) border border-(--border)
		rounded-lg text-sm text-(--primary)
		appearance-none cursor-pointer
		focus:outline-none focus:border-(--border-hover)
		transition-colors
	`;

	return (
		<div className="space-y-5 w-full">
			{/* Header */}
			<div className="flex items-start gap-3">
				<div className="w-9 h-9 rounded-lg bg-(--accent-subtle) border border-(--border) flex items-center justify-center shrink-0">
					<svg
						className="w-4 h-4 text-(--secondary-light)"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-3 flex-wrap">
						<h3 className="text-sm font-semibold text-(--primary)">
							Available Slots
						</h3>
						<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--accent-subtle) border border-(--border) text-xs text-(--secondary)">
							{slots.length} total
						</span>
						{daySlots.length > 0 && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--accent-light) border border-(--border) text-xs text-(--primary)">
								{DAY_SHORT[selectedDay]}: {daySlots.length}
							</span>
						)}
					</div>
					<p className="text-xs text-(--secondary-light) mt-0.5">
						Select a day, define a time range, then save your profile.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
				{/* ── Day picker ── */}
				<div className="xl:col-span-3 rounded-xl border border-(--border) bg-(--accent-subtle) p-3 space-y-1 xl:sticky xl:top-6 h-fit">
					<p className="text-[10px] uppercase tracking-widest text-(--secondary-light) font-medium px-1 pb-1">
						Day
					</p>
					{dayStats.map(({ day, count }) => {
						const active = day === selectedDay;
						return (
							<button
								type="button"
								key={day}
								onClick={() => {
									setSelectedDay(day);
									cancelEdit();
								}}
								className={`
									w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
									transition-colors duration-150
									${
										active
											? "bg-(--accent-light) text-(--primary) font-medium"
											: "text-(--secondary) hover:text-(--primary) hover:bg-(--accent-subtle)"
									}
								`}
							>
								<span>{day}</span>
								{count > 0 ? (
									<span
										className={`
										min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs font-semibold px-1
										${active ? "bg-(--primary) text-(--background)" : "bg-(--accent-light) text-(--primary-light)"}
									`}
									>
										{count}
									</span>
								) : (
									<span className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs text-(--secondary-light)">
										–
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* ── Main panel ── */}
				<div className="xl:col-span-9 space-y-4">
					{/* Add slot row */}
					<div className="rounded-xl border border-(--border) bg-(--accent-subtle) p-4 space-y-3">
						<div className="flex items-center justify-between gap-2">
							<p className="text-xs font-semibold text-(--primary)/80 uppercase tracking-wide">
								Add New Slot
							</p>
							<span className="text-xs text-(--secondary-light)">
								{selectedDay} ·{" "}
								<span className={`${periodColors[targetPeriod]}`}>
									{targetPeriod.charAt(0).toUpperCase() + targetPeriod.slice(1)}
								</span>
							</span>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
							{/* Day */}
							<div className="relative">
								<label className="block text-[10px] uppercase tracking-widest text-(--secondary-light) mb-1.5 font-medium">
									Day
								</label>
								<div className="relative">
									<select
										value={selectedDay}
										onChange={(e) => {
											setSelectedDay(e.target.value);
											cancelEdit();
										}}
										className={selectClass}
									>
										{DAYS_OF_WEEK.map((d) => (
											<option key={d} value={d}>
												{d}
											</option>
										))}
									</select>
									<svg
										className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--secondary-light)"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>

							{/* Start */}
							<div className="relative">
								<label className="block text-[10px] uppercase tracking-widest text-(--secondary-light) mb-1.5 font-medium">
									From
								</label>
								<div className="relative">
									<select
										value={newStart}
										onChange={(e) => handleNewStartChange(e.target.value)}
										className={selectClass}
									>
										{TIME_OPTIONS.map((t) => (
											<option
												key={t}
												value={t}
												disabled={toMinutes(t) >= toMinutes(newEnd)}
											>
												{formatTime(t)}
											</option>
										))}
									</select>
									<svg
										className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--secondary-light)"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>

							{/* End */}
							<div className="relative">
								<label className="block text-[10px] uppercase tracking-widest text-(--secondary-light) mb-1.5 font-medium">
									To
								</label>
								<div className="relative">
									<select
										value={newEnd}
										onChange={(e) => handleNewEndChange(e.target.value)}
										className={selectClass}
									>
										{TIME_OPTIONS.map((t) => (
											<option
												key={t}
												value={t}
												disabled={toMinutes(t) <= toMinutes(newStart)}
											>
												{formatTime(t)}
											</option>
										))}
									</select>
									<svg
										className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--secondary-light)"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>

							{/* CTA */}
							<div className="flex flex-col">
								<label className="block text-[10px] uppercase tracking-widest text-transparent mb-1.5 select-none">
									Add
								</label>
								<button
									type="button"
									onClick={handleAddSlot}
									disabled={!isValidRange}
									className="
										h-10 px-5 rounded-lg text-sm font-semibold
										bg-(--primary) text-(--background)
										hover:bg-(--primary)/90
										disabled:opacity-30 disabled:cursor-not-allowed
										transition-colors duration-150
										flex items-center justify-center gap-1.5
										whitespace-nowrap
									"
								>
									<svg
										className="w-3.5 h-3.5 shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2.5}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 4v16m8-8H4"
										/>
									</svg>
									Add Slot
								</button>
							</div>
						</div>

						{/* Duration preview + overlap error */}
						{isValidRange && !addError && (
							<div className="flex items-center gap-2 pt-0.5">
								<span className="text-xs text-(--secondary-light)">Duration:</span>
								<span className="text-xs font-medium text-(--secondary)">
									{getDuration(newStart, newEnd)}
								</span>
								{addSplits.length > 1 && (
									<span className="text-xs text-amber-400/80 ml-1">
										· Spans periods — will create {addSplits.length} slots
									</span>
								)}
							</div>
						)}
						{addError && (
							<div className="flex items-center gap-2 pt-0.5">
								<svg
									className="w-3.5 h-3.5 text-red-400 shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
									/>
								</svg>
								<span className="text-xs text-red-400">{addError}</span>
							</div>
						)}
					</div>

					{/* Period columns */}
					<div className="grid grid-cols-1 2xl:grid-cols-3 gap-3">
						{(["morning", "afternoon", "evening"] as const).map((period) => {
							const list = buckets[period];
							const labels: Record<string, string> = {
								morning: "Morning",
								afternoon: "Afternoon",
								evening: "Evening",
							};
							return (
								<div
									key={period}
									className="rounded-xl border border-(--border) bg-(--accent-subtle) overflow-hidden"
								>
									{/* Period header */}
									<div className="flex items-center justify-between px-3 py-2.5 border-b border-(--border-light)">
										<div
											className={`flex items-center gap-1.5 text-xs font-semibold ${periodColors[period]}`}
										>
											{periodIcon(period)}
											{labels[period]}
										</div>
										<button
											type="button"
											onClick={() => handleQuickAdd(period)}
											className="text-[11px] text-(--secondary-light) hover:text-(--primary) transition-colors flex items-center gap-0.5"
										>
											<svg
												className="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												strokeWidth={2.5}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M12 4v16m8-8H4"
												/>
											</svg>
											Quick add
										</button>
									</div>

									{/* Slots */}
									<div className="p-2.5 min-h-[80px]">
										{list.length === 0 ? (
											<p className="text-xs text-(--secondary-light) py-3 text-center">
												No {period} slots
											</p>
										) : (
											<div className="space-y-1.5">
												{list.map((slot) => {
													const isEditing = editingIndex === slot.index;
													return (
														<button
															type="button"
															key={slot.index}
															onClick={() =>
																isEditing ? cancelEdit() : openEdit(slot.index)
															}
															className={`
																group w-full text-left px-3 py-2.5 rounded-lg border
																transition-all duration-150
																${
																	isEditing
																		? "bg-(--accent-light) border-(--border-hover) ring-1 ring-white/15"
																		: "bg-transparent border-(--border-light) hover:bg-(--accent-subtle) hover:border-(--border)"
																}
															`}
														>
															<div className="flex items-center justify-between gap-2">
																<span
																	className={`text-sm font-medium ${isEditing ? "text-(--primary)" : "text-(--primary-light)"}`}
																>
																	{formatTime(slot.startTime)}
																	<span className="mx-1.5 text-(--secondary-light)">
																		→
																	</span>
																	{formatTime(slot.endTime)}
																</span>
																<span className="text-[11px] text-(--secondary-light) shrink-0">
																	{getDuration(slot.startTime, slot.endTime)}
																</span>
															</div>
															{isEditing && (
																<p className="text-[11px] text-(--secondary-light) mt-0.5">
																	Editing below ↓
																</p>
															)}
														</button>
													);
												})}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Edit toolbar */}
					{editingIndex !== null && slots[editingIndex] && (
						<div className="rounded-xl border border-(--border) bg-(--accent-subtle) p-4 space-y-3">
							<div className="flex items-center justify-between gap-2">
								<p className="text-xs font-semibold text-(--primary)/80 uppercase tracking-wide">
									Edit Slot
								</p>
								<span className="text-xs text-(--secondary-light)">
									{slots[editingIndex].day}
								</span>
							</div>

							<div className="flex flex-wrap items-end gap-2">
								{/* Edit from */}
								<div className="relative flex-1 min-w-[130px]">
									<label className="block text-[10px] uppercase tracking-widest text-(--secondary-light) mb-1.5 font-medium">
										From
									</label>
									<div className="relative">
										<select
											value={editStart}
											onChange={(e) => handleEditStartChange(e.target.value)}
											className={selectClass}
										>
											{TIME_OPTIONS.map((t) => (
												<option
													key={t}
													value={t}
													disabled={toMinutes(t) >= toMinutes(editEnd)}
												>
													{formatTime(t)}
												</option>
											))}
										</select>
										<svg
											className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--secondary-light)"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>

								<span className="text-(--secondary-light) text-sm pb-2.5 shrink-0">→</span>

								{/* Edit to */}
								<div className="relative flex-1 min-w-[130px]">
									<label className="block text-[10px] uppercase tracking-widest text-(--secondary-light) mb-1.5 font-medium">
										To
									</label>
									<div className="relative">
										<select
											value={editEnd}
											onChange={(e) => handleEditEndChange(e.target.value)}
											className={selectClass}
										>
											{TIME_OPTIONS.map((t) => (
												<option
													key={t}
													value={t}
													disabled={toMinutes(t) <= toMinutes(editStart)}
												>
													{formatTime(t)}
												</option>
											))}
										</select>
										<svg
											className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--secondary-light)"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>

								{/* Duration preview */}
								{isEditValid && (
									<div className="pb-2.5 shrink-0">
										<span className="text-xs text-(--secondary-light)">
											{getDuration(editStart, editEnd)}
										</span>
									</div>
								)}

								{/* Actions */}
								<div className="flex items-end gap-2 shrink-0 pb-0">
									<button
										type="button"
										onClick={cancelEdit}
										className="
											h-10 px-4 rounded-lg border border-(--border) text-sm text-(--secondary)
											hover:text-(--primary) hover:border-(--border-hover) transition-colors
										"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={saveEdit}
										disabled={!isEditValid}
										className="
											h-10 px-4 rounded-lg text-sm font-semibold
											bg-(--primary) text-(--background)
											hover:bg-(--primary)/90
											disabled:opacity-30 disabled:cursor-not-allowed
											transition-colors
										"
									>
										Save
									</button>
									<button
										type="button"
										onClick={() => removeSlot(editingIndex)}
										className="
											h-10 px-3 rounded-lg border border-red-500/25 text-red-400 text-sm
											hover:bg-red-500/10 hover:border-red-500/40 transition-colors
										"
									>
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
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>

							{editSplits.length > 1 && !editError && (
								<p className="text-xs text-amber-400/80">
									Range spans periods — will create {editSplits.length} slots on
									save.
								</p>
							)}
							{!isEditValid && (
								<p className="text-xs text-red-400/80">
									End time must be after start time.
								</p>
							)}
							{editError && (
								<div className="flex items-center gap-2">
									<svg
										className="w-3.5 h-3.5 text-red-400 shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
										/>
									</svg>
									<span className="text-xs text-red-400">{editError}</span>
								</div>
							)}
						</div>
					)}

					{/* Empty state */}
					{slots.length === 0 && (
						<div className="rounded-xl border border-dashed border-(--border) p-6 text-center">
							<div className="w-10 h-10 rounded-full bg-(--accent-subtle) flex items-center justify-center mx-auto mb-3">
								<svg
									className="w-5 h-5 text-(--secondary-light)"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<p className="text-sm text-(--secondary-light)">No slots yet.</p>
							<p className="text-xs text-(--secondary-light) mt-0.5">
								Use the form above to set your availability.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
