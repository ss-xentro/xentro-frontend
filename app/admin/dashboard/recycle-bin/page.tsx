'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageSkeleton, EmptyState } from '@/components/ui';
import { toast } from 'sonner';
import { getSessionToken } from '@/lib/auth-utils';
import { RecycleBinUser, accountTypeLabels } from './_lib/constants';
import RecycleBinCard from './_components/RecycleBinCard';

export default function AdminRecycleBinPage() {
    const router = useRouter();
    const [users, setUsers] = useState<RecycleBinUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const getHeaders = (): Record<string, string> => {
        const headers: Record<string, string> = {};
        const token = getSessionToken('admin');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    useEffect(() => {
        loadRecycleBin();
    }, []);

    const loadRecycleBin = async () => {
        try {
            const res = await fetch('/api/admin/recycle-bin/', { headers: getHeaders() });
            if (res.status === 401 || res.status === 403) { router.push('/admin/login'); return; }
            if (!res.ok) throw new Error('Failed to load recycle bin');
            const json = await res.json();
            setUsers(json.data || []);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (userId: string, userName: string) => {
        setActionLoading(`restore-${userId}`);
        try {
            const res = await fetch(`/api/admin/recycle-bin/${userId}/restore/`, { method: 'POST', headers: getHeaders() });
            if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed to restore user'); }
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success(`"${userName}" has been restored successfully.`);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async (userId: string, userName: string) => {
        if (!confirm(`This will PERMANENTLY delete "${userName}" and ALL related data including uploaded files.\n\nThis action cannot be undone. Continue?`)) return;
        setActionLoading(`delete-${userId}`);
        try {
            const res = await fetch(`/api/admin/recycle-bin/${userId}/`, { method: 'DELETE', headers: getHeaders() });
            if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed to delete user'); }
            const json = await res.json();
            const r2Info = json.cleanup?.r2FilesDeleted ? ` (${json.cleanup.r2FilesDeleted} files cleaned from storage)` : '';
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success(`"${userName}" has been permanently deleted${r2Info}.`);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter((u) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (accountTypeLabels[u.accountType] || u.accountType).toLowerCase().includes(q);
    });

    if (loading) return <div className="p-8"><PageSkeleton /></div>;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Recycle Bin
                </h1>
                <p className="text-gray-500 mt-1">
                    Deleted users are kept for 30 days before automatic removal. {users.length} user{users.length !== 1 ? 's' : ''} in recycle bin.
                </p>
            </div>

            {/* Search */}
            {users.length > 0 && (
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        aria-label="Search by name, email, or role"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>
            )}

            {/* Users list */}
            {filteredUsers.length === 0 ? (
                <EmptyState
                    icon={
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    }
                    title={search ? 'No matching users' : 'Recycle bin is empty'}
                    description={search ? 'Try adjusting your search terms' : 'Users you delete from the Users page will appear here for 30 days'}
                />
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user) => (
                        <RecycleBinCard
                            key={user.id}
                            user={user}
                            actionLoading={actionLoading}
                            onRestore={handleRestore}
                            onDelete={handlePermanentDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
