'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { EndorsementRequest } from '../_lib/constants';

interface EndorsementPanelProps {
	endorsements: EndorsementRequest[];
	loading: boolean;
	onRespond: (id: string, action: 'accepted' | 'rejected', comment: string) => void;
}

export default function EndorsementPanel({ endorsements, loading, onRespond }: EndorsementPanelProps) {
	const [respondingId, setRespondingId] = useState<string | null>(null);
	const [responseComment, setResponseComment] = useState('');

	const handleRespond = (id: string, action: 'accepted' | 'rejected') => {
		onRespond(id, action, responseComment);
		setRespondingId(null);
		setResponseComment('');
	};

	return (
		<Card className="p-6 bg-blue-50 border-blue-100 space-y-4">
			<h3 className="font-semibold text-gray-900">Pending Startup Endorsement Requests</h3>
			{loading ? (
				<p className="text-sm text-gray-500">Loading requests...</p>
			) : endorsements.length === 0 ? (
				<p className="text-sm text-gray-500">No pending endorsement requests from startups.</p>
			) : (
				<div className="space-y-3">
					{endorsements.map((e) => (
						<div key={e.id} className="bg-white border border-gray-200 rounded-lg p-4">
							<div className="flex items-start justify-between">
								<div>
									<p className="font-semibold text-gray-900">{e.requesterName}</p>
									<p className="text-sm text-gray-500">{e.requesterEmail}</p>
									{e.message && (
										<p className="text-sm text-gray-600 mt-1 italic">&ldquo;{e.message}&rdquo;</p>
									)}
									<p className="text-xs text-gray-400 mt-1">{new Date(e.createdAt).toLocaleDateString()}</p>
								</div>
								{respondingId === e.id ? (
									<div className="space-y-2 ml-4 min-w-50">
										<textarea
											value={responseComment}
											onChange={(ev) => setResponseComment(ev.target.value)}
											placeholder="Add a comment..."
											rows={2}
											className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
										/>
										<div className="flex gap-2">
											<button onClick={() => handleRespond(e.id, 'accepted')} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">Accept</button>
											<button onClick={() => handleRespond(e.id, 'rejected')} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
											<button onClick={() => { setRespondingId(null); setResponseComment(''); }} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">Cancel</button>
										</div>
									</div>
								) : (
									<button onClick={() => setRespondingId(e.id)} className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800">Respond</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</Card>
	);
}
