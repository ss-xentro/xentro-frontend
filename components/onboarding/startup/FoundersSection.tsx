'use client';

import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';

export function FoundersSection() {
    const { data, addFounder, updateFounder, removeFounder, addTeamMember, updateTeamMember, removeTeamMember } = useStartupOnboardingStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-base font-semibold text-(--primary)">Founder</h3>
                <p className="text-sm text-(--secondary) mt-1">Add one mandatory founder. This will be shown on the public startup profile.</p>
            </div>

            <div className="space-y-4">
                {data.founders.map((founder, index) => (
                    <div
                        key={index}
                        className="p-5 bg-(--surface) border border-(--border) rounded-xl relative group transition-all hover:border-(--secondary-light)"
                    >
                        <div className="absolute right-4 top-4">
                            {data.founders.length > 1 && (
                                <button
                                    onClick={() => removeFounder(index)}
                                    className="text-(--secondary) hover:text-error transition-colors p-1"
                                    title="Remove founder"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <h3 className="text-sm font-medium text-(--secondary) mb-4 uppercase tracking-wider">
                            {index === 0 ? 'Primary Founder' : `Co-Founder ${index}`}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                placeholder="Jane Doe"
                                value={founder.name}
                                onChange={(e) => updateFounder(index, { name: e.target.value })}
                                required
                            />

                            <Input
                                label="Email Address"
                                placeholder="jane@example.com"
                                type="email"
                                value={founder.email}
                                onChange={(e) => updateFounder(index, { email: e.target.value })}
                                required
                            />

                            <Input
                                label="Title (Optional)"
                                placeholder={index === 0 ? 'Founder' : 'Co-Founder'}
                                value={founder.title || ''}
                                onChange={(e) => updateFounder(index, { title: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-(--primary) mb-2">Photo (Optional)</label>
                                <FileUpload
                                    value={founder.avatar || ''}
                                    onChange={(url) => updateFounder(index, { avatar: url })}
                                    folder="startup-team"
                                    accept="image/*"
                                    enableCrop
                                    aspectRatio={1}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="secondary"
                onClick={addFounder}
                className="w-full border-dashed"
            >
                + Add Co-Founder
            </Button>

            <div className="border-t border-(--border) pt-6 space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-(--primary)">Team Members</h3>
                    <p className="text-sm text-(--secondary) mt-1">Add team members if you want them displayed publicly. This is optional.</p>
                </div>

                {data.teamMembers.map((member, index) => (
                    <div
                        key={`team-${index}`}
                        className="p-5 bg-(--surface) border border-(--border) rounded-xl relative group transition-all hover:border-(--secondary-light)"
                    >
                        <div className="absolute right-4 top-4">
                            <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="text-(--secondary) hover:text-error transition-colors p-1"
                                title="Remove team member"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <h3 className="text-sm font-medium text-(--secondary) mb-4 uppercase tracking-wider">Team Member {index + 1}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                placeholder="Alex Doe"
                                value={member.name}
                                onChange={(e) => updateTeamMember(index, { name: e.target.value })}
                            />

                            <Input
                                label="Email Address"
                                placeholder="alex@example.com"
                                type="email"
                                value={member.email}
                                onChange={(e) => updateTeamMember(index, { email: e.target.value })}
                            />

                            <Input
                                label="Title (Optional)"
                                placeholder="Product Designer"
                                value={member.title || ''}
                                onChange={(e) => updateTeamMember(index, { title: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-(--primary) mb-2">Photo (Optional)</label>
                                <FileUpload
                                    value={member.avatar || ''}
                                    onChange={(url) => updateTeamMember(index, { avatar: url })}
                                    folder="startup-team"
                                    accept="image/*"
                                    enableCrop
                                    aspectRatio={1}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="secondary"
                    onClick={addTeamMember}
                    className="w-full border-dashed"
                >
                    + Add Team Member
                </Button>
            </div>

            <div className="bg-(--accent-subtle) border border-(--accent-light) rounded-lg p-4">
                <h4 className="text-sm font-medium text-accent mb-1">Primary Contact</h4>
                <p className="text-sm text-(--secondary)">
                    We will use <strong>{data.founders[0]?.email || 'the primary founder email'}</strong> for all important communications.
                </p>
            </div>
        </div>
    );
}
