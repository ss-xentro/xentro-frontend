'use client';

import Link from 'next/link';
import { Card, Badge, VerifiedBadge, StatusBadge } from '@/components/ui';
import { institutionTypeLabels, Institution } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';

interface InstitutionTableProps {
	institutions: Institution[];
	onDelete: (id: string, name: string) => void;
}

export function InstitutionTable({ institutions, onDelete }: InstitutionTableProps) {
	return (
		<Card padding="none" className="overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-(--surface-hover) border-b border-(--border)">
							<th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Institution</th>
							<th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Type</th>
							<th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Location</th>
							<th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Status</th>
							<th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Startups</th>
							<th className="text-right px-6 py-4 text-sm font-medium text-(--secondary)">Actions</th>
						</tr>
					</thead>
					<tbody>
						{institutions.map((institution) => (
							<tr key={institution.id} className="border-b border-(--border) hover:bg-(--surface-hover) transition-colors">
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-md bg-(--surface) border border-(--border) flex items-center justify-center overflow-hidden">
											{institution.logo ? (
												<img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
											) : (
												<AppIcon name={(institutionTypeLabels[institution.type]?.icon) ?? 'building'} className="w-5 h-5 text-(--secondary)" />
											)}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium text-(--primary)">{institution.name}</span>
												{institution.verified && <VerifiedBadge />}
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4">
									<Badge variant="outline">{institutionTypeLabels[institution.type]?.label ?? institution.type}</Badge>
								</td>
								<td className="px-6 py-4 text-(--secondary)">
									{institution.city ?? 'Unknown'}, {institution.country ?? ''}
								</td>
								<td className="px-6 py-4">
									<StatusBadge status={institution.status} />
								</td>
								<td className="px-6 py-4 text-(--primary) font-medium">
									{formatNumber(institution.startupsSupported ?? 0)}
								</td>
								<td className="px-6 py-4 text-right">
									<div className="flex items-center justify-end gap-2">
										<Link href={`/institutions/${institution.id}`} className="p-2 text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-md transition-colors" aria-label="View institution">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										</Link>
										<Link href={`/admin/dashboard/institutions/${institution.id}/edit`} className="p-2 text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-md transition-colors" aria-label="Edit institution">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</Link>
										<button
											onClick={() => onDelete(institution.id, institution.name)}
											className="p-2 text-red-600 hover:text-red-700 hover:bg-red-500/15 rounded-md transition-colors"
											aria-label="Delete institution"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
