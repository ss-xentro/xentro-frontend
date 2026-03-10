'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, FeedbackBanner, CardListSkeleton, EmptyState, ViewModeToggle } from '@/components/ui';
import { Institution } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { InstitutionCard } from './_components/InstitutionCard';
import { DeleteConfirmDialog } from './_components/DeleteConfirmDialog';
import { InstitutionTable } from './_components/InstitutionTable';

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
                <InstitutionTable
                    institutions={filteredInstitutions}
                    onDelete={(id, name) => setDeleteConfirm({ id, name })}
                />
            )}
        </div>
    );
}
