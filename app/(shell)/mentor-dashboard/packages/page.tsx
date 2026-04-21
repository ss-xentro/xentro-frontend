'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import { useApiQuery, useApiMutation, queryKeys } from '@/lib/queries';

interface MentorPackage {
    id: string;
    title: string;
    description: string | null;
    price: string;
    currency: string;
    sessions_included: number;
    validity_days: number;
    is_active: boolean;
    created_at: string;
}

type PackageFormData = {
    title: string;
    description: string;
    price: string;
    currency: string;
    sessions_included: number;
    validity_days: number;
};

const INITIAL_FORM: PackageFormData = {
    title: '',
    description: '',
    price: '',
    currency: 'INR',
    sessions_included: 1,
    validity_days: 30,
};

export default function MentorPackagesPage() {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<PackageFormData>(INITIAL_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, isLoading } = useApiQuery<{ results?: MentorPackage[] }>(
        [...queryKeys.mentor.all, 'packages'],
        '/api/mentor-packages/',
    );

    const packages: MentorPackage[] = data?.results ?? (Array.isArray(data) ? data : []) as MentorPackage[];

    const createMutation = useApiMutation<MentorPackage, PackageFormData>({
        method: 'post',
        path: '/api/mentor-packages/',
        invalidateKeys: [[...queryKeys.mentor.all, 'packages']],
        mutationOptions: {
            onSuccess: () => {
                toast.success('Package created');
                resetForm();
            },
            onError: () => toast.error('Failed to create package'),
        },
    });

    const updateMutation = useApiMutation<MentorPackage, Partial<PackageFormData>>({
        method: 'patch',
        path: editingId ? `/api/mentor-packages/${editingId}/` : '/api/mentor-packages/',
        invalidateKeys: [[...queryKeys.mentor.all, 'packages']],
        mutationOptions: {
            onSuccess: () => {
                toast.success('Package updated');
                resetForm();
            },
            onError: () => toast.error('Failed to update package'),
        },
    });

    const deleteMutation = useApiMutation<void, void>({
        method: 'delete',
        path: '/api/mentor-packages/',
        invalidateKeys: [[...queryKeys.mentor.all, 'packages']],
        mutationOptions: {
            onSuccess: () => toast.success('Package deactivated'),
            onError: () => toast.error('Failed to deactivate package'),
        },
    });

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setShowForm(false);
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.price) {
            toast.error('Title and price are required');
            return;
        }
        if (editingId) {
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    const handleEdit = (pkg: MentorPackage) => {
        setForm({
            title: pkg.title,
            description: pkg.description ?? '',
            price: pkg.price,
            currency: pkg.currency,
            sessions_included: pkg.sessions_included,
            validity_days: pkg.validity_days,
        });
        setEditingId(pkg.id);
        setShowForm(true);
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 animate-pulse">
                <div className="h-8 bg-(--surface-hover) rounded w-1/3" />
                <div className="h-32 bg-(--surface-hover) rounded" />
                <div className="h-32 bg-(--surface-hover) rounded" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">Session Packages</h1>
                    <p className="text-(--secondary)">Create and manage your mentorship packages</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>Add Package</Button>
                )}
            </div>

            {showForm && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-(--primary) mb-4">
                        {editingId ? 'Edit Package' : 'New Package'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Package Title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. 1-on-1 Strategy Session"
                            required
                            aria-required="true"
                        />
                        <Textarea
                            label="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="What does this package include?"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="499"
                                required
                                aria-required="true"
                            />
                            <Input
                                label="Currency"
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                placeholder="INR"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Sessions Included"
                                type="number"
                                min="1"
                                value={String(form.sessions_included)}
                                onChange={(e) => setForm({ ...form, sessions_included: parseInt(e.target.value) || 1 })}
                            />
                            <Input
                                label="Validity (days)"
                                type="number"
                                min="1"
                                value={String(form.validity_days)}
                                onChange={(e) => setForm({ ...form, validity_days: parseInt(e.target.value) || 30 })}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                                {editingId ? 'Update' : 'Create'} Package
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {packages.length === 0 && !showForm ? (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-(--surface-hover) flex items-center justify-center">
                        <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-(--primary)">No packages yet</h3>
                    <p className="text-(--secondary) mt-1 mb-4">Create your first mentorship package to start accepting bookings</p>
                    <Button onClick={() => setShowForm(true)}>Create Package</Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-(--primary)">{pkg.title}</h3>
                                        {!pkg.is_active && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>
                                        )}
                                    </div>
                                    {pkg.description && (
                                        <p className="text-(--secondary) mt-1 text-sm">{pkg.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-sm text-(--secondary)">
                                        <span className="font-semibold text-(--primary)">
                                            {pkg.currency} {pkg.price}
                                        </span>
                                        <span>{pkg.sessions_included} session{pkg.sessions_included > 1 ? 's' : ''}</span>
                                        <span>Valid {pkg.validity_days} days</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(pkg)}>
                                        Edit
                                    </Button>
                                    {pkg.is_active && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Deactivate this package?')) {
                                                    deleteMutation.mutate(undefined, {
                                                        onSuccess: () => {},
                                                    });
                                                }
                                            }}
                                        >
                                            Deactivate
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
