"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

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
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<InvestorRow[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [remark, setRemark] = useState('');

    async function fetchPending() {
        if (!token) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/investors', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load');
            setRows(data.data || []);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchPending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function handleApprove(userId: string) {
        if (!token) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/approvals/investors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ investorUserId: userId, decision: 'approve' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Action failed');
            setMessage('Investor approved — notification email sent');
            await fetchPending();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleReject(userId: string) {
        if (!remark.trim()) {
            setMessage('Please add a remark before rejecting.');
            return;
        }
        if (!token) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/approvals/investors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ investorUserId: userId, decision: 'reject', reason: remark.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Action failed');
            setMessage('Investor rejected — notification email sent');
            setRejectingId(null);
            setRemark('');
            await fetchPending();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setLoading(false);
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
        <div className="space-y-4 animate-fadeInUp">
            <Card className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Investor Approvals</h1>
                        <p className="text-sm text-muted-foreground">Review and approve investor applications. Rejections require a remark.</p>
                    </div>
                    <Button variant="secondary" onClick={fetchPending} disabled={loading}>
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
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{row.firmName}</span>
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
                                        <Button variant="secondary" onClick={() => { setRejectingId(null); setRemark(''); }} disabled={loading}>
                                            Cancel
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" onClick={() => setRejectingId(row.userId)} disabled={loading}>
                                            Reject
                                        </Button>
                                    )}
                                    <Button onClick={() => handleApprove(row.userId)} disabled={loading}>
                                        Approve
                                    </Button>
                                </div>
                            </div>
                            {rejectingId === row.userId && (
                                <div className="flex flex-col gap-2 border-t pt-3">
                                    <label className="text-sm font-medium text-gray-700">Rejection remark <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                        rows={2}
                                        placeholder="Explain why this application is being rejected…"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button variant="secondary" onClick={() => handleReject(row.userId)} disabled={loading || !remark.trim()}>
                                            Confirm Rejection
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {!loading && !rows.length && <p className="text-sm text-muted-foreground">No pending investor applications.</p>}
                    {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>}
                </div>
                {message && <p className={cn('text-sm', message.toLowerCase().includes('fail') || message.toLowerCase().includes('please') ? 'text-red-600' : 'text-green-600')}>{message}</p>}
            </Card>
        </div>
    );
}
