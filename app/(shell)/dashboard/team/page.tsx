'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { MediaPreview } from '@/components/ui/MediaPreview';
import { getSessionToken } from '@/lib/auth-utils';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    isPrimary: boolean;
    joinedAt: string;
}

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

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [myRole, setMyRole] = useState<string>('');

    // Invite Form State
    const [newMember, setNewMember] = useState({ name: '', email: '', role: 'founder' });
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

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

            if (!res.ok) throw new Error(json.message || 'Failed to invite');

            // Success
            setInviteOpen(false);
            setNewMember({ name: '', email: '', role: 'founder' });
            fetchTeam(); // Refresh list
        } catch (err: any) {
            setInviteError(err.message);
        } finally {
            setIsInviting(false);
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
                alert(json.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-center text-(--secondary)">Loading team...</div>;

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
                    <h3 className="text-lg font-semibold mb-4">Invite New Member</h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        </div>

                        {inviteError && <p className="text-sm text-error">{inviteError}</p>}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={isInviting}>Send Invite</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {team.map((member) => (
                    <Card key={member.id} className="relative overflow-hidden p-0 group">
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
                                <div className="h-full w-full flex items-center justify-center text-5xl font-semibold text-(--secondary)">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                {member.isPrimary && (
                                    <Badge variant="info" size="sm">Primary</Badge>
                                )}
                            </div>
                        </div>

                        <div className="p-5 space-y-3">
                            <div>
                                <h3 className="text-xl font-semibold text-(--primary)">{member.name}</h3>
                                <p className="text-sm text-(--secondary)">{member.email}</p>
                            </div>

                            <div className="pt-3 border-t border-(--border) flex items-center justify-between">
                                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                    {member.role.replace('_', ' ')}
                                </Badge>

                                {!member.isPrimary && WRITE_ROLES.has(myRole) && (
                                    <button
                                        onClick={() => handleRemove(member.id)}
                                        className="text-xs text-error hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedMember && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedMember(null)}
                >
                    <div
                        className="w-full max-w-2xl bg-(--surface) border border-(--border) rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
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
                                <div className="h-full w-full flex items-center justify-center text-7xl font-semibold text-white/70">
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
