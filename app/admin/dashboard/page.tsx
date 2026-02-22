'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { Institution } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/utils';

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DashboardStats {
    totalInstitutions: number;
    startupsSupported: number;
    studentsMentored: number;
    fundingFacilitated: number;
}

export default function DashboardPage() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                setLoading(true);
                const response = await fetch('/api/institutions', { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Failed to load dashboard data');
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

        load();
        return () => controller.abort();
    }, []);

    const stats: DashboardStats = useMemo(() => {
        return institutions.reduce<DashboardStats>((acc, item) => {
            acc.totalInstitutions += 1;
            acc.startupsSupported += item.startupsSupported ?? 0;
            acc.studentsMentored += item.studentsMentored ?? 0;
            acc.fundingFacilitated += Number(item.fundingFacilitated ?? 0);
            return acc;
        }, { totalInstitutions: 0, startupsSupported: 0, studentsMentored: 0, fundingFacilitated: 0 });
    }, [institutions]);

    const statCards = [
        {
            label: 'Total Institutions',
            value: stats.totalInstitutions,
            format: 'number' as const,
            icon: '🏛️',
            color: 'var(--accent)',
            bgColor: 'var(--accent-light)',
        },
        {
            label: 'Startups Supported',
            value: stats.startupsSupported,
            format: 'number' as const,
            icon: '🚀',
            color: 'var(--success)',
            bgColor: 'var(--success-light)',
        },
        {
            label: 'Students Mentored',
            value: stats.studentsMentored,
            format: 'number' as const,
            icon: '🎓',
            color: 'var(--warning)',
            bgColor: 'var(--warning-light)',
        },
        {
            label: 'Funding Facilitated',
            value: stats.fundingFacilitated,
            format: 'currency' as const,
            icon: '💰',
            color: '#8B5CF6',
            bgColor: '#EDE9FE',
        },
    ];

    const typePalette = useMemo(() => ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'], []);

    const institutionsByMonth = useMemo(() => {
        const counts = new Map<string, number>();
        monthOrder.forEach((m) => counts.set(m, 0));

        institutions.forEach((institution) => {
            if (!institution.createdAt) return;
            const date = new Date(institution.createdAt);
            const label = monthOrder[date.getMonth()];
            counts.set(label, (counts.get(label) ?? 0) + 1);
        });

        return monthOrder.map((month) => ({ month, count: counts.get(month) ?? 0 }));
    }, [institutions]);

    const institutionTypeDistribution = useMemo(() => {
        const counts = new Map<string, number>();
        institutions.forEach((institution) => {
            counts.set(institution.type, (counts.get(institution.type) ?? 0) + 1);
        });

        return Array.from(counts.entries()).map(([type, count], index) => ({
            type,
            count,
            color: typePalette[index % typePalette.length],
        }));
    }, [institutions, typePalette]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back 👋</h2>
                <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your institutions today.</p>
            </div>

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading && (
                <p className="text-gray-600">Loading dashboard data…</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={stat.label} className={`animate-fadeInUp stagger-${index + 1}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.format === 'currency'
                                        ? formatCurrency(stat.value, 'USD')
                                        : formatNumber(stat.value)}
                                </p>
                            </div>
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                +12%
                            </span>
                            <span className="text-xs text-gray-600">vs last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="animate-fadeInUp stagger-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Institutions Added Over Time</h3>
                    <div className="h-64 flex items-end gap-3">
                        {institutionsByMonth.map((month, index) => (
                            <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gray-900 rounded-t-md transition-all duration-500 ease-out"
                                    style={{
                                        height: `${Math.max(month.count * 60, 8)}px`,
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                />
                                <span className="text-xs text-gray-600">{month.month}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="animate-fadeInUp stagger-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Institution Type Distribution</h3>
                    <div className="space-y-4">
                        {institutionTypeDistribution.map((item) => {
                            const percentage = stats.totalInstitutions === 0 ? 0 : (item.count / stats.totalInstitutions) * 100;
                            return (
                                <div key={item.type}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-900">{item.type}</span>
                                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <Card className="animate-fadeInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/dashboard/add-institution"
                        className="p-4 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-md bg-gray-100 text-gray-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900">Add Institution</h4>
                        <p className="text-sm text-gray-600 mt-1">Onboard a new institution</p>
                    </Link>
                    <Link
                        href="/admin/dashboard/institutions"
                        className="p-4 rounded-lg border border-gray-200 hover:border-green-600 hover:bg-green-50 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-md bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900">View All</h4>
                        <p className="text-sm text-gray-600 mt-1">Manage existing institutions</p>
                    </Link>
                    <Link
                        href="/explore/institute"
                        className="p-4 rounded-lg border border-gray-200 hover:border-amber-600 hover:bg-amber-50 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900">Public View</h4>
                        <p className="text-sm text-gray-600 mt-1">See the public listing</p>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
