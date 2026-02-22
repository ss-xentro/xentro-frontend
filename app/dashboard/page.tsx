'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Types (should ideally be shared)
interface ActivityLog {
    id: string;
    action: string;
    details: any;
    createdAt: string;
}

interface StartupData {
    id: string;
    slug?: string | null;
    name: string;
    tagline: string;
    logo: string | null;
    stage: string;
    status: string;
    fundingRound: string;
    foundedDate: string;
    fundsRaised: string;
    primaryContactEmail: string;
}

interface DashboardData {
    startup: StartupData;
    founderRole: string;
    recentActivity: ActivityLog[];
}

export default function DashboardOverviewPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('founder_token');
                if (!token) return; // Layout handles redirect

                const res = await fetch('/api/founder/my-startup', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to load dashboard data');
                }

                const json = await res.json();
                setData(json.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load startup data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-40 bg-(--surface) rounded-xl border border-(--border)"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-60 bg-(--surface) rounded-xl border border-(--border)"></div>
                    <div className="h-60 bg-(--surface) rounded-xl border border-(--border)"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-error/10 border border-error/20 text-error rounded-xl">
                {error}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, {data.startup.name}
                    </h1>
                    <p className="text-(--secondary)">
                        Here&apos;s what&apos;s happening with your startup today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/startups/${data.startup.slug || data.startup.id}`} target="_blank">
                        <Button variant="secondary" size="sm">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Public Profile
                        </Button>
                    </Link>
                    <Link href="/dashboard/startup">
                        <Button variant="primary" size="sm">
                            Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Startup Quick Stats/Info */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-xl bg-(--surface-hover) shrink-0 flex items-center justify-center border border-(--border) overflow-hidden">
                        {data.startup.logo ? (
                            <img src={data.startup.logo} alt={data.startup.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-(--secondary)">
                                {data.startup.name.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h2 className="text-xl font-bold text-(--primary)">{data.startup.name}</h2>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={data.startup.status === 'active' ? 'success' : 'secondary'}>
                                    {data.startup.status}
                                </Badge>
                                <Badge variant="info">{data.startup.stage}</Badge>
                                <Badge variant="outline">{data.startup.fundingRound}</Badge>
                            </div>
                        </div>

                        <p className="text-(--primary) opacity-80 max-w-2xl">
                            {data.startup.tagline || "No tagline set."}
                        </p>

                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-(--secondary)">
                            <div>
                                <span className="font-medium text-(--primary)">Founded:</span>{' '}
                                {new Date(data.startup.foundedDate).toLocaleDateString()}
                            </div>
                            <div>
                                <span className="font-medium text-(--primary)">Funds Raised:</span>{' '}
                                ${Number(data.startup.fundsRaised || 0).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium text-(--primary)">Role:</span>{' '}
                                <span className="capitalize">{data.founderRole.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-(--primary) mb-4">Recent Activity</h3>
                    <div className="space-y-0 relative">
                        {/* Timeline line */}
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-(--border)"></div>

                        {data.recentActivity.length === 0 ? (
                            <p className="pl-8 text-(--secondary) py-2">No recent activity.</p>
                        ) : (
                            data.recentActivity.map((log) => (
                                <div key={log.id} className="relative pl-8 py-3 group">
                                    <div className="absolute left-0 top-4 w-5 h-5 rounded-full bg-(--surface) border-2 border-(--border) group-hover:border-accent group-hover:scale-110 transition-all z-10"></div>

                                    <p className="text-sm font-medium text-(--primary)">
                                        {formatActivityAction(log.action)}
                                    </p>
                                    <p className="text-xs text-(--secondary) mt-0.5">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Quick Tasks / Next Steps (Placeholder) */}
                <Card className="p-6 h-fit">
                    <h3 className="text-lg font-semibold text-(--primary) mb-4">Your Checklist</h3>
                    <div className="space-y-3">
                        <ChecklistItem label="Complete Company Profile" checked={true} />
                        <ChecklistItem label="Add Team Members" checked={false} />
                        <ChecklistItem label="Verify Email" checked={true} />
                        <ChecklistItem label="Add Funding History" checked={!!data.startup.fundsRaised} />
                    </div>

                    <div className="mt-6 pt-6 border-t border-(--border)">
                        <h4 className="text-sm font-medium text-(--primary) mb-2">Need Help?</h4>
                        <Link href="/help" className="text-sm text-accent hover:underline">
                            Visit Founder Support Center &rarr;
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function formatActivityAction(action: string) {
    switch (action) {
        case 'created': return 'Startup profile created';
        case 'updated': return 'Profile updated';
        case 'founder_added': return 'Team member added';
        default: return action.replace(/_/g, ' ');
    }
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${checked
                    ? 'bg-success border-success text-white'
                    : 'bg-transparent border-(--border) text-transparent'
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className={`text-sm ${checked ? 'text-(--secondary) line-through' : 'text-(--primary)'}`}>
                {label}
            </span>
        </div>
    )
}
