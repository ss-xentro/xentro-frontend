'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, EmptyState } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface Institution {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	tagline: string | null;
	city: string | null;
	country: string | null;
}

interface EndorsementRequest {
	id: string;
	institutionName: string;
	institutionSlug: string;
	institutionLogo: string | null;
	entityType: string;
	message: string | null;
	status: string;
	responseComment: string | null;
	createdAt: string;
}

export default function EndorsementsPage() {
	const router = useRouter();
	const [endorsements, setEndorsements] = useState<EndorsementRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [institutions, setInstitutions] = useState<Institution[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [showRequestForm, setShowRequestForm] = useState(false);
	const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
	const [requestMessage, setRequestMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		loadEndorsements();
	}, []);

	const loadEndorsements = async () => {
		try {
			const token = getSessionToken('mentor');
			if (!token) {
				router.push('/login');
				return;
			}

			const res = await fetch('/api/endorsements/', {
				headers: { 'Authorization': `Bearer ${token}` },
			});
			if (res.ok) {
				const data = await res.json();
				setEndorsements(data.data || data.endorsements || []);
			}
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	};

	const searchInstitutions = async (query: string) => {
		setSearchQuery(query);
		if (query.length < 2) {
			setInstitutions([]);
			return;
		}
		try {
			const res = await fetch(`/api/institutions/?search=${encodeURIComponent(query)}`);
			if (res.ok) {
				const data = await res.json();
				setInstitutions(data.institutions || data.data || []);
			}
		} catch {
			// silently fail
		}
	};

	const handleRequestEndorsement = async () => {
		if (!selectedInstitution) return;
		setSubmitting(true);

		try {
			const token = getSessionToken('mentor');
			if (!token) throw new Error('Authentication required');

			const res = await fetch('/api/endorsements/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					institutionId: selectedInstitution.id,
					message: requestMessage,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to send request');

			setShowRequestForm(false);
			setSelectedInstitution(null);
			setRequestMessage('');
			setSearchQuery('');
			setInstitutions([]);
			loadEndorsements();
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	const statusColor = (status: string) => {
		switch (status) {
			case 'accepted': return 'bg-emerald-500/15 text-emerald-400';
			case 'rejected': return 'bg-red-500/15 text-red-400';
			default: return 'bg-amber-500/15 text-amber-400';
		}
	};

	return (
		<div className="p-8 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-(--primary) mb-2">Endorsements</h1>
					<p className="text-sm text-(--secondary)">Request endorsement from institutions and track your requests.</p>
				</div>
				<Button onClick={() => setShowRequestForm(!showRequestForm)}>
					Request Endorsement
				</Button>
			</div>

			{/* Request form */}
			{showRequestForm && (
				<Card className="p-6 bg-accent/10 border-accent/20 space-y-4">
					<h3 className="font-semibold text-(--primary)">Request Endorsement from an Institution</h3>
					<p className="text-sm text-(--secondary)">Search for an institution and send them an endorsement request.</p>

					<div>
						<label className="block text-xs font-medium text-(--secondary) mb-2">Search Institution</label>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => searchInstitutions(e.target.value)}
							className="w-full px-4 py-3 text-sm text-(--primary) bg-(--surface) border border-(--border) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors"
							placeholder="Type institution name..."
						/>
					</div>

					{institutions.length > 0 && !selectedInstitution && (
						<div className="border border-(--border) rounded-lg max-h-48 overflow-y-auto">
							{institutions.map((inst) => (
								<button
									key={inst.id}
									type="button"
									onClick={() => { setSelectedInstitution(inst); setInstitutions([]); setSearchQuery(inst.name); }}
									className="w-full px-4 py-3 text-left hover:bg-(--surface-hover) border-b border-(--border) last:border-b-0 transition-colors"
								>
									<p className="font-medium text-(--primary) text-sm">{inst.name}</p>
									<p className="text-xs text-(--secondary)">{inst.city}{inst.city && inst.country ? ', ' : ''}{inst.country}</p>
								</button>
							))}
						</div>
					)}

					{selectedInstitution && (
						<div className="bg-(--surface) border border-(--border) rounded-lg p-4 flex items-center justify-between">
							<div>
								<p className="font-semibold text-(--primary)">{selectedInstitution.name}</p>
								<p className="text-xs text-(--secondary)">{selectedInstitution.city}{selectedInstitution.city && selectedInstitution.country ? ', ' : ''}{selectedInstitution.country}</p>
							</div>
							<button
								onClick={() => { setSelectedInstitution(null); setSearchQuery(''); }}
								className="text-sm text-(--secondary) hover:text-(--primary)"
							>
								Change
							</button>
						</div>
					)}

					<div>
						<label className="block text-xs font-medium text-(--secondary) mb-2">Message (optional)</label>
						<textarea
							value={requestMessage}
							onChange={(e) => setRequestMessage(e.target.value)}
							rows={3}
							className="w-full px-4 py-3 text-sm text-(--primary) bg-(--surface) border border-(--border) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors resize-none"
							placeholder="Tell the institution why you'd like their endorsement..."
						/>
					</div>

					<div className="flex gap-3">
						<Button
							onClick={handleRequestEndorsement}
							disabled={!selectedInstitution || submitting}
						>
							{submitting ? 'Sending...' : 'Send Request'}
						</Button>
						<Button variant="secondary" onClick={() => { setShowRequestForm(false); setSelectedInstitution(null); setSearchQuery(''); setRequestMessage(''); }}>
							Cancel
						</Button>
					</div>
				</Card>
			)}

			{/* Endorsement list */}
			{loading ? (
				<div className="animate-pulse space-y-4">
					<div className="h-20 bg-(--surface) rounded-lg"></div>
					<div className="h-20 bg-(--surface) rounded-lg"></div>
				</div>
			) : endorsements.length === 0 ? (
				<EmptyState
					icon={
						<svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					}
					title="No endorsements yet"
					description="Request endorsement from institutions to boost your profile credibility."
				/>
			) : (
				<div className="space-y-3">
					{endorsements.map((endorsement) => (
						<Card key={endorsement.id} className="p-5">
							<div className="flex items-start justify-between">
								<div>
									<h4 className="font-semibold text-(--primary)">{endorsement.institutionName}</h4>
									<span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded capitalize ${statusColor(endorsement.status)}`}>
										{endorsement.status}
									</span>
									{endorsement.message && (
										<p className="text-sm text-(--secondary) mt-2">Your message: &ldquo;{endorsement.message}&rdquo;</p>
									)}
									{endorsement.responseComment && (
										<p className="text-sm text-(--secondary) mt-2 bg-(--surface-hover) p-3 rounded-lg">
											<span className="font-medium">Institution response:</span> {endorsement.responseComment}
										</p>
									)}
								</div>
								<p className="text-xs text-(--secondary)">
									{new Date(endorsement.createdAt).toLocaleDateString()}
								</p>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
