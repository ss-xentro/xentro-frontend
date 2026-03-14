'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getSessionToken } from '@/lib/auth-utils';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { BackButton } from '@/components/ui/BackButton';
import { FormSkeleton } from '@/components/ui/PageSkeleton';
import { SlotEntry, DocumentEntry, ProfileData } from './_lib/constants';
import AchievementsSection from './_components/AchievementsSection';
import AvailabilitySlotsSection from './_components/AvailabilitySlotsSection';
import DocumentsSection from './_components/DocumentsSection';
import PhotoUpload from './_components/PhotoUpload';
import ProfileView from './_components/ProfileView';

export default function MentorProfilePage() {
    const router = useRouter();
    const { user, setSession, token: authToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Photo state (uploaded immediately, saved with form submit)
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');

    // Form state
    const [achievements, setAchievements] = useState<string[]>([]);
    const [highlights, setHighlights] = useState<string[]>([]);
    const [achievementDraft, setAchievementDraft] = useState('');
    const [highlightDraft, setHighlightDraft] = useState('');
    const [pricingPerHour, setPricingPerHour] = useState('');
    const [slots, setSlots] = useState<SlotEntry[]>([{ day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
    const [documents, setDocuments] = useState<DocumentEntry[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    const getContentLength = (value: string) => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;

    const parseRichList = (value: unknown): string[] => {
        if (Array.isArray(value)) {
            return value
                .map((item) => String(item).trim())
                .filter((item) => getContentLength(item) > 0);
        }

        if (typeof value === 'string' && value.trim()) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((item) => String(item).trim())
                        .filter((item) => getContentLength(item) > 0);
                }
            } catch {
                // Not JSON; fall back to text split.
            }

            return value
                .split(/\n{2,}|;+/)
                .map((item) => item.trim())
                .filter((item) => getContentLength(item) > 0)
                .map((item) => (item.startsWith('<') ? item : `<p>${item}</p>`));
        }

        return [];
    };

    const fetchProfile = useCallback(async () => {
        const token = getSessionToken('mentor');
        if (!token) {
            router.replace('/login');
            return;
        }

        try {
            const res = await fetch('/api/auth/mentor-profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to load profile');
            const data = await res.json();
            setProfileData(data);

            // Pre-fill form fields
            setAchievements(parseRichList(data.achievements));
            setHighlights(parseRichList(data.packages));
            if (data.pricing_per_hour) setPricingPerHour(data.pricing_per_hour);
            if (data.user_name) setName(data.user_name);
            if (data.avatar) setAvatar(data.avatar);
            if (data.cover_photo) setCoverPhoto(data.cover_photo);
            if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
                setDocuments(data.documents);
            }
            if (data.availability) {
                try {
                    const parsed = JSON.parse(data.availability);
                    if (Array.isArray(parsed) && parsed.length > 0) setSlots(parsed);
                } catch {
                    // availability might be plain text
                }
            }
            // Auto-enter edit mode when profile has never been completed
            if (!data.profile_completed) {
                setIsEditMode(true);
            }
        } catch {
            setError('Could not load your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // -- Slot management --
    const addSlot = (slot: SlotEntry) => {
        setSlots((prev) => [...prev, slot]);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: keyof SlotEntry, value: string) => {
        const updated = [...slots];
        updated[index] = { ...updated[index], [field]: value };
        setSlots(updated);
    };

    // -- Document upload --
    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'mentor-documents');

            const res = await fetch('/api/media', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.message || 'Upload failed');
            }

            const { data } = await res.json();
            setDocuments([
                ...documents,
                {
                    name: file.name,
                    url: data.url,
                    uploadedAt: new Date().toISOString(),
                },
            ]);
        } catch (err) {
            setUploadError((err as Error).message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    // -- Achievement & Highlight management --
    const addAchievement = () => {
        const count = getContentLength(achievementDraft);
        if (count === 0 || count > 500) return;
        setAchievements((prev) => [...prev, achievementDraft]);
        setAchievementDraft('');
    };

    const removeAchievement = (index: number) => {
        setAchievements((prev) => prev.filter((_, i) => i !== index));
    };

    const updateAchievement = (index: number, value: string) => {
        const count = getContentLength(value);
        if (count > 500) return;
        setAchievements((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    const addHighlight = () => {
        const count = getContentLength(highlightDraft);
        if (count === 0 || count > 500) return;
        setHighlights((prev) => [...prev, highlightDraft]);
        setHighlightDraft('');
    };

    const removeHighlight = (index: number) => {
        setHighlights((prev) => prev.filter((_, i) => i !== index));
    };

    const updateHighlight = (index: number, value: string) => {
        const count = getContentLength(value);
        if (count > 500) return;
        setHighlights((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    // -- Submit --
    const handleSubmit = async () => {
        if (achievements.length === 0) {
            setError('Please add at least one achievement');
            return;
        }
        if (highlights.length === 0) {
            setError('Please add at least one highlight');
            return;
        }
        if (slots.length === 0) {
            setError('Please add at least one available slot');
            return;
        }
        if (!pricingPerHour || parseFloat(pricingPerHour) <= 0) {
            setError('Please enter a valid hourly rate');
            return;
        }

        setError(null);
        setSaving(true);
        setSuccess(false);

        const token = getSessionToken('mentor');
        if (!token) {
            router.replace('/login');
            return;
        }

        try {
            const res = await fetch('/api/auth/mentor-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    achievements: achievements,
                    packages: highlights,
                    availability: JSON.stringify(slots),
                    pricing_per_hour: parseFloat(pricingPerHour),
                    documents,
                    avatar,
                    cover_photo: coverPhoto,
                    name,
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to update profile');
            }

            const data = await res.json();
            setProfileData(data);
            setSuccess(true);
            setIsEditMode(false);
            // Sync updated name/avatar into the auth session so the sidebar reflects changes
            if (user && authToken) {
                setSession({ ...user, name, avatar }, authToken);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <FormSkeleton />;
    }

    // View mode — show public-profile-style preview
    if (!isEditMode && profileData) {
        return (
            <div className="space-y-4 animate-fadeIn">
                {success && (
                    <FeedbackBanner
                        type="success"
                        title="Profile Updated Successfully!"
                        message="Your mentor profile is now live and discoverable."
                    />
                )}
                <ProfileView
                    profileData={{ ...profileData, avatar, cover_photo: coverPhoto }}
                    achievements={achievements}
                    highlights={highlights}
                    pricingPerHour={pricingPerHour}
                    documents={documents}
                    slots={slots}
                    onEditClick={() => { setSuccess(false); setIsEditMode(true); }}
                />
            </div>
        );
    }

    // Edit mode
    const completionStats = {
        achievements: achievements.length,
        highlights: highlights.length,
        slots: slots.length,
        docs: documents.length,
    };

    return (
        <div className="space-y-8 animate-fadeIn w-full pb-28">
            {/* Header */}
            <div className="space-y-1">
                <BackButton href="/mentor-dashboard" label="Back to Dashboard" />
                <p className="text-xs uppercase tracking-[0.16em] text-(--secondary)">Mentor Profile Builder</p>
                <h1 className="text-3xl font-bold text-(--primary)">Edit Your Profile</h1>
            </div>

            {error && (
                <FeedbackBanner type="error" title="Error" message={error} />
            )}

            {/* Profile section merged with Settings-style basics */}
            <Card className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-(--primary)">Profile</h2>
                        <p className="text-sm text-(--secondary) mt-0.5">
                            Basic identity details are managed in Settings; profile media can be edited here.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push('/mentor-dashboard/settings')}
                    >
                        Open Settings
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                    <div className="lg:col-span-2">
                        <PhotoUpload
                            currentUrl={coverPhoto}
                            label="Cover Photo"
                            onUpload={setCoverPhoto}
                            variant="cover"
                            mentorName={profileData?.user_name}
                        />
                    </div>

                    <div className="rounded-xl border border-(--border) bg-(--surface-hover) p-4">
                        <div className="flex flex-col items-center text-center gap-3">
                            <PhotoUpload
                                currentUrl={avatar}
                                label="Profile Picture"
                                onUpload={setAvatar}
                                variant="avatar"
                                mentorName={name || profileData?.user_name}
                            />
                            <div className="w-full">
                                <label className="block text-xs font-medium text-(--secondary) mb-1 text-left">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--surface) text-(--primary) placeholder:text-(--secondary) focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                                <p className="text-xs text-(--secondary) mt-1">{profileData?.user_email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Section 1: Achievements */}
                <Card className="p-6 xl:col-span-8">
                    <AchievementsSection
                        achievements={achievements}
                        highlights={highlights}
                        achievementDraft={achievementDraft}
                        highlightDraft={highlightDraft}
                        achievementDraftCount={getContentLength(achievementDraft)}
                        highlightDraftCount={getContentLength(highlightDraft)}
                        onAchievementDraftChange={setAchievementDraft}
                        onHighlightDraftChange={setHighlightDraft}
                        onAddAchievement={addAchievement}
                        onAddHighlight={addHighlight}
                        onUpdateAchievement={updateAchievement}
                        onUpdateHighlight={updateHighlight}
                        onRemoveAchievement={removeAchievement}
                        onRemoveHighlight={removeHighlight}
                        getContentLength={getContentLength}
                    />
                </Card>

                <div className="xl:col-span-4 space-y-6">
                    {/* Section 2: Pricing */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center">
                                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-(--primary)">Pricing</h3>
                                <p className="text-sm text-(--secondary)">Set your hourly rate in INR</p>
                            </div>
                        </div>
                        <Input
                            type="number"
                            value={pricingPerHour}
                            onChange={(e) => setPricingPerHour(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            label="Rate per hour (INR)"
                            hint="Shown on your public profile"
                            icon={
                                <span className="text-(--secondary) font-medium">Rs</span>
                            }
                        />
                    </Card>

                    {/* Section 3: Documents */}
                    <Card className="p-6">
                        <DocumentsSection
                            documents={documents}
                            uploading={uploading}
                            uploadError={uploadError}
                            onUpload={handleDocumentUpload}
                            onRemove={removeDocument}
                        />
                    </Card>
                </div>
            </div>

            {/* Section 4: Available Slots */}
            <Card className="p-6">
                <AvailabilitySlotsSection
                    slots={slots}
                    onAdd={addSlot}
                    onRemove={removeSlot}
                    onUpdate={updateSlot}
                />
            </Card>

            {/* Always-visible sticky footer */}
            <div className="fixed bottom-4 left-4 right-4 z-40 lg:left-auto lg:right-8 lg:max-w-4xl">
                <div className="rounded-2xl border border-(--border) bg-(--surface) shadow-lg px-4 py-3 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-(--surface-hover) text-(--secondary)">
                                Achievements: {completionStats.achievements}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-(--surface-hover) text-(--secondary)">
                                Highlights: {completionStats.highlights}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-(--surface-hover) text-(--secondary)">
                                Slots: {completionStats.slots}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-(--surface-hover) text-(--secondary)">
                                Documents: {completionStats.docs}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {profileData?.profile_completed && (
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => setIsEditMode(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit}
                                isLoading={saving}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
