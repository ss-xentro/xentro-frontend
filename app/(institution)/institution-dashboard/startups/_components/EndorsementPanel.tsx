'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
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
		<Card className="p-6 bg-(--accent-subtle) border-(--border) space-y-4">
			<h3 className="font-semibold text-(--primary)">Pending Startup Endorsement Requests</h3>
			{loading ? (
				<p className="text-sm text-(--secondary)">Loading requests...</p>
			) : endorsements.length === 0 ? (
				<p className="text-sm text-(--secondary)">No pending endorsement requests from startups.</p>
			) : (
				<div className="space-y-3">
					{endorsements.map((e) => (
						<div key={e.id} className="bg-(--accent-subtle) border border-(--border) rounded-lg p-4">
							<div className="flex items-start justify-between">
								<div>
									<p className="font-semibold text-(--primary)">{e.requesterName}</p>
									<p className="text-sm text-(--secondary)">{e.requesterEmail}</p>
									{e.message && (
										<p className="text-sm text-(--primary-light) mt-1 italic">&ldquo;{e.message}&rdquo;</p>
									)}
									<p className="text-xs text-(--secondary-light) mt-1">{new Date(e.createdAt).toLocaleDateString()}</p>
								</div>
								{respondingId === e.id ? (
									<div className="space-y-2 ml-4 min-w-50">
										<textarea
											value={responseComment}
											onChange={(ev) => setResponseComment(ev.target.value)}
											placeholder="Add a comment..."
											rows={2}
											className="w-full px-3 py-2 text-sm bg-(--accent-light) border border-(--border) text-(--primary) rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
										/>
										<div className="flex gap-2">
											<Button variant="primary" size="sm" onClick={() => handleRespond(e.id, 'accepted')}>Accept</Button>
											<Button variant="danger" size="sm" onClick={() => handleRespond(e.id, 'rejected')}>Reject</Button>
											<Button variant="ghost" size="sm" onClick={() => { setRespondingId(null); setResponseComment(''); }}>Cancel</Button>
										</div>
									</div>
								) : (
									<Button variant="secondary" size="sm" onClick={() => setRespondingId(e.id)}>Respond</Button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</Card>
	);
}
