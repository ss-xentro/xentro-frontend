'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
import { Badge } from '@/components/ui/Badge';
import { MediaPreview } from '@/components/ui/MediaPreview';
import { getSessionToken } from '@/lib/auth-utils';
import { currencies } from '@/lib/types';
import { getCurrencySymbol } from '@/lib/utils';
import { toast } from 'sonner';

// Reusing options from onboarding (should be shared constants)
const stages = [
    { value: 'ideation', label: 'Ideation' },
    { value: 'pre_seed_prototype', label: 'Pre seed / Prototype' },
    { value: 'seed_mvp', label: 'Seed / MVP' },
    { value: 'early_traction', label: 'Early Traction' },
    { value: 'growth', label: 'Growth' },
    { value: 'scaling', label: 'Scaling' },
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
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [data, setData] = useState<any>(null);
    const [myRole, setMyRole] = useState<string>('');

    const canEdit = WRITE_ROLES.has(myRole);
    const hasPendingUploads = isLogoUploading || isCoverUploading;

    const stageLabel = stages.find((item) => item.value === data?.stage)?.label || 'Not set';
    const statusLabel = statuses.find((item) => item.value === data?.status)?.label || 'Not set';
    const fundingRoundLabel = fundingRoundOptions.find((item) => item.value === data?.fundingRound)?.label || 'Not set';

    const formatDate = (value?: string | null) => {
        if (!value) return 'Not set';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return 'Not set';
        return d.toLocaleDateString();
    };

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
        if (hasPendingUploads) {
            toast.error('Please wait for image uploads to finish before saving.');
            return;
        }
        setIsSaving(true);

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

            const json = await res.json().catch(() => null);

            if (!res.ok) throw new Error('Failed to update');

            if (json) {
                setData(json);
            }

            toast.success('Changes saved successfully.');
            setIsEditMode(false);

            // Update local storage if name/logo changed? Optional.

        } catch (err) {
            toast.error('Failed to save changes.');
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
                        {canEdit ? (isEditMode ? "Edit mode is on. Save when you're done." : "Review your startup details. Click Edit Startup to update them.") : "View your startup's public information. You have view-only access."}
                    </p>
                </div>
                {canEdit && (
                    <div className="flex items-center gap-2">
                        {isEditMode && (
                            <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
                                Cancel
                            </Button>
                        )}
                        <Button onClick={isEditMode ? handleUpdate : () => setIsEditMode(true)} isLoading={isSaving} disabled={isEditMode && hasPendingUploads}>
                            {isEditMode ? 'Save Changes' : 'Edit Startup'}
                        </Button>
                    </div>
                )}
            </div>



            {/* Tabs */}
            <div className="border-b border-(--border) flex space-x-6">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                        ? 'border-(--primary) text-(--primary)'
                        : 'border-transparent text-(--secondary) hover:text-(--primary)'
                        }`}
                >
                    Company Details
                </button>
                <button
                    onClick={() => setActiveTab('funding')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'funding'
                        ? 'border-(--primary) text-(--primary)'
                        : 'border-transparent text-(--secondary) hover:text-(--primary)'
                        }`}
                >
                    Funding & Financials
                </button>
            </div>

            <form onSubmit={handleUpdate}>
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        <Card className="p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-(--primary)">Identity</h3>

                            {canEdit && isEditMode ? (
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
                                            <div className={`w-20 h-20 rounded-xl border border-(--border) flex items-center justify-center overflow-hidden shrink-0 ${data.logo ? 'bg-(--secondary)' : 'bg-(--surface-hover)'}`}>
                                                {data.logo ? (
                                                    <MediaPreview src={data.logo} alt="Logo" className="h-full w-full rounded-none border-0 bg-(--secondary)" mediaClassName="object-cover" />
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
                                                    onUploadStateChange={setIsLogoUploading}
                                                    folder="startup-logos"
                                                    className="w-full"
                                                    accept="image/*"
                                                    enableCrop={true}
                                                    aspectRatio={1}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="block text-sm font-medium text-(--primary) mb-2">Cover Photo</label>
                                        <div className="flex flex-col gap-3">
                                            {data.coverImage && (
                                                <div className="relative w-full h-32 sm:h-40 rounded-xl bg-(--surface-hover) border border-(--border) overflow-hidden shrink-0">
                                                    <MediaPreview src={data.coverImage} alt="Cover" className="h-full w-full rounded-none border-0" mediaClassName="object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
                                                </div>
                                            )}
                                            <FileUpload
                                                value={data.coverImage || ''}
                                                onChange={(url) => setData((prev: any) => ({ ...prev, coverImage: url }))}
                                                onUploadStateChange={setIsCoverUploading}
                                                folder="startup-covers"
                                                className="w-full"
                                                accept="image/*"
                                                enableCrop={true}
                                                aspectRatio={3}
                                            />
                                            <p className="text-xs text-(--secondary)">Recommended size: 1200 x 400px (3:1 aspect ratio).</p>
                                        </div>
                                    </div>

                                    {hasPendingUploads && (
                                        <p className="text-sm text-(--secondary)">Uploading media... Save will be enabled when uploads finish.</p>
                                    )}

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
                            ) : (
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-(--secondary) uppercase tracking-wide">Startup Name</p>
                                            <p className="mt-1 text-sm font-medium text-(--primary)">{data.name || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-(--secondary) uppercase tracking-wide">Tagline</p>
                                            <p className="mt-1 text-sm text-(--primary)">{data.tagline || 'Not set'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-(--secondary) uppercase tracking-wide mb-2">One-line Pitch</p>
                                        <p className="text-sm text-(--primary)">{data.pitch || 'Not set'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-(--secondary) uppercase tracking-wide mb-2">Logo</p>
                                            {data.logo ? (
                                                <MediaPreview src={data.logo} alt="Startup logo" className="h-24 w-24" mediaClassName="object-cover" />
                                            ) : (
                                                <p className="text-sm text-(--secondary)">Not set</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-(--secondary) uppercase tracking-wide mb-2">Cover Photo</p>
                                            {data.coverImage ? (
                                                <div className="relative h-24 w-full rounded-xl overflow-hidden border border-(--border)">
                                                    <MediaPreview src={data.coverImage} alt="Startup cover" className="h-full w-full rounded-none border-0" mediaClassName="object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                                </div>
                                            ) : (
                                                <p className="text-sm text-(--secondary)">Not set</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-(--primary)">Status & Location</h3>
                            {canEdit && isEditMode ? (
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
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-(--secondary) uppercase tracking-wide">Stage</p>
                                        <p className="mt-1 text-sm text-(--primary)">{stageLabel}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-(--secondary) uppercase tracking-wide">Current Status</p>
                                        <div className="mt-2"><Badge variant="default">{statusLabel}</Badge></div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-(--secondary) uppercase tracking-wide">Founded Date</p>
                                        <p className="mt-1 text-sm text-(--primary)">{formatDate(data.foundedDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-(--secondary) uppercase tracking-wide">Location</p>
                                        <p className="mt-1 text-sm text-(--primary)">{data.location || 'Not set'}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {activeTab === 'funding' && (
                    <Card className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-(--primary)">Funding Information</h3>

                        {canEdit && isEditMode ? (
                            <>
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
                                        icon={<span>{getCurrencySymbol(data.fundingCurrency)}</span>}
                                    />

                                    <Select
                                        label="Currency"
                                        value={data.fundingCurrency}
                                        onChange={(val) => setData({ ...data, fundingCurrency: val })}
                                        options={currencies.map((c) => ({
                                            value: c.code,
                                            label: `${c.code} (${c.symbol})`,
                                        }))}
                                    />
                                </div>

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
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-(--secondary) uppercase tracking-wide">Latest Round</p>
                                    <p className="mt-1 text-sm text-(--primary)">{fundingRoundLabel}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-(--secondary) uppercase tracking-wide">Total Funds Raised</p>
                                    <p className="mt-1 text-sm text-(--primary)">{data.fundsRaised ? `${data.fundsRaised}` : 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-(--secondary) uppercase tracking-wide">Currency</p>
                                    <p className="mt-1 text-sm text-(--primary)">{data.fundingCurrency || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-(--secondary) uppercase tracking-wide">Investors</p>
                                    <p className="mt-1 text-sm text-(--primary)">{(data.investors || []).length > 0 ? data.investors.join(', ') : 'Not set'}</p>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </form>
        </div>
    );
}
