'use client';

import { useState } from 'react';

interface ConnectModalProps {
	mentorName: string;
	mentorAvatar?: string | null;
	mentorOccupation?: string;
	onClose: () => void;
	onSubmit: (message: string) => Promise<void>;
}

export default function ConnectModal({ mentorName, mentorAvatar, mentorOccupation, onClose, onSubmit }: ConnectModalProps) {
	const [message, setMessage] = useState('');
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
			<div className="relative bg-[#12141a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
				<button onClick={() => !submitting && onClose()} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div className="flex items-center gap-3 mb-6">
					<div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
						{mentorAvatar ? (
							<img src={mentorAvatar} alt={mentorName} className="w-full h-full object-cover" />
						) : (
							<span className="text-base font-bold text-gray-300">{mentorName.charAt(0).toUpperCase()}</span>
						)}
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white">Connect with {mentorName}</h3>
						{mentorOccupation && <p className="text-xs text-gray-500">{mentorOccupation}</p>}
					</div>
				</div>

				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-300 mb-2">Introduce yourself</label>
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Share why you'd like to connect, what you're working on, and how they can help..."
						rows={4}
						className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
						maxLength={1000}
					/>
					<p className="text-xs text-gray-600 mt-1.5 text-right">{message.length}/1000</p>
				</div>

				<div className="flex gap-3">
					<button onClick={() => !submitting && onClose()} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-400 hover:text-white hover:border-white/20 transition-colors" disabled={submitting}>
						Cancel
					</button>
					<button onClick={handleSubmit} disabled={submitting || !message.trim()} className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
						{submitting ? (
							<>
								<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
								Sending...
							</>
						) : (
							<>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
								Send Request
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
