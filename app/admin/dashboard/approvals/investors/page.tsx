"use client";

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { toast } from 'sonner';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

type InvestorRow = {
    profileId: string;
    userId: string;
    name: string | null;
    email: string | null;
    firmName: string | null;
    type: string | null;
    investmentStages: string[] | null;
    sectors: string[] | null;
    checkSizeMin: string | null;
    checkSizeMax: string | null;
    linkedinUrl: string | null;
    status: string;
    createdAt: string;
};

export default function InvestorApprovalsPage() {
    const queryClient = useQueryClient();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [remark, setRemark] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const { data: investorRaw, isLoading: loading, refetch } = useApiQuery<{ data: InvestorRow[] }>(
        queryKeys.admin.investors(),
        '/api/investors',
        { requestOptions: { role: 'admin' } },
    );
    const rows = investorRaw?.data ?? [];

    async function handleApprove(userId: string) {
        setActionLoading(true);
        try {
            await api.post('/api/approvals/investors', { role: 'admin', json: { investorUserId: userId, decision: 'approve' } });
            toast.success('Investor approved — notification email sent');
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.investors() });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReject(userId: string) {
        if (!remark.trim()) {
            toast.error('A remark is required.');
            return;
        }
        setActionLoading(true);
        try {
            await api.post('/api/approvals/investors', { role: 'admin', json: { investorUserId: userId, decision: 'reject', reason: remark.trim() } });
            toast.success('Investor rejected — notification email sent');
            setRejectingId(null);
            setRemark('');
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.investors() });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    }

    function formatCheckSize(min: string | null, max: string | null) {
        if (!min && !max) return null;
        const fmt = (v: string) => {
            const n = Number(v);
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
            return `$${n}`;
        };
        if (min && max) return `${fmt(min)} — ${fmt(max)}`;
        if (min) return `${fmt(min)}+`;
        return `Up to ${fmt(max!)}`;
    }

    return (
        <div className="space-y-6 animate-fadeInUp">
            <Card className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Investor Approvals</h1>
                        <p className="text-sm text-muted-foreground">Review investor applications. Rejections need a remark.</p>
                    </div>
                    <Button variant="secondary" onClick={() => refetch()} disabled={loading || actionLoading}>
                        Refresh
                    </Button>
                </div>
                <div className="space-y-3">
                    {rows.map((row) => (
                        <div key={row.userId} className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-base">{row.name || 'Unnamed investor'}</span>
                                        {row.firmName && (
                                            <span className="text-xs px-2 py-0.5 bg-(--accent-light) text-(--secondary-light) rounded-full">{row.firmName}</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{row.email}</div>
                                    {row.investmentStages && row.investmentStages.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {row.investmentStages.map((stage) => (
                                                <span key={stage} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{stage}</span>
                                            ))}
                                        </div>
                                    )}
                                    {row.sectors && row.sectors.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {row.sectors.map((sector) => (
                                                <span key={sector} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">{sector}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        {formatCheckSize(row.checkSizeMin, row.checkSizeMax) && (
                                            <span>Check: {formatCheckSize(row.checkSizeMin, row.checkSizeMax)}</span>
                                        )}
                                        {row.linkedinUrl && (
                                            <a href={row.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn ↗</a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {rejectingId === row.userId ? (
                                        <Button variant="secondary" onClick={() => { setRejectingId(null); setRemark(''); }} disabled={actionLoading}>
                                            Cancel
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" onClick={() => setRejectingId(row.userId)} disabled={actionLoading}>
                                            Reject
                                        </Button>
                                    )}
                                    <Button onClick={() => handleApprove(row.userId)} disabled={actionLoading}>
                                        Approve
                                    </Button>
                                </div>
                            </div>
                            {rejectingId === row.userId && (
                                <div className="flex flex-col gap-2 border-t pt-3">
                                    <label className="text-sm font-medium text-(--primary-light)">Rejection remark <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="w-full border border-(--border-hover) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--border-focus) resize-none"
                                        rows={2}
                                        placeholder="Reason for rejection"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button variant="secondary" onClick={() => handleReject(row.userId)} disabled={actionLoading || !remark.trim()}>
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {!loading && !rows.length && <p className="text-sm text-muted-foreground">No pending investor applications.</p>}
                    {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>}
                </div>
            </Card>
        </div>
    );
}
