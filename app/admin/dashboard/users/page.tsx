'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { UserRecord, ACCOUNT_TYPES, TABLE_HEADERS } from './_lib/constants';
import UserRow from './_components/UserRow';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [toggling, setToggling] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const token = getSessionToken('admin');
        const params = new URLSearchParams({ page: String(page), per_page: '25' });
        if (search) params.set('search', search);
        if (filterType) params.set('account_type', filterType);
        if (filterStatus) params.set('status', filterStatus);

        try {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(`/api/admin/users/?${params}`, { headers });
            if (!res.ok) throw new Error('Failed to load users');
            const json = await res.json();
            setUsers(json.data || []);
            setTotal(json.total || 0);
            setTotalPages(json.totalPages || 1);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, filterType, filterStatus]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleActive = async (userId: string, current: boolean) => {
        setToggling(userId);
        const token = getSessionToken('admin');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        try {
            await fetch(`/api/admin/users/${userId}/`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ isActive: !current }),
            });
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !current } : u)));
        } finally {
            setToggling(null);
        }
    };

    const deleteUser = async (userId: string) => {
        setToggling(userId);
        const token = getSessionToken('admin');
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        try {
            const res = await fetch(`/api/admin/users/${userId}/`, { method: 'DELETE', headers });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                setTotal((prev) => prev - 1);
            }
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500 mt-1">{total} total users</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            aria-label="Search by name or email"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white"
                    >
                        <option value="">All Types</option>
                        {ACCOUNT_TYPES.map((t) => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                {TABLE_HEADERS.map((h, i) => (
                                    <th key={h} className={`${i === TABLE_HEADERS.length - 1 ? 'text-right' : 'text-left'} px-4 py-3 font-medium text-gray-600`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && [1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td colSpan={8} className="px-4 py-4">
                                        <div className="h-5 bg-gray-100 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                            {!loading && users.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    toggling={toggling}
                                    onToggleActive={toggleActive}
                                    onDelete={deleteUser}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Page {page} of {totalPages} ({total} users)</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="px-3 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
