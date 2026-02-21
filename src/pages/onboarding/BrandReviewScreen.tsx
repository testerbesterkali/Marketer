import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import {
    Check,
    ChevronRight,
    Info,
    Palette,
    Target,
    MessageSquare,
    Globe,
    Loader2,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

export const BrandReviewScreen = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('id');
    const [brandProfile, setBrandProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { setBrandProfile: setStoreBrandProfile } = useWorkspaceStore();

    useEffect(() => {
        if (!workspaceId) return;

        const fetchBrand = async () => {
            const { data, error } = await supabase
                .from('brand_profiles')
                .select('*')
                .eq('workspace_id', workspaceId)
                .single();

            if (data) {
                setBrandProfile(data);
                setStoreBrandProfile(data);
            }
            setLoading(false);
        };

        fetchBrand();
    }, [workspaceId, setStoreBrandProfile]);

    const handleSaveAndContinue = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('brand_profiles')
            .update(brandProfile)
            .eq('id', brandProfile.id);

        if (!error) {
            navigate(`/onboarding/style?id=${workspaceId}`);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-12 space-y-8">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid grid-cols-3 gap-8">
                    <Skeleton className="h-[400px] col-span-2" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] pt-20 pb-40 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 font-bold uppercase tracking-wider text-[10px]">
                            Step 2: Brand Identity Review
                        </Badge>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            Identity generated. Ready to review?
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl">
                            Our AI has synthesized your website data into a unified brand identity.
                            Review and tweak the details below to ensure it's perfect.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="identity" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
                        <TabsTrigger value="identity" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Brand Core</TabsTrigger>
                        <TabsTrigger value="guidelines" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Voice & Tone</TabsTrigger>
                    </TabsList>

                    <TabsContent value="identity" className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                                <CardHeader className="bg-white p-8 border-b border-gray-50">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <Globe className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <CardTitle className="text-xl font-extrabold text-gray-900">Company Profile</CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-400 font-medium italic">Based on your website analysis</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Business Name</Label>
                                            <Input
                                                value={brandProfile?.business_name || ''}
                                                onChange={(e) => setBrandProfile({ ...brandProfile, business_name: e.target.value })}
                                                className="h-12 border-gray-100 bg-gray-50/50 focus:bg-white rounded-xl font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Industry</Label>
                                            <Input
                                                value={brandProfile?.industry || ''}
                                                onChange={(e) => setBrandProfile({ ...brandProfile, industry: e.target.value })}
                                                className="h-12 border-gray-100 bg-gray-50/50 focus:bg-white rounded-xl font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Mission</Label>
                                        <Textarea
                                            value={brandProfile?.mission_statement || ''}
                                            onChange={(e) => setBrandProfile({ ...brandProfile, mission_statement: e.target.value })}
                                            className="min-h-[120px] border-gray-100 bg-gray-50/50 focus:bg-white rounded-2xl font-medium leading-relaxed"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-indigo-600 text-white">
                                <CardHeader className="p-8 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-2xl font-extrabold leading-tight">Target Audience</CardTitle>
                                    <CardDescription className="text-indigo-100 opacity-80 font-medium">Who we're creating for</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-4 space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                                            <p className="font-bold text-lg mb-1">{brandProfile?.target_audience || 'Modern Professionals'}</p>
                                            <p className="text-sm opacity-70">Highly engaged individuals looking for efficiency and premium aesthetics.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Tech Savvy', 'Elite', 'Aesthetic-driven'].map(tag => (
                                                <Badge key={tag} className="bg-white/10 text-white border-white/20 px-3 py-1">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="guidelines" className="mt-8">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <CardTitle className="text-xl font-extrabold text-gray-900">Voice & Tone Guidelines</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Voice</Label>
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                <p className="text-lg font-bold text-indigo-600 italic">"{brandProfile?.brand_voice || 'Modern, minimal, and authoritative'}"</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personality Traits</Label>
                                            <div className="flex flex-wrap gap-3">
                                                {['Professional', 'Witty', 'Direct', 'Inspirational'].map(trait => (
                                                    <div key={trait} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                                        <Check className="h-3 w-3 text-green-500" />
                                                        <span className="text-sm font-bold text-gray-700">{trait}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Color Palette</Label>
                                            <div className="flex items-center space-x-4">
                                                {[
                                                    { color: brandProfile?.primary_color || '#4F46E5', label: 'Primary' },
                                                    { color: brandProfile?.secondary_color || '#F97316', label: 'Accent' },
                                                    { color: '#1E293B', label: 'Base' }
                                                ].map((c) => (
                                                    <div key={c.label} className="flex flex-col items-center space-y-2">
                                                        <div className="h-14 w-14 rounded-2xl shadow-inner border border-black/5" style={{ backgroundColor: c.color }} />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{c.label}</span>
                                                    </div>
                                                ))}
                                                <button className="h-14 w-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all">
                                                    <Palette className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer Navigation */}
                <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-50">
                    <div className="max-w-5xl w-full flex items-center justify-between">
                        <Button variant="ghost" className="font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            <ChevronRight className="rotate-180 mr-2 h-4 w-4" />
                            Back to Analyis
                        </Button>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                className="border-gray-200 text-gray-900 font-bold h-14 px-8 rounded-2xl hover:bg-gray-50"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Draft
                            </Button>
                            <Button
                                onClick={handleSaveAndContinue}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-10 rounded-2xl shadow-lg shadow-indigo-100 group transition-all"
                            >
                                {saving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Approve & Selection Style</span>
                                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
