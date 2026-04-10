"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface ConnectModalProps {
	mentorName: string;
	mentorAvatar?: string | null;
	mentorOccupation?: string;
	onClose: () => void;
	onSubmit: (message: string) => Promise<void>;
}

export default function ConnectModal({
	mentorName,
	mentorAvatar,
	mentorOccupation,
	onClose,
	onSubmit,
}: ConnectModalProps) {
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit(message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal isOpen onClose={() => !submitting && onClose()} variant="dark" className="max-w-md">
			<div className="flex items-center gap-3 mb-6 -mt-1">
				<div className="w-12 h-12 rounded-full bg-(--accent-light) border border-(--border) flex items-center justify-center overflow-hidden">
					{mentorAvatar ? (
						<img
							src={mentorAvatar}
							alt={mentorName}
							className="w-full h-full object-cover"
						/>
					) : (
						<span className="text-base font-bold text-(--primary-light)">
							{mentorName.charAt(0).toUpperCase()}
						</span>
					)}
				</div>
				<div>
					<h3 className="text-lg font-semibold text-(--primary)">
						Connect with {mentorName}
					</h3>
					{mentorOccupation && (
						<p className="text-xs text-(--secondary-light)">{mentorOccupation}</p>
					)}
				</div>
			</div>

			<div className="mb-6">
				<label className="block text-sm font-medium text-(--primary-light) mb-2">
					Your message
				</label>
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Tell them about yourself and your goals..."
					rows={4}
					className="w-full px-4 py-3 bg-(--accent-subtle) border border-(--border) rounded-xl text-sm text-(--primary) placeholder:text-(--secondary-light) focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
					maxLength={1000}
				/>
				<p className="text-xs text-(--secondary-light) mt-1.5 text-right">
					{message.length}/1000
				</p>
			</div>

			<div className="flex gap-3">
				<button
					onClick={() => !submitting && onClose()}
					className="flex-1 px-4 py-2.5 rounded-xl border border-(--border) text-sm font-medium text-(--secondary) hover:text-(--primary) hover:border-(--border-hover) transition-colors"
					disabled={submitting}
				>
					Cancel
				</button>
				<button
					onClick={handleSubmit}
					disabled={submitting || !message.trim()}
					className="flex-1 px-4 py-2.5 rounded-xl bg-brand hover:bg-(--brand-hover) disabled:bg-brand/50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
				>
					{submitting ? (
						<>
							<svg
								className="w-4 h-4 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Sending...
						</>
					) : (
						<>
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
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								/>
							</svg>
							Send Request
						</>
					)}
				</button>
			</div>
		</Modal>
	);
}
