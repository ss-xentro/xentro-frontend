'use client';

import React from 'react';

/* ── Badge components ── */

export function VerifiedBadge({ verified, status }: { verified: boolean; status: string }) {
	if (verified) {
		return (
			<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
				<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-1.06-1.06 3 3 0 01-5.304 0 3 3 0 00-1.06 1.06 3 3 0 010 5.304 3 3 0 001.06 1.06 3 3 0 015.304 0 3 3 0 001.06-1.06zM13.28 8.72a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.47-2.47a.75.75 0 011.06 0z" clipRule="evenodd" />
				</svg>
				Verified
			</span>
		);
	}
	if (status === 'approved') {
		return (
			<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
				<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
				</svg>
				Approved
			</span>
		);
	}
	return null;
}

export function InstitutionalBadge({ name }: { name: string }) {
	return (
		<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
			<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
			</svg>
			{name} Mentor
		</span>
	);
}

/* ── Stat card ── */
export function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
	return (
		<div className="bg-white/3 border border-white/6 rounded-xl px-4 py-3">
			<div className="flex items-center gap-2 text-gray-500 mb-1">
				{icon}
				<span className="text-xs">{label}</span>
			</div>
			<p className="text-xl font-bold text-white">{value}</p>
		</div>
	);
}

/* ── Section wrapper ── */
export function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className="bg-white/3 border border-white/6 rounded-xl p-6">
			<div className="flex items-center gap-2 mb-4">
				{icon}
				<h2 className="text-base font-semibold text-white">{title}</h2>
			</div>
			{children}
		</div>
	);
}

/* ── Time formatting helpers ── */
export const DAY_LABELS: Record<string, string> = {
	monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
	thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
export const FULL_DAY: Record<string, string> = {
	monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
	thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
export const ORDERED_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function formatTime(t: string) {
	const [hStr, mStr] = t.split(':');
	let h = parseInt(hStr, 10);
	const m = mStr || '00';
	const ampm = h >= 12 ? 'PM' : 'AM';
	if (h > 12) h -= 12;
	if (h === 0) h = 12;
	return `${h}:${m} ${ampm}`;
}

export function formatTimeSlot(slot: string) {
	const parts = slot.split('-');
	if (parts.length !== 2) return slot;
	return `${formatTime(parts[0])} – ${formatTime(parts[1])}`;
}

export function getNextDateForDay(dayName: string): string {
	const dayIndex: Record<string, number> = {
		monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
		friday: 5, saturday: 6, sunday: 0,
	};
	const target = dayIndex[dayName.toLowerCase()];
	if (target === undefined) return '';
	const now = new Date();
	const current = now.getDay();
	let diff = target - current;
	if (diff <= 0) diff += 7;
	const next = new Date(now);
	next.setDate(now.getDate() + diff);
	return next.toISOString().split('T')[0];
}
