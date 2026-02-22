'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button, Badge } from '@/components/ui';

interface Program {
    id: string;
    name: string;
    type: string;
    description: string | null;
    duration: string | null;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
}

const typeLabels: Record<string, { label: string; color: string }> = {
    accelerator: { label: 'Accelerator', color: 'bg-purple-100 text-purple-800' },
    incubator: { label: 'Incubator', color: 'bg-blue-100 text-blue-800' },
    incubation: { label: 'Incubation', color: 'bg-blue-100 text-blue-800' },
    acceleration: { label: 'Acceleration', color: 'bg-purple-100 text-purple-800' },
    bootcamp: { label: 'Bootcamp', color: 'bg-orange-100 text-orange-800' },
    fellowship: { label: 'Fellowship', color: 'bg-green-100 text-green-800' },
    workshop: { label: 'Workshop', color: 'bg-yellow-100 text-yellow-800' },
    mentorship: { label: 'Mentorship', color: 'bg-pink-100 text-pink-800' },
    competition: { label: 'Competition', color: 'bg-indigo-100 text-indigo-800' },
    other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

export default function ProgramsPage() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadPrograms();
    }, []);

    const loadPrograms = async () => {
        try {
            const token = localStorage.getItem('institution_token');
            if (!token) {
                router.push('/institution-login');
                return;
            }

            const res = await fetch('/api/programs', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Failed to load programs');
            }

            const data = await res.json();
            setPrograms(data.data || []);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this program?')) return;

        setDeletingId(id);
        try {
            const token = localStorage.getItem('institution_token');
            const res = await fetch(`/api/programs/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete program');
            }

            setPrograms(programs.filter(p => p.id !== id));
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <DashboardSidebar>
                <div className="p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {[1, 2].map(i => (
                                <div key={i} className="h-48 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardSidebar>
        );
    }

    return (
        <DashboardSidebar>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-(--primary)">Programs</h1>
                        <p className="text-(--secondary) mt-1">Manage your institution&apos;s programs and initiatives</p>
                    </div>
                    <Button onClick={() => router.push('/institution-dashboard/add-program')}>
                        <span className="mr-2">➕</span>
                        Add Program
                    </Button>
                </div>

                {error && (
                    <Card className="p-4 bg-red-50 border-red-200">
                        <p className="text-red-600">{error}</p>
                    </Card>
                )}

                {programs.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-(--primary) mb-2">No programs yet</h3>
                        <p className="text-(--secondary) mb-4">
                            Add programs to showcase your institution&apos;s offerings
                        </p>
                        <Button onClick={() => router.push('/institution-dashboard/add-program')}>
                            Add Your First Program
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {programs.map((program) => {
                            const typeInfo = typeLabels[program.type] || typeLabels.other;
                            return (
                                <Card key={program.id} className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-(--primary)">{program.name}</h3>
                                                {!program.isActive && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">Inactive</span>
                                                )}
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                                                {typeInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    {program.description && (
                                        <p className="text-sm text-(--secondary) mb-3 line-clamp-2">
                                            {program.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-(--secondary) mb-4">
                                        {program.duration && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {program.duration}
                                            </span>
                                        )}
                                        {program.startDate && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(program.startDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 border-t border-(--border) pt-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => router.push(`/institution-dashboard/programs/${program.id}/edit`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(program.id)}
                                            disabled={deletingId === program.id}
                                        >
                                            {deletingId === program.id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardSidebar>
    );
}
