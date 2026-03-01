'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
import { Badge } from '@/components/ui/Badge';
import { getSessionToken } from '@/lib/auth-utils';

// Reusing options from onboarding (should be shared constants)
const stages = [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'mvp', label: 'MVP (Pre-Revenue)' },
    { value: 'early_traction', label: 'Early Traction' },
    { value: 'growth', label: 'Growth' },
    { value: 'scale', label: 'Scale' },
];

const statuses = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
];

const fundingRoundOptions = [
    { value: 'bootstrapped', label: 'Bootstrapped' },
    { value: 'pre_seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b_plus', label: 'Series B+' },
    { value: 'unicorn', label: 'Unicorn' },
];

// Roles that have write access
const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);

export default function StartupSettingsPage() {
    const [activeTab, setActiveTab] = useState<'details' | 'funding'>('details');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState<any>(null);
    const [myRole, setMyRole] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const canEdit = WRITE_ROLES.has(myRole);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = getSessionToken('founder');
            if (!token) return;

            const res = await fetch('/api/founder/my-startup', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();

            if (res.ok) {
                setData(json.data?.startup ?? null);
                if (json.data?.founderRole) setMyRole(json.data.founderRole);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const token = getSessionToken('founder');
            const res = await fetch(`/api/founder/startups/${data.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to update');

            setMessage({ type: 'success', text: 'Changes saved successfully.' });

            // Update local storage if name/logo changed? Optional.

        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-(--secondary)">Loading...</div>;
    if (!data) return <div className="p-8 text-center text-error">Startup not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">Startup Profile</h1>
                    <p className="text-(--secondary)">
                        {canEdit ? "Manage your startup's public information and settings." : "View your startup's public information. You have view-only access."}
                    </p>
                </div>
                {canEdit && (
                    <Button onClick={handleUpdate} isLoading={isSaving}>
                        Save Changes
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-(--border) flex space-x-6">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-(--secondary) hover:text-(--primary)'
                        }`}
                >
                    Company Details
                </button>
                <button
                    onClick={() => setActiveTab('funding')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'funding'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-(--secondary) hover:text-(--primary)'
                        }`}
                >
                    Funding & Financials
                </button>
            </div>

            <form onSubmit={handleUpdate}>
                <fieldset disabled={!canEdit} className={!canEdit ? 'opacity-75' : ''}>
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <Card className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-(--primary)">Identity</h3>

                                <div className="grid gap-6">
                                    <Input
                                        label="Startup Name"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        required
                                    />

                                    <div className="grid gap-2">
                                        <label className="block text-sm font-medium text-(--primary) mb-2">Logo</label>
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-xl bg-(--surface-hover) border border-(--border) flex items-center justify-center overflow-hidden shrink-0">
                                                {data.logo ? (
                                                    <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-(--secondary)">
                                                        {data.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <FileUpload
                                                    value={data.logo || ''}
                                                    onChange={(url) => setData((prev: any) => ({ ...prev, logo: url }))}
                                                    folder="startup-logos"
                                                    className="w-full"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="block text-sm font-medium text-(--primary) mb-2">Cover Photo</label>
                                        <div className="flex flex-col gap-3">
                                            {data.coverImage && (
                                                <div className="w-full h-32 sm:h-40 rounded-xl bg-(--surface-hover) border border-(--border) overflow-hidden shrink-0">
                                                    <img src={data.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <FileUpload
                                                value={data.coverImage || ''}
                                                onChange={(url) => setData((prev: any) => ({ ...prev, coverImage: url }))}
                                                folder="startup-covers"
                                                className="w-full"
                                                accept="image/*"
                                            />
                                            <p className="text-xs text-(--secondary)">Recommended size: 1200 x 400px (3:1 aspect ratio).</p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Tagline"
                                        value={data.tagline || ''}
                                        onChange={(e) => setData({ ...data, tagline: e.target.value })}
                                    />

                                    <Textarea
                                        label="One-line Pitch"
                                        value={data.pitch || ''}
                                        onChange={(e) => setData({ ...data, pitch: e.target.value })}
                                        maxLength={160}
                                        characterCount
                                    />
                                </div>
                            </Card>

                            <Card className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-(--primary)">Status & Location</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Stage"
                                        value={data.stage}
                                        onChange={(val) => setData({ ...data, stage: val })}
                                        options={stages}
                                    />

                                    <Select
                                        label="Current Status"
                                        value={data.status}
                                        onChange={(val) => setData({ ...data, status: val })}
                                        options={statuses}
                                    />

                                    <Input
                                        label="Founded Date"
                                        type="date"
                                        value={data.foundedDate ? new Date(data.foundedDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setData({ ...data, foundedDate: e.target.value })}
                                    />

                                    <Input
                                        label="Location"
                                        value={data.location || ''}
                                        onChange={(e) => setData({ ...data, location: e.target.value })}
                                    />
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'funding' && (
                        <Card className="p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-(--primary)">Funding Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Latest Round"
                                    value={data.fundingRound}
                                    onChange={(val) => setData({ ...data, fundingRound: val })}
                                    options={fundingRoundOptions}
                                />

                                <Input
                                    label="Total Funds Raised"
                                    type="number"
                                    value={data.fundsRaised || ''}
                                    onChange={(e) => setData({ ...data, fundsRaised: e.target.value })}
                                    icon={<span>$</span>}
                                />

                                <Input
                                    label="Currency"
                                    value={data.fundingCurrency}
                                    onChange={(e) => setData({ ...data, fundingCurrency: e.target.value })}
                                />
                            </div>

                            {/* Investors - simple text area for list management */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-(--primary)">Investors</label>
                                <Textarea
                                    value={(data.investors || []).join(', ')}
                                    onChange={(e) => {
                                        const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        setData({ ...data, investors: list });
                                    }}
                                    placeholder="Sequoia, a16z, etc. (comma separated)"
                                    hint="List your key investors separated by commas."
                                />
                            </div>
                        </Card>
                    )}
                </fieldset>
            </form>
        </div>
    );
}
