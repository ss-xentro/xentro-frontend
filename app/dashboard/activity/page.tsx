'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface ActivityLog {
    id: string;
    action: string;
    details: any;
    createdAt: string;
    userName: string | null;
}

export default function ActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('founder_token');
                const res = await fetch('/api/founder/activity', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (res.ok) setLogs(json.data ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    function formatAction(action: string) {
        if (!action) return 'Unknown Action';
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function renderDetails(details: any) {
        if (!details) return null;
        return (
            <div className="mt-1 text-xs text-(--secondary) font-mono bg-(--background) p-1.5 rounded border border-(--border) inline-block">
                {Object.entries(details).map(([key, value]) => (
                    <span key={key} className="mr-3">
                        <span className="opacity-70">{key}:</span> {String(value)}
                    </span>
                ))}
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center text-(--secondary)">Loading activity...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-(--primary)">Activity Log</h1>
                <p className="text-(--secondary)">Audit trail of all changes made to your startup profile.</p>
            </div>

            <Card className="divide-y divide-(--border)">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-(--secondary)">No activity recorded yet.</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="p-5 hover:bg-(--surface-hover) transition-colors flex gap-4">
                            <div className="mt-1 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-(--accent-subtle) flex items-center justify-center text-accent">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <h3 className="font-medium text-(--primary)">
                                        {formatAction(log.action)}
                                    </h3>
                                    <span className="text-xs text-(--secondary)">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-(--secondary) mt-0.5">
                                    by <span className="font-semibold text-(--primary)">{log.userName || 'System'}</span>
                                </p>
                                {renderDetails(log.details)}
                            </div>
                        </div>
                    ))
                )}
            </Card>
        </div>
    );
}
