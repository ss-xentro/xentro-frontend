'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUpload } from '@/components/ui/FileUpload';
import { MediaPreview } from '@/components/ui/MediaPreview';
import { Modal } from '@/components/ui/Modal';
import { getSessionToken } from '@/lib/auth-utils';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    title?: string | null;
    avatar?: string | null;
    bio?: string | null;
    isPrimary: boolean;
}

interface MemberFormState {
    name: string;
    email: string;
    role: string;
    title: string;
    bio: string;
    avatar: string;
}

const EMPTY_MEMBER_FORM: MemberFormState = {
    name: '',
    email: '',
    role: 'employee',
    title: '',
    bio: '',
    avatar: '',
};

const roleOptions = [
    { value: 'ceo', label: 'CEO' },
    { value: 'cto', label: 'CTO' },
    { value: 'coo', label: 'COO' },
    { value: 'cfo', label: 'CFO' },
    { value: 'cpo', label: 'CPO' },
    { value: 'founder', label: 'Founder' },
    { value: 'co_founder', label: 'Co-Founder' },
    { value: 'employee', label: 'Employee' },
];

// Roles that have write access (can invite/remove members, edit startup)
const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);
const FOUNDER_ROLES = new Set(['founder', 'co_founder']);
const LEADERSHIP_ROLES = new Set(['ceo', 'cto', 'coo', 'cfo', 'cpo']);

const formatRoleLabel = (role: string) =>
    role
        .replace(/_/g, ' ')
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const getInitials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

const ALLOWED_BIO_TAGS = new Set([
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4'
]);

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const sanitizeBioHtml = (value?: string | null) => {
    const raw = (value || '').trim();
    if (!raw) return '';

    const withoutDangerousBlocks = raw
        .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<!--([\s\S]*?)-->/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();

    if (!withoutDangerousBlocks) return '';

    if (!/<[a-z][\s\S]*>/i.test(withoutDangerousBlocks)) {
        return `<p>${escapeHtml(withoutDangerousBlocks)}</p>`;
    }

    return withoutDangerousBlocks.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (fullMatch, rawTag, rawAttrs = '') => {
        const tag = String(rawTag || '').toLowerCase();
        const isClosingTag = fullMatch.startsWith('</');

        if (!ALLOWED_BIO_TAGS.has(tag)) return '';
        if (isClosingTag) return `</${tag}>`;

        if (tag !== 'a') return `<${tag}>`;

        const hrefMatch = String(rawAttrs).match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const hrefRaw = (hrefMatch?.[2] || hrefMatch?.[3] || hrefMatch?.[4] || '').trim();
        const isSafeHref = /^(https?:|mailto:|tel:|\/|#)/i.test(hrefRaw);

        if (!isSafeHref) return '<a>';
        return `<a href="${escapeHtml(hrefRaw)}" target="_blank" rel="noopener noreferrer">`;
    });
};

const shouldShowTitle = (title: string | null | undefined, role: string) => {
    const cleanTitle = (title || '').trim().toLowerCase();
    if (!cleanTitle) return false;
    return cleanTitle !== formatRoleLabel(role).toLowerCase();
};

