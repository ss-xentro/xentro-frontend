'use client';

import { useState } from 'react';
import { Card, Button, Input, CardListSkeleton, EmptyState, ViewModeToggle } from '@/components/ui';
import { toast } from 'sonner';
import { Institution } from '@/lib/types';
import Link from 'next/link';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { InstitutionCard } from './_components/InstitutionCard';
import { DeleteConfirmDialog } from './_components/DeleteConfirmDialog';
import { InstitutionTable } from './_components/InstitutionTable';

export default function InstitutionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    // --- TanStack Query: fetch institutions ---
    const { data: instRaw, isLoading: loading } = useApiQuery<{ data: Institution[] }>(
        queryKeys.admin.institutions(),
        '/api/institutions?scope=all',
        { requestOptions: { public: true } },
    );
    const institutions = instRaw?.data ?? [];

    // --- TanStack Mutation: delete institution ---
    const deleteMutation = useApiMutation<unknown, { _id: string }>({
        method: 'delete',
        path: (v) => `/api/institutions/${v._id}`,
        invalidateKeys: [queryKeys.admin.institutions()],
        requestOptions: { role: 'admin' },
        mutationOptions: {
            onSuccess: () => setDeleteConfirm(null),
            onError: (err) => toast.error(err.message),
        },
    });
    const deleting = deleteMutation.isPending;

    const handleDelete = (id: string) => {
        deleteMutation.mutate({ _id: id });
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
                    <h1 className="text-2xl font-bold text-(--primary)">Institutions</h1>
                    <p className="text-(--secondary) mt-1">Manage and monitor all onboarded institutions</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/admin/dashboard/institutions/verification-requests" target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary">
                            Verification Requests
                        </Button>
                    </a>
                    <Link href="/admin/dashboard/add-institution">
                        <Button>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Institution
                        </Button>
                    </Link>
                </div>
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
                <InstitutionTable
                    institutions={filteredInstitutions}
                    onDelete={(id, name) => setDeleteConfirm({ id, name })}
                />
            )}
        </div>
    );
}
