'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, Badge, VerifiedBadge, StatusBadge, FeedbackBanner, CardListSkeleton, EmptyState, ViewModeToggle } from '@/components/ui';
import { institutionTypeLabels, Institution } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function getAuthToken(token: string | null): string | null {
    if (token) return token;
    // Fallback: read from cookie-based session
    const { getSessionToken } = require('@/lib/auth-utils');
    return getSessionToken('admin');
}

export default function InstitutionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const controller = new AbortController();

        async function loadInstitutions() {
            try {
                setLoading(true);
                const response = await fetch('/api/institutions?scope=all', { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Failed to load institutions');
                }

                const { data } = await response.json();
                setInstitutions(data ?? []);
                setError(null);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setError((err as Error).message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadInstitutions();
        return () => controller.abort();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            setDeleting(true);
            const authToken = getAuthToken(token);
            const response = await fetch(`/api/institutions/${id}`, {
                method: 'DELETE',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
            });

            if (!response.ok) {
                throw new Error('Failed to delete institution');
            }

            // Remove from local state
            setInstitutions((prev) => prev.filter((inst) => inst.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setDeleting(false);
        }
    };

    const filteredInstitutions = institutions.filter((institution) => {
        const matchesSearch = institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (institution.city ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || institution.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || institution.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--primary)">Institutions</h2>
                    <p className="text-(--secondary) mt-1">Manage and monitor all onboarded institutions</p>
                </div>
                <Link href="/admin/dashboard/add-institution">
                    <Button>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Institution
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card padding="md">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-50">
                        <Input
                            placeholder="Search institutions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-12 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Types</option>
                        <option value="incubator">Incubator</option>
                        <option value="accelerator">Accelerator</option>
                        <option value="university">University</option>
                        <option value="vc">VC Fund</option>
                        <option value="csr">CSR Program</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                    <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </div>
            </Card>

            {error && (
                <FeedbackBanner type="error" title="Unable to load institutions" message={error} />
            )}

            {loading && <CardListSkeleton count={3} />}

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-(--secondary)">
                    Showing {filteredInstitutions.length} of {institutions.length} institutions
                </p>
            )}

            {/* Empty State */}
            {!loading && filteredInstitutions.length === 0 && institutions.length === 0 && (
                <EmptyState
                    icon={
                        <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                    title="No institutions yet"
                    description="Get started by adding your first institution to the platform."
                    ctaLabel="Add First Institution"
                    ctaHref="/admin/dashboard/add-institution"
                />
            )}

            {/* No Results from Filters */}
            {!loading && filteredInstitutions.length === 0 && institutions.length > 0 && (
                <EmptyState
                    icon={
                        <svg className="w-6 h-6 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                    title="No matching institutions"
                    description="Try adjusting your filters or search query."
                    ctaLabel="Clear all filters"
                    onCtaClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                        setStatusFilter('all');
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <DeleteConfirmDialog
                    institution={deleteConfirm}
                    onConfirm={() => handleDelete(deleteConfirm.id)}
                    onCancel={() => setDeleteConfirm(null)}
                    deleting={deleting}
                />
            )}

            {/* Cards View */}
            {!loading && filteredInstitutions.length > 0 && viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInstitutions.map((institution, index) => (
                        <InstitutionCard key={institution.id} institution={institution} index={index} onDelete={(id, name) => setDeleteConfirm({ id, name })} />
                    ))}
                </div>
            )}

            {/* Table View */}
            {!loading && filteredInstitutions.length > 0 && viewMode === 'table' && (
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
                                {filteredInstitutions.map((institution) => (
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
                                                <Link href={`/institutions/${institution.id}`} className="p-2 text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-md transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link href={`/admin/dashboard/institutions/${institution.id}/edit`} className="p-2 text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-md transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm({ id: institution.id, name: institution.name })}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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
            )}
        </div>
    );
}

function InstitutionCard({ institution, index, onDelete }: { institution: Institution; index: number; onDelete: (id: string, name: string) => void }) {
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

function DeleteConfirmDialog({ institution, onConfirm, onCancel, deleting }: { institution: { id: string; name: string }, onConfirm: () => void, onCancel: () => void, deleting: boolean }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <Card className="max-w-md w-full mx-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-(--primary) mb-2">Delete Institution</h3>
                        <p className="text-(--secondary) mb-4">
                            Are you sure you want to delete <strong>{institution.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={onCancel} disabled={deleting}>
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