const getRoleTheme = (role: string) => {
    if (FOUNDER_ROLES.has(role)) {
        return {
            cardClass: 'border-accent/40 hover:border-accent',
            stripClass: 'bg-accent',
            badgeClass: 'border-accent/50 bg-accent/10 text-accent',
        };
    }

    if (LEADERSHIP_ROLES.has(role)) {
        return {
            cardClass: 'border-info/40 hover:border-info',
            stripClass: 'bg-info',
            badgeClass: 'border-info/50 bg-info/10 text-info',
        };
    }

    return {
        cardClass: 'border-(--border) hover:border-(--secondary-light)',
        stripClass: 'bg-(--secondary-light)',
        badgeClass: 'border-(--border) bg-(--surface-hover) text-(--secondary)',
    };
};

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [myRole, setMyRole] = useState<string>('');

    // Invite Form State
    const [newMember, setNewMember] = useState<MemberFormState>(EMPTY_MEMBER_FORM);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [editMember, setEditMember] = useState<MemberFormState>(EMPTY_MEMBER_FORM);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const token = getSessionToken('founder');
            const res = await fetch('/api/founder/team', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok) {
                setTeam(json.members || json.data || []);
                if (json.myRole) setMyRole(json.myRole);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setInviteError(null);

        try {
            const token = getSessionToken('founder');
            const res = await fetch('/api/founder/team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMember),
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || json.message || 'Failed to invite');

            // Success
            setInviteOpen(false);
            setNewMember(EMPTY_MEMBER_FORM);
            fetchTeam(); // Refresh list
        } catch (err: any) {
            setInviteError(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleStartEdit = (member: TeamMember) => {
        setEditingMember(member);
        setEditError(null);
        setEditMember({
            name: member.name || '',
            email: member.email || '',
            role: member.role || 'employee',
            title: member.title || '',
            bio: member.bio || '',
            avatar: member.avatar || '',
        });
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;

        setIsSavingEdit(true);
        setEditError(null);
        try {
            const token = getSessionToken('founder');
            const res = await fetch(`/api/founder/team/${editingMember.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editMember),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || json.message || 'Failed to update member');

            setEditingMember(null);
            setEditMember(EMPTY_MEMBER_FORM);
            fetchTeam();
        } catch (err: any) {
            setEditError(err.message);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const token = getSessionToken('founder');
            const res = await fetch(`/api/founder/team/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchTeam();
            } else {
                const json = await res.json();
                alert(json.error || json.message || 'Failed to remove member');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-center text-(--secondary)">Loading team...</div>;

    const selectedBioHtml = selectedMember ? sanitizeBioHtml(selectedMember.bio) : '';

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">Team Management</h1>
                    <p className="text-(--secondary)">Manage your startup&apos;s founders and team members.</p>
                </div>
                {!inviteOpen && WRITE_ROLES.has(myRole) && (
                    <Button onClick={() => setInviteOpen(true)}>
                        + Add Member
                    </Button>
                )}
            </div>

            {inviteOpen && (
                <Card className="p-6 border-accent/50 bg-(--accent-subtle)/10">
                    <h3 className="text-lg font-semibold mb-1">Add Team Member</h3>
                    <p className="text-sm text-(--secondary) mb-4">
                        Add the same details you collect in startup onboarding so profiles stay consistent.
                    </p>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Full Name"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Email Address"
                                type="email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                required
                            />
                            <Select
                                value={newMember.role}
                                onChange={(val) => setNewMember({ ...newMember, role: val })}
                                options={roleOptions}
                            />
                            <Input
                                placeholder="Professional Title (e.g. Head of Product)"
                                value={newMember.title}
                                onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-(--primary)">Profile Image</p>
                            <FileUpload
                                value={newMember.avatar || null}
                                onChange={(url) => setNewMember({ ...newMember, avatar: url || '' })}
                                folder="team-avatars"
                                accept="image/*"
                                enableCrop
                                aspectRatio={1}
                            />
                        </div>

                        <RichTextEditor
                            label="Short Bio"
                            placeholder="Brief background, responsibilities, or expertise"
                            value={newMember.bio}
                            onChange={(html) => setNewMember({ ...newMember, bio: html })}
                        />

                        {inviteError && <p className="text-sm text-error">{inviteError}</p>}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={isInviting}>Add Member</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {team.map((member, index) => {
                    const memberBioHtml = sanitizeBioHtml(member.bio);

                    return (
                        <Card
                            key={`${member.id}-${member.email}-${member.role}-${index}`}
                            className={`relative overflow-hidden p-0 group transition-colors ${getRoleTheme(member.role).cardClass}`}
                        >
                            <div className={`h-1 w-full ${getRoleTheme(member.role).stripClass}`} />
                            <div className="relative h-52 w-full bg-(--surface-hover)">
                                {member.avatar ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMember(member)}
                                        className="h-full w-full text-left"
                                        aria-label={`Open ${member.name} profile image`}
                                    >
                                        <MediaPreview
                                            src={member.avatar}
                                            alt={member.name}
                                            className="h-full w-full rounded-none border-0"
                                            mediaClassName="object-cover"
                                            showControls={false}
                                        />
                                    </button>
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-(--surface-hover) to-(--surface) text-4xl font-semibold text-(--secondary)">
                                        {getInitials(member.name || 'TM')}
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    {member.isPrimary && (
                                        <Badge variant="info" size="sm">Primary</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold text-(--primary) leading-tight">{member.name}</h3>
                                    {shouldShowTitle(member.title, member.role) && (
                                        <p className="text-sm font-medium text-(--primary)">{member.title}</p>
                                    )}
                                    <p className="text-sm text-(--secondary) truncate">{member.email || 'No email yet'}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getRoleTheme(member.role).badgeClass}`}>
                                        {formatRoleLabel(member.role)}
                                    </Badge>
                                    {!member.avatar && (
                                        <Badge variant="outline" className="text-[10px] tracking-wide">No avatar</Badge>
                                    )}
                                </div>

                                {memberBioHtml && (
                                    <div
                                        className="text-sm text-(--secondary) line-clamp-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_a]:underline"
                                        dangerouslySetInnerHTML={{ __html: memberBioHtml }}
                                    />
                                )}

                                <div className="pt-3 border-t border-(--border) flex items-center justify-between">
                                    <span className="text-xs text-(--secondary)">Profile actions</span>

                                    {WRITE_ROLES.has(myRole) && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleStartEdit(member)}
                                                className="text-xs font-medium text-(--secondary) hover:text-(--primary) hover:underline"
                                            >
                                                Edit
                                            </button>
                                            {!member.isPrimary && (
                                                <button
                                                    onClick={() => handleRemove(member.id)}
                                                    className="text-xs font-medium text-error hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {editingMember && (
                <Modal
                    isOpen={!!editingMember}
                    onClose={() => setEditingMember(null)}
                    title="Edit Team Member"
                    className="max-w-2xl"
                >
                    <p className="text-sm text-(--secondary) -mt-2 mb-4">Update profile details for {editingMember.name}.</p>

                    <form onSubmit={handleEditSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Full Name"
                                value={editMember.name}
                                onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Email Address"
                                type="email"
                                value={editMember.email}
                                onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                            />
                            <Select
                                value={editMember.role}
                                onChange={(val) => setEditMember({ ...editMember, role: val })}
                                options={roleOptions}
                            />
                            <Input
                                placeholder="Professional Title"
                                value={editMember.title}
                                onChange={(e) => setEditMember({ ...editMember, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-(--primary)">Profile Image</p>
                            <FileUpload
                                value={editMember.avatar || null}
                                onChange={(url) => setEditMember({ ...editMember, avatar: url || '' })}
                                folder="team-avatars"
                                accept="image/*"
                                enableCrop
                                aspectRatio={1}
                            />
                        </div>

                        <RichTextEditor
                            label="Short Bio"
                            placeholder="Brief background, responsibilities, or expertise"
                            value={editMember.bio}
                            onChange={(html) => setEditMember({ ...editMember, bio: html })}
                        />

                        {editError && <p className="text-sm text-error">{editError}</p>}

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditingMember(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSavingEdit}>Save Changes</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {selectedMember && (
                <Modal
                    isOpen={!!selectedMember}
                    onClose={() => setSelectedMember(null)}
                    className="max-w-2xl overflow-hidden p-0"
                >
                    <div className="relative h-[65vh] min-h-[360px] bg-black">
                        {selectedMember.avatar ? (
                            <MediaPreview
                                src={selectedMember.avatar}
                                alt={selectedMember.name}
                                className="h-full w-full rounded-none border-0 bg-black"
                                mediaClassName="object-contain"
                                showControls={false}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-7xl font-semibold text-(--secondary)">
                                {selectedMember.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setSelectedMember(null)}
                            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/60 text-white hover:bg-black/80"
                            aria-label="Close profile image preview"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-5">
                        <h4 className="text-lg font-semibold text-(--primary)">{selectedMember.name}</h4>
                        <p className="text-sm text-(--secondary)">{selectedMember.email}</p>
                        {shouldShowTitle(selectedMember.title, selectedMember.role) && (
                            <p className="text-sm text-(--primary) mt-1">{selectedMember.title}</p>
                        )}
                        <div className="mt-3">
                            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                {formatRoleLabel(selectedMember.role)}
                            </Badge>
                        </div>
                        {selectedBioHtml && (
                            <div
                                className="text-sm text-(--secondary) mt-3 leading-relaxed space-y-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: selectedBioHtml }}
                            />
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
