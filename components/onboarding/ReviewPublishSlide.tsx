'use client';

import {
    Button,
    Card,
    Badge,
    VerifiedBadge,
    SDGBadge
} from '@/components/ui';
import { AppIcon } from '@/components/ui/AppIcon';
import {
    OnboardingFormData,
    institutionTypeLabels,
    operatingModeLabels,
    sdgLabels,
    sectorLabels
} from '@/lib/types';
import { formatNumber, formatCurrency, cn } from '@/lib/utils';

interface ReviewPublishSlideProps {
    formData: OnboardingFormData;
    onEdit: (step: number) => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    className?: string;
}

export default function ReviewPublishSlide({
    formData,
    onEdit,
    onSaveDraft,
    onPublish,
    className,
}: ReviewPublishSlideProps) {
    const typeInfo = formData.type ? institutionTypeLabels[formData.type] : null;
    const modeInfo = formData.operatingMode ? operatingModeLabels[formData.operatingMode] : null;

    return (
        <div className={cn('space-y-8 pb-20', className)}>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-(--primary) mb-2">
                    Ready to publish?
                </h2>
                <p className="text-(--secondary)">
                    Review the details below before making them public.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Basic Info Card */}
                <Card className="relative group">
                    <button
                        onClick={() => onEdit(1)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 px-3 py-1 text-sm bg-(--surface-hover) rounded-(--radius-full) text-accent transition-all"
                    >
                        Edit
                    </button>

                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 rounded-xl bg-(--surface-hover) border border-(--border) overflow-hidden flex items-center justify-center">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <AppIcon name="landmark" className="w-8 h-8 text-(--secondary)" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-(--primary)">{formData.name}</h3>
                                <VerifiedBadge />
                            </div>
                            <p className="text-(--secondary) mb-2">{formData.tagline}</p>
                            <div className="flex flex-wrap gap-2">
                                {typeInfo && <Badge>{typeInfo.label}</Badge>}
                                <span className="text-sm text-(--secondary) flex items-center gap-1">
                                    <AppIcon name="map-pin" className="w-4 h-4" /> {formData.city}, {formData.country}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-(--secondary)">
                        <p className="line-clamp-3">{formData.description}</p>
                    </div>
                </Card>

                {/* Impact Stats Card */}
                <Card className="relative group">
                    <button
                        onClick={() => onEdit(6)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 px-3 py-1 text-sm bg-(--surface-hover) rounded-(--radius-full) text-accent transition-all"
                    >
                        Edit
                    </button>

                    <h4 className="font-semibold text-(--primary) mb-4">Impact & Operating Model</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-(--surface-hover) rounded-lg text-center">
                            <p className="text-2xl font-bold text-(--primary)">{formatNumber(formData.startupsSupported)}</p>
                            <p className="text-xs text-(--secondary)">Startups</p>
                        </div>
                        <div className="p-3 bg-(--surface-hover) rounded-lg text-center">
                            <p className="text-2xl font-bold text-(--primary)">{formatNumber(formData.studentsMentored)}</p>
                            <p className="text-xs text-(--secondary)">Mentored</p>
                        </div>
                        <div className="p-3 bg-(--surface-hover) rounded-lg text-center">
                            <p className="text-sm font-bold text-(--primary) truncate">
                                {formatCurrency(formData.fundingFacilitated, formData.fundingCurrency)}
                            </p>
                            <p className="text-xs text-(--secondary)">Funding</p>
                        </div>
                        <div className="p-3 bg-(--surface-hover) rounded-lg text-center">
                            <AppIcon name={modeInfo?.icon || 'globe'} className="w-6 h-6 text-(--primary) mx-auto mb-1" />
                            <p className="text-xs text-(--secondary)">{modeInfo?.label}</p>
                        </div>
                    </div>
                </Card>

                {/* Focus Areas Card */}
                <Card className="relative group">
                    <button
                        onClick={() => onEdit(8)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 px-3 py-1 text-sm bg-(--surface-hover) rounded-(--radius-full) text-accent transition-all"
                    >
                        Edit
                    </button>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-(--primary) mb-3">SDG Focus</h4>
                            <div className="flex flex-wrap gap-2">
                                {formData.sdgFocus.map((sdg) => (
                                    <SDGBadge key={sdg} sdg={sdgLabels[sdg].label} color={sdgLabels[sdg].color} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-(--primary) mb-3">Sectors</h4>
                            <div className="flex flex-wrap gap-2">
                                {formData.sectorFocus.map((sector) => (
                                    <Badge key={sector} variant="outline" className="gap-1">
                                        <AppIcon name={sectorLabels[sector]?.icon || 'folder'} className="w-3.5 h-3.5" /> {sectorLabels[sector]?.label ?? sector}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-(--surface) border-t border-(--border) flex flex-col sm:flex-row items-center justify-between gap-2 md:pl-72 z-10 glass">
                <Button variant="ghost" onClick={onSaveDraft}>
                    Save as Draft
                </Button>
                <Button size="lg" onClick={onPublish} className="bg-success hover:bg-[#059669] shadow-(--shadow-lg)">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Get Approval (Cmd+Enter)
                </Button>
            </div>
        </div>
    );
}
