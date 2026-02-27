'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getSessionToken } from '@/lib/auth-utils';

interface SlotEntry {
    day: string;
    startTime: string;
    endTime: string;
}

interface DocumentEntry {
    name: string;
    url: string;
    uploadedAt: string;
}

interface ProfileData {
    achievements: string[] | string;
    pricing_per_hour: string;
    availability: string;
    documents: DocumentEntry[];
    profile_completed: boolean;
    user_name: string;
    user_email: string;
    expertise: string | string[];
    occupation: string;
    status: string;
}

const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const TIME_OPTIONS = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00',
];

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
                // Handle both string (legacy) and array formats
                if (Array.isArray(data.achievements)) {
                    setAchievements(data.achievements.filter(Boolean));
                } else if (typeof data.achievements === 'string' && data.achievements.trim()) {
                    // Convert legacy string to array: split by newlines or semicolons
                    setAchievements(
                        data.achievements
                            .split(/[\n;]+/)
                            .map((s: string) => s.replace(/^[-•*]\s*/, '').trim())
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

    // ── Slot management ──
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

    // ── Document upload ──
    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB max)
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
            // Reset input
            e.target.value = '';
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    // ── Achievement management ──
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

    // ── Submit ──
    const handleSubmit = async () => {
        // Validation
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

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-12 bg-(--surface) rounded-xl border border-(--border) w-1/3"></div>
                <div className="h-64 bg-(--surface) rounded-xl border border-(--border)"></div>
                <div className="h-48 bg-(--surface) rounded-xl border border-(--border)"></div>
                <div className="h-32 bg-(--surface) rounded-xl border border-(--border)"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn max-w-3xl">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.push('/mentor-dashboard')}
                    className="flex items-center gap-2 text-sm text-(--secondary) hover:text-(--primary) transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-(--primary)">Complete Your Profile</h1>
                <p className="text-(--secondary) mt-1">
                    Fill in your details to make your mentor profile live and discoverable.
                </p>
            </div>

            {/* Success Banner */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-800">Profile Updated Successfully!</h3>
                        <p className="text-sm text-green-700 mt-0.5">
                            Your mentor profile is now live. A confirmation email has been sent to{' '}
                            <strong>{profileData?.user_email}</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-red-800">Error</h3>
                        <p className="text-sm text-red-700 mt-0.5">{error}</p>
                    </div>
                </div>
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
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-(--primary)">Achievements & Highlights</h3>
                        <p className="text-sm text-(--secondary)">Add your key accomplishments one at a time</p>
                    </div>
                </div>

                {/* Input + Add button */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        onKeyDown={handleAchievementKeyDown}
                        placeholder="e.g., Mentored 50+ startups to Series A funding"
                        className="flex-1 h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) placeholder:text-(--secondary)/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light) transition-colors"
                        maxLength={300}
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={addAchievement}
                        disabled={!achievementInput.trim()}
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                    </Button>
                </div>

                {/* Achievement list */}
                {achievements.length > 0 ? (
                    <ul className="space-y-2">
                        {achievements.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 p-3 bg-(--surface-hover) rounded-lg group transition-colors hover:bg-(--surface-hover)/80"
                            >
                                <span className="mt-0.5 text-amber-500 shrink-0">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <circle cx="10" cy="10" r="3" />
                                    </svg>
                                </span>
                                <span className="flex-1 text-sm text-(--primary) leading-relaxed">{item}</span>
                                <button
                                    onClick={() => removeAchievement(index)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md text-(--secondary) hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                    aria-label="Remove achievement"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-6 text-(--secondary)">
                        <p className="text-sm">No achievements added yet. Type one above and press Enter or click Add.</p>
                    </div>
                )}

                {achievements.length > 0 && (
                    <p className="mt-3 text-xs text-(--secondary)">{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} added</p>
                )}
            </Card>

            {/* Section 2: Available Slots */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-(--primary)">Available Slots</h3>
                            <p className="text-sm text-(--secondary)">Set your weekly availability for mentoring sessions</p>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={addSlot}>
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Slot
                    </Button>
                </div>

                <div className="space-y-3">
                    {slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-(--surface-hover) rounded-lg">
                            {/* Day */}
                            <select
                                value={slot.day}
                                onChange={(e) => updateSlot(index, 'day', e.target.value)}
                                className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light) min-w-[130px]"
                            >
                                {DAYS_OF_WEEK.map((day) => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>

                            {/* Start time */}
                            <select
                                value={slot.startTime}
                                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                                className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)"
                            >
                                {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            <span className="text-(--secondary) text-sm">to</span>

                            {/* End time */}
                            <select
                                value={slot.endTime}
                                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                                className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)"
                            >
                                {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            {/* Remove */}
                            {slots.length > 1 && (
                                <button
                                    onClick={() => removeSlot(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                    aria-label="Remove slot"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {slots.length === 0 && (
                    <div className="text-center py-8 text-(--secondary)">
                        <p className="text-sm">No slots added yet. Click &quot;Add Slot&quot; to set your availability.</p>
                    </div>
                )}
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
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-(--primary)">Documents</h3>
                        <p className="text-sm text-(--secondary)">Upload certifications, resume, or portfolio documents</p>
                    </div>
                </div>

                {/* Upload area */}
                <label className={`flex flex-col items-center justify-center w-full h-40 px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:border-accent hover:bg-(--accent-subtle) ${uploading ? 'opacity-50 pointer-events-none' : 'border-(--border) bg-(--surface)'}`}>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center">
                        {uploading ? (
                            <>
                                <svg className="animate-spin w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-sm font-medium text-(--primary)">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 mb-3 rounded-full bg-(--accent-light) flex items-center justify-center">
                                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-(--primary)">
                                    Drag & drop or <span className="text-accent">browse files</span>
                                </p>
                                <p className="mt-1 text-xs text-(--secondary)">
                                    PDF, DOC, JPG, PNG up to 10MB
                                </p>
                            </>
                        )}
                    </div>
                </label>

                {uploadError && (
                    <p className="mt-2 text-sm text-red-500">{uploadError}</p>
                )}

                {/* Uploaded documents list */}
                {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {documents.map((doc, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-(--surface-hover) rounded-lg group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-(--primary) truncate">{doc.name}</p>
                                    <p className="text-xs text-(--secondary)">
                                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-accent hover:bg-accent/10 transition-colors"
                                    aria-label="View document"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                                <button
                                    onClick={() => removeDocument(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove document"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
