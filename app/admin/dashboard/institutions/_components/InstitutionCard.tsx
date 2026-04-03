'use client';

import { useRouter } from 'next/navigation';
import { Card, Button, Badge, VerifiedBadge, StatusBadge } from '@/components/ui';
import { institutionTypeLabels, Institution } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';

interface InstitutionCardProps {
	institution: Institution;
	index: number;
	onDelete: (id: string, name: string) => void;
}

export function InstitutionCard({ institution, index, onDelete }: InstitutionCardProps) {
	const router = useRouter();
	const typeInfo = institutionTypeLabels[institution.type] ?? { label: institution.type, icon: 'building', description: '' };

	return (
		<Card
			hoverable
			className={`animate-fadeInUp`}
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<div className="flex items-start justify-between mb-4">
				<div className="w-12 h-12 rounded-lg bg-(--surface) border border-(--border) flex items-center justify-center overflow-hidden">
					{institution.logo ? (
						<img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
					) : (
						<AppIcon name={typeInfo.icon} className="w-6 h-6 text-(--secondary)" />
					)}
				</div>
				<StatusBadge status={institution.status} />
			</div>

			<div className="flex items-center gap-2 mb-2">
				<h3 className="font-semibold text-(--primary)">{institution.name}</h3>
				{institution.verified && <VerifiedBadge />}
			</div>

			<p className="text-sm text-(--secondary) mb-4 line-clamp-2">{institution.tagline ?? 'No tagline yet.'}</p>

			<div className="flex items-center gap-4 text-sm text-(--secondary) mb-4">
				<span className="flex items-center gap-1">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{institution.city ?? 'Unknown'}
				</span>
				<Badge variant="outline" size="sm">{typeInfo.label}</Badge>
			</div>

			<div className="flex items-center gap-4 py-4 border-t border-(--border)">
				<div className="text-center flex-1">
					<p className="text-lg font-semibold text-(--primary)">{formatNumber(institution.startupsSupported ?? 0)}</p>
					<p className="text-xs text-(--secondary)">Startups</p>
				</div>
				<div className="w-px h-8 bg-(--border)" />
				<div className="text-center flex-1">
					<p className="text-lg font-semibold text-(--primary)">{formatNumber(institution.studentsMentored ?? 0)}</p>
					<p className="text-xs text-(--secondary)">Mentored</p>
				</div>
			</div>

			<div className="flex gap-2 pt-4 border-t border-(--border)">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => router.push(`/admin/dashboard/institutions/${institution.id}/preview`)}
				>
					<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
					Preview
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push(`/admin/dashboard/institutions/${institution.id}/edit`)}
				>
					<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
					Edit
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete(institution.id, institution.name)}
					className="text-red-600 hover:text-red-700 hover:bg-red-500/15"
				>
					<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Delete
				</Button>
			</div>
		</Card>
	);
}
