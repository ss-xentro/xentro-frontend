'use client';

import { useStartupOnboardingStore } from '@/stores/useStartupOnboardingStore';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';

export function StartupIdentitySection() {
    const { data, updateData } = useStartupOnboardingStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-6">
                <Input
                    label="Startup Name"
                    placeholder="e.g. Acme Inc."
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    required
                />

                <Input
                    label="Tagline"
                    placeholder="e.g. The operating system for startups"
                    value={data.tagline}
                    onChange={(e) => updateData({ tagline: e.target.value })}
                    hint="A short, catchy phrase describing your business"
                />

                <div className="grid gap-2">
                    <label className="block text-sm font-medium text-(--primary) mb-2">
                        Startup Logo
                    </label>
                    <FileUpload
                        value={data.logo}
                        onChange={(url) => updateData({ logo: url })}
                        folder="startup-logos"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="w-full"
                        aspectRatio={1}
                        enableCrop
                    />
                </div>

                <Textarea
                    label="One-line Pitch"
                    placeholder="Describe what your startup does in one sentence..."
                    value={data.pitch}
                    onChange={(e) => updateData({ pitch: e.target.value })}
                    maxLength={160}
                    characterCount
                    hint="Max 160 characters. Keep it punchy."
                />
            </div>
        </div>
    );
}
