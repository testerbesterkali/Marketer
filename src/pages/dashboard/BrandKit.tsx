import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Palette,
    Type,
    Megaphone,
    Target,
    Save,
    RefreshCcw,
    Download,
    Image as ImageIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const BrandKit = () => {
    const { currentWorkspace } = useWorkspaceStore();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!currentWorkspace) return;

        const fetchBrandProfile = async () => {
            const { data } = await supabase
                .from('brand_profiles')
                .select('*')
                .eq('workspace_id', currentWorkspace.id)
                .single();

            if (data) {
                setProfile(data);
            }
            setLoading(false);
        };

        fetchBrandProfile();
    }, [currentWorkspace]);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        await supabase
            .from('brand_profiles')
            .update(profile)
            .eq('id', profile.id);

        setSaving(false);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <RefreshCcw className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Brand Kit</h1>
                    <p className="text-gray-500 font-medium">Your centralized brand identity and visual guidelines.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100 flex items-center space-x-2"
                >
                    {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visual Identity */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Logo Card */}
                    <Card className="rounded-3xl border-gray-100 overflow-hidden shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                            <CardTitle className="text-lg font-bold flex items-center space-x-2">
                                <ImageIcon className="h-5 w-5 text-indigo-600" />
                                <span>Primary Logo</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="aspect-square rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 group relative mb-6">
                                {profile?.logo_url ? (
                                    <img src={profile.logo_url} alt="Logo" className="max-h-32 object-contain" />
                                ) : (
                                    <div className="text-center p-4">
                                        <Download className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No logo found</p>
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full rounded-xl font-bold border-gray-200">
                                Replace Logo
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Color Palette */}
                    <Card className="rounded-3xl border-gray-100 overflow-hidden shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                            <CardTitle className="text-lg font-bold flex items-center space-x-2">
                                <Palette className="h-5 w-5 text-indigo-600" />
                                <span>Color Palette</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {profile?.color_palette && Object.entries(profile.color_palette).map(([name, hex]: [string, any]) => (
                                    <div key={name} className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{name}</p>
                                        <div className="flex items-center space-x-2 group">
                                            <div
                                                className="h-10 w-10 rounded-xl shadow-inner border border-black/5"
                                                style={{ backgroundColor: hex }}
                                            />
                                            <p className="text-sm font-bold text-gray-600">{hex}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full rounded-xl font-bold border-gray-200">
                                Generate New Palette
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Typography */}
                    <Card className="rounded-3xl border-gray-100 overflow-hidden shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                            <CardTitle className="text-lg font-bold flex items-center space-x-2">
                                <Type className="h-5 w-5 text-indigo-600" />
                                <span>Typography</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Heading Font</p>
                                    <p className="text-2xl font-black text-gray-900">{profile?.typography?.heading_font || 'Inter'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Body Font</p>
                                    <p className="text-lg font-medium text-gray-600">{profile?.typography?.body_font || 'Inter'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Narrative & Voice */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-3xl border-gray-100 overflow-hidden shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6 px-8 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black flex items-center space-x-2">
                                <Megaphone className="h-6 w-6 text-indigo-600" />
                                <span>Brand Narrative</span>
                            </CardTitle>
                            <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold">AI GENERATED Pro</Badge>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            {/* Business Name & Tagline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Business Name</p>
                                    <Input
                                        value={profile?.business_name || ''}
                                        onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                                        className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tagline</p>
                                    <Input
                                        value={profile?.tagline || ''}
                                        onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                                        className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                    />
                                </div>
                            </div>

                            {/* Brand Voice & Mission */}
                            <div className="space-y-3">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mission Statement</p>
                                <Textarea
                                    value={profile?.mission_statement || ''}
                                    onChange={(e) => setProfile({ ...profile, mission_statement: e.target.value })}
                                    className="min-h-[120px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-medium leading-relaxed"
                                />
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Brand Voice</p>
                                <Textarea
                                    value={profile?.brand_voice || ''}
                                    onChange={(e) => setProfile({ ...profile, brand_voice: e.target.value })}
                                    className="min-h-[100px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-medium italic text-gray-600 leading-relaxed"
                                />
                            </div>

                            {/* Target Audience & Values */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Target Audience</p>
                                    <Textarea
                                        value={profile?.target_audience || ''}
                                        onChange={(e) => setProfile({ ...profile, target_audience: e.target.value })}
                                        className="min-h-[120px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-medium"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Core Values</p>
                                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 min-h-[120px]">
                                        {profile?.core_values?.map((value: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-white border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl">
                                                {value}
                                            </Badge>
                                        ))}
                                        <Button variant="ghost" size="sm" className="rounded-xl border border-dashed border-gray-300 text-gray-400">
                                            + Add Target
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* USP Section */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Unique Selling Points</p>
                                    <Button variant="ghost" size="sm" className="text-indigo-600 space-x-1 font-bold">
                                        <RefreshCcw className="h-3 w-3" />
                                        <span>Regenerate Points</span>
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {profile?.unique_selling_points?.map((usp: string, i: number) => (
                                        <div key={i} className="flex items-center space-x-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                <Target className="h-5 w-5 text-green-600" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 leading-tight">{usp}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
