'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { Badge } from '@/components/ui/Badge';
import {
    StartupPitchData,
    PitchAbout,
    PitchCompetitor,
    PitchCustomer,
    PitchBusinessModelItem,
    PitchMarketSizeItem,
    PitchVisionStrategyItem,
    PitchImpactItem,
    PitchCertificationItem,
} from '@/lib/types';

const SECTIONS = [
    { key: 'about', label: 'About · Problem · Solution', icon: '💡' },
    { key: 'competitors', label: 'Competitors', icon: '⚔️' },
    { key: 'customers', label: 'Customers', icon: '👥' },
    { key: 'businessModels', label: 'Business Model', icon: '💰' },
    { key: 'marketSizes', label: 'Market Size', icon: '📊' },
    { key: 'visionStrategies', label: 'Vision & Strategy', icon: '🎯' },
    { key: 'impacts', label: 'Impact', icon: '🌍' },
    { key: 'certifications', label: 'Certifications', icon: '🏅' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);

export default function PitchEditorPage() {
    const [startupId, setStartupId] = useState<string | null>(null);
    const [myRole, setMyRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeSection, setActiveSection] = useState<SectionKey>('about');

    // Pitch data state
    const [aboutData, setAboutData] = useState<PitchAbout>({ about: '', problemStatement: '', solutionProposed: '' });
    const [competitors, setCompetitors] = useState<PitchCompetitor[]>([]);
    const [customers, setCustomers] = useState<PitchCustomer[]>([]);
    const [businessModels, setBusinessModels] = useState<PitchBusinessModelItem[]>([]);
    const [marketSizes, setMarketSizes] = useState<PitchMarketSizeItem[]>([]);
    const [visionStrategies, setVisionStrategies] = useState<PitchVisionStrategyItem[]>([]);
    const [impacts, setImpacts] = useState<PitchImpactItem[]>([]);
    const [certifications, setCertifications] = useState<PitchCertificationItem[]>([]);

    const canEdit = WRITE_ROLES.has(myRole);

    useEffect(() => {
        fetchStartupAndPitch();
    }, []);

    const fetchStartupAndPitch = async () => {
        try {
            const token = localStorage.getItem('founder_token');
            if (!token) return;

            // Get startup info
            const startupRes = await fetch('/api/founder/my-startup', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const startupJson = await startupRes.json();
            if (!startupRes.ok) return;

            const startup = startupJson.data?.startup ?? startupJson;
            const sid = startup.id;
            setStartupId(sid);
            if (startupJson.data?.founderRole) setMyRole(startupJson.data.founderRole);

            // Get pitch data
            const pitchRes = await fetch(`/api/startups/${sid}/pitch/`, {
                headers: { 'x-public-view': 'true' },
            });
            if (pitchRes.ok) {
                const pitchData: StartupPitchData = await pitchRes.json();
                if (pitchData.about) setAboutData(pitchData.about);
                if (pitchData.competitors) setCompetitors(pitchData.competitors);
                if (pitchData.customers) setCustomers(pitchData.customers);
                if (pitchData.businessModels) setBusinessModels(pitchData.businessModels);
                if (pitchData.marketSizes) setMarketSizes(pitchData.marketSizes);
                if (pitchData.visionStrategies) setVisionStrategies(pitchData.visionStrategies);
                if (pitchData.impacts) setImpacts(pitchData.impacts);
                if (pitchData.certifications) setCertifications(pitchData.certifications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!startupId) return;
        setIsSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('founder_token');
            const payload: StartupPitchData = {
                about: aboutData,
                competitors,
                customers,
                businessModels,
                marketSizes,
                visionStrategies,
                impacts,
                certifications,
            };

            const res = await fetch(`/api/startups/${startupId}/pitch/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save');
            setMessage({ type: 'success', text: 'Pitch saved successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save pitch data.' });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Array item helpers ──
    const addItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, template: T) => {
        setter(prev => [...prev, template]);
    };

    const removeItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number) => {
        setter(prev => prev.filter((_, i) => i !== idx));
    };

    const updateItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, updates: Partial<T>) => {
        setter(prev => prev.map((item, i) => (i === idx ? { ...item, ...updates } : item)));
    };

    if (isLoading) return <div className="p-8 text-center text-(--secondary)">Loading pitch data...</div>;
    if (!startupId) return <div className="p-8 text-center text-error">Startup not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">Pitch Editor</h1>
                    <p className="text-(--secondary)">
                        {canEdit ? 'Craft your startup pitch — visible on your public profile.' : 'View-only access to your pitch data.'}
                    </p>
                </div>
                {canEdit && (
                    <Button onClick={handleSave} isLoading={isSaving}>
                        Save All Sections
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    {message.text}
                </div>
            )}

            {/* Section Tabs */}
            <div className="border-b border-(--border) overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                    {SECTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setActiveSection(s.key)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeSection === s.key
                                ? 'border-accent text-accent'
                                : 'border-transparent text-(--secondary) hover:text-(--primary)'
                                }`}
                        >
                            <span className="mr-1.5">{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <fieldset disabled={!canEdit} className={!canEdit ? 'opacity-75' : ''}>
                {/* ── About / Problem / Solution ── */}
                {activeSection === 'about' && (
                    <Card className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-(--primary)">About · Problem · Solution</h3>
                        <Textarea
                            label="About Your Startup"
                            value={aboutData.about || ''}
                            onChange={e => setAboutData({ ...aboutData, about: e.target.value })}
                            placeholder="Tell us about your startup..."
                            rows={4}
                        />
                        <Textarea
                            label="Problem Statement"
                            value={aboutData.problemStatement || ''}
                            onChange={e => setAboutData({ ...aboutData, problemStatement: e.target.value })}
                            placeholder="What problem are you solving?"
                            rows={4}
                        />
                        <Textarea
                            label="Solution Proposed"
                            value={aboutData.solutionProposed || ''}
                            onChange={e => setAboutData({ ...aboutData, solutionProposed: e.target.value })}
                            placeholder="How does your solution work?"
                            rows={4}
                        />
                    </Card>
                )}

                {/* ── Competitors ── */}
                {activeSection === 'competitors' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Competitors</h3>
                            {canEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addItem(setCompetitors, { name: '', description: '', logo: '', website: '' } as PitchCompetitor)}
                                >
                                    + Add Competitor
                                </Button>
                            )}
                        </div>
                        {competitors.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No competitors added yet. Click &quot;+ Add Competitor&quot; to get started.
                            </Card>
                        )}
                        {competitors.map((comp, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setCompetitors, idx)} className="text-error text-sm hover:underline">
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Name" value={comp.name} onChange={e => updateItem(setCompetitors, idx, { name: e.target.value })} required />
                                    <Input label="Website" value={comp.website || ''} onChange={e => updateItem(setCompetitors, idx, { website: e.target.value })} placeholder="https://..." />
                                </div>
                                <Textarea label="Description" value={comp.description || ''} onChange={e => updateItem(setCompetitors, idx, { description: e.target.value })} rows={2} />
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Logo</label>
                                    <FileUpload value={comp.logo || ''} onChange={url => updateItem(setCompetitors, idx, { logo: url })} folder="pitch-competitors" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Customers / Testimonials ── */}
                {activeSection === 'customers' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Customers / Testimonials</h3>
                            {canEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addItem(setCustomers, { name: '', testimonial: '', role: '', company: '', avatar: '' } as PitchCustomer)}
                                >
                                    + Add Customer
                                </Button>
                            )}
                        </div>
                        {customers.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No customer testimonials yet. Click &quot;+ Add Customer&quot; to start.
                            </Card>
                        )}
                        {customers.map((cust, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setCustomers, idx)} className="text-error text-sm hover:underline">
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label="Name" value={cust.name} onChange={e => updateItem(setCustomers, idx, { name: e.target.value })} required />
                                    <Input label="Role" value={cust.role || ''} onChange={e => updateItem(setCustomers, idx, { role: e.target.value })} />
                                    <Input label="Company" value={cust.company || ''} onChange={e => updateItem(setCustomers, idx, { company: e.target.value })} />
                                </div>
                                <Textarea label="Testimonial" value={cust.testimonial} onChange={e => updateItem(setCustomers, idx, { testimonial: e.target.value })} rows={3} required />
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Avatar</label>
                                    <FileUpload value={cust.avatar || ''} onChange={url => updateItem(setCustomers, idx, { avatar: url })} folder="pitch-customers" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Business Model ── */}
                {activeSection === 'businessModels' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Business Model</h3>
                            {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => addItem(setBusinessModels, { title: '', description: '', imageUrl: '' } as PitchBusinessModelItem)}>
                                    + Add Block
                                </Button>
                            )}
                        </div>
                        {businessModels.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No business model content yet. Click &quot;+ Add Block&quot; to start.
                            </Card>
                        )}
                        {businessModels.map((item, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setBusinessModels, idx)} className="text-error text-sm hover:underline">Remove</button>
                                    )}
                                </div>
                                <Input label="Title" value={item.title} onChange={e => updateItem(setBusinessModels, idx, { title: e.target.value })} required />
                                <Textarea label="Description" value={item.description || ''} onChange={e => updateItem(setBusinessModels, idx, { description: e.target.value })} rows={3} />
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setBusinessModels, idx, { imageUrl: url })} folder="pitch-business-model" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Market Size ── */}
                {activeSection === 'marketSizes' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Market Size</h3>
                            {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => addItem(setMarketSizes, { title: '', description: '', imageUrl: '' } as PitchMarketSizeItem)}>
                                    + Add Block
                                </Button>
                            )}
                        </div>
                        {marketSizes.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No market size data yet. Click &quot;+ Add Block&quot; to start.
                            </Card>
                        )}
                        {marketSizes.map((item, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setMarketSizes, idx)} className="text-error text-sm hover:underline">Remove</button>
                                    )}
                                </div>
                                <Input label="Title" value={item.title} onChange={e => updateItem(setMarketSizes, idx, { title: e.target.value })} required />
                                <Textarea label="Description" value={item.description || ''} onChange={e => updateItem(setMarketSizes, idx, { description: e.target.value })} rows={3} />
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setMarketSizes, idx, { imageUrl: url })} folder="pitch-market-size" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Vision & Strategy ── */}
                {activeSection === 'visionStrategies' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Vision & Strategy</h3>
                            {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => addItem(setVisionStrategies, { title: '', description: '', icon: '' } as PitchVisionStrategyItem)}>
                                    + Add Card
                                </Button>
                            )}
                        </div>
                        {visionStrategies.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No vision & strategy cards yet. Click &quot;+ Add Card&quot; to start.
                            </Card>
                        )}
                        {visionStrategies.map((item, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setVisionStrategies, idx)} className="text-error text-sm hover:underline">Remove</button>
                                    )}
                                </div>
                                <Input label="Title" value={item.title} onChange={e => updateItem(setVisionStrategies, idx, { title: e.target.value })} required />
                                <Textarea label="Description" value={item.description || ''} onChange={e => updateItem(setVisionStrategies, idx, { description: e.target.value })} rows={3} />
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Icon (optional image)</label>
                                    <FileUpload value={item.icon || ''} onChange={url => updateItem(setVisionStrategies, idx, { icon: url })} folder="pitch-vision" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Impact ── */}
                {activeSection === 'impacts' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Impact</h3>
                            {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => addItem(setImpacts, { title: '', description: '', imageUrl: '' } as PitchImpactItem)}>
                                    + Add Block
                                </Button>
                            )}
                        </div>
                        {impacts.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No impact data yet. Click &quot;+ Add Block&quot; to start.
                            </Card>
                        )}
                        {impacts.map((item, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setImpacts, idx)} className="text-error text-sm hover:underline">Remove</button>
                                    )}
                                </div>
                                <Input label="Title" value={item.title} onChange={e => updateItem(setImpacts, idx, { title: e.target.value })} required />
                                <Textarea label="Description" value={item.description || ''} onChange={e => updateItem(setImpacts, idx, { description: e.target.value })} rows={3} />
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Image</label>
                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setImpacts, idx, { imageUrl: url })} folder="pitch-impact" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Certifications ── */}
                {activeSection === 'certifications' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-(--primary)">Certifications</h3>
                            {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => addItem(setCertifications, { title: '', issuer: '', dateAwarded: '', imageUrl: '' } as PitchCertificationItem)}>
                                    + Add Certification
                                </Button>
                            )}
                        </div>
                        {certifications.length === 0 && (
                            <Card className="p-8 text-center text-(--secondary)">
                                No certifications yet. Click &quot;+ Add Certification&quot; to start.
                            </Card>
                        )}
                        {certifications.map((item, idx) => (
                            <Card key={idx} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">#{idx + 1}</Badge>
                                    {canEdit && (
                                        <button onClick={() => removeItem(setCertifications, idx)} className="text-error text-sm hover:underline">Remove</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label="Title" value={item.title} onChange={e => updateItem(setCertifications, idx, { title: e.target.value })} required />
                                    <Input label="Issuer" value={item.issuer || ''} onChange={e => updateItem(setCertifications, idx, { issuer: e.target.value })} />
                                    <Input label="Date Awarded" type="date" value={item.dateAwarded || ''} onChange={e => updateItem(setCertifications, idx, { dateAwarded: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--primary) mb-2">Certificate Image</label>
                                    <FileUpload value={item.imageUrl || ''} onChange={url => updateItem(setCertifications, idx, { imageUrl: url })} folder="pitch-certifications" accept="image/*" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </fieldset>

            {/* Bottom Save */}
            {canEdit && (
                <div className="flex justify-end pt-4 border-t border-(--border)">
                    <Button onClick={handleSave} isLoading={isSaving}>
                        Save All Sections
                    </Button>
                </div>
            )}
        </div>
    );
}
