'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

export default function MentorProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [achievements, setAchievements] = useState<string[]>([]);
    const [achievementInput, setAchievementInput] = useState('');
    const [pricingPerHour, setPricingPerHour] = useState('');
    const [slots, setSlots] = useState<SlotEntry[]>([{ day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
    const [documents, setDocuments] = useState<DocumentEntry[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Profile info (read-only)
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

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
            if (data.achievements) {
                if (Array.isArray(data.achievements)) {
                    setAchievements(data.achievements.filter(Boolean));
                } else if (typeof data.achievements === 'string' && data.achievements.trim()) {
                    setAchievements(
                        data.achievements
                            .split(/[\n;]+/)
                            .map((s: string) => s.replace(/^[-\u2022*]\s*/, '').trim())
                            .filter(Boolean)
                    );
                }
            }
            if (data.pricing_per_hour) setPricingPerHour(data.pricing_per_hour);
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
    const addSlot = () => {
        setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
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

    // -- Achievement management --
    const addAchievement = () => {
        const text = achievementInput.trim();
        if (!text) return;
        setAchievements((prev) => [...prev, text]);
        setAchievementInput('');
    };

    const removeAchievement = (index: number) => {
        setAchievements((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAchievementKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAchievement();
        }
    };

    // -- Submit --
    const handleSubmit = async () => {
        if (achievements.length === 0) {
            setError('Please add at least one achievement');
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
                    availability: JSON.stringify(slots),
                    pricing_per_hour: parseFloat(pricingPerHour),
                    documents,
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to update profile');
            }

            const data = await res.json();
            setProfileData(data);
            setSuccess(true);
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

    return (
        <div className="space-y-8 animate-fadeIn max-w-3xl">
            {/* Header */}
            <div>
                <BackButton href="/mentor-dashboard" label="Back to Dashboard" />
                <h1 className="text-2xl font-bold text-(--primary)">Complete Your Profile</h1>
                <p className="text-(--secondary) mt-1">
                    Fill in your details to make your mentor profile live and discoverable.
                </p>
            </div>

            {success && (
                <FeedbackBanner
                    type="success"
                    title="Profile Updated Successfully!"
                    message={`Your mentor profile is now live. A confirmation email has been sent to ${profileData?.user_email || 'you'}.`}
                />
            )}

            {error && (
                <FeedbackBanner type="error" title="Error" message={error} />
            )}

            {/* Profile Overview */}
            {profileData && (
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-(--primary)">{profileData.user_name}</h2>
                            <p className="text-sm text-(--secondary)">{profileData.occupation || 'Mentor'} · {profileData.user_email}</p>
                        </div>
                        <div className="ml-auto">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${profileData.profile_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                                }`}>
                                {profileData.profile_completed ? 'Profile Complete' : 'Incomplete'}
                            </span>
                        </div>
                    </div>
                    {profileData.expertise && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(Array.isArray(profileData.expertise) ? profileData.expertise : String(profileData.expertise).split(',')).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-(--surface-hover) text-(--primary)"
                                >
                                    {typeof skill === 'string' ? skill.trim() : skill}
                                </span>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Section 1: Achievements */}
            <Card className="p-6">
                <AchievementsSection
                    achievements={achievements}
                    achievementInput={achievementInput}
                    onInputChange={setAchievementInput}
                    onAdd={addAchievement}
                    onRemove={removeAchievement}
                    onKeyDown={handleAchievementKeyDown}
                />
            </Card>

            {/* Section 2: Available Slots */}
            <Card className="p-6">
                <AvailabilitySlotsSection
                    slots={slots}
                    onAdd={addSlot}
                    onRemove={removeSlot}
                    onUpdate={updateSlot}
                />
            </Card>

            {/* Section 3: Pricing */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-(--primary)">Pricing</h3>
                        <p className="text-sm text-(--secondary)">Set your hourly rate for mentoring sessions</p>
                    </div>
                </div>
                <div className="max-w-xs">
                    <Input
                        type="number"
                        value={pricingPerHour}
                        onChange={(e) => setPricingPerHour(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        label="Rate per hour (USD)"
                        hint="This will be shown on your public profile"
                        icon={
                            <span className="text-(--secondary) font-medium">$</span>
                        }
                    />
                </div>
            </Card>

            {/* Section 4: Documents */}
            <Card className="p-6">
                <DocumentsSection
                    documents={documents}
                    uploading={uploading}
                    uploadError={uploadError}
                    onUpload={handleDocumentUpload}
                    onRemove={removeDocument}
                />
            </Card>

            {/* Submit */}
            <div className="flex items-center gap-4 pb-8">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={saving}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Submit Profile'}
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push('/mentor-dashboard')}
                    disabled={saving}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
