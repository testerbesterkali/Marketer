import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
    Megaphone,
    Target,
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    Monitor,
    Smartphone,
    MousePointer2,
    Sparkles,
    RefreshCcw,
    Zap,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PaidAds = () => {
    const { currentWorkspace } = useWorkspaceStore();
    const [generating, setGenerating] = useState(false);
    const [activeAd, setActiveAd] = useState<{
        headline: string;
        body: string;
        image_url: string;
    } | null>(null);

    const handleGenerateAd = async () => {
        if (!currentWorkspace) return;
        setGenerating(true);

        try {
            // Fetch brand profile for context
            const { data: profile } = await supabase
                .from('brand_profiles')
                .select('*')
                .eq('workspace_id', currentWorkspace.id)
                .single();

            // Simulate AI generation delay
            await new Promise(r => setTimeout(r, 2000));

            setActiveAd({
                headline: `Scale your ${profile?.business_name || 'Brand'} with AI`,
                body: `Boost your visibility on Meta and Google with enterprise-grade content automation. ${profile?.tagline || 'Experience the future of marketing.'}`,
                image_url: `https://image.pollinations.ai/prompt/professional%20marketing%20ad%20for%20${encodeURIComponent(profile?.business_name || 'business')}%20sleek%20modern%20startup%20office?width=1080&height=1080&nologo=true`
            });

            toast.success('Ad variants ready for review!');
        } catch (e) {
            toast.error('Failed to generate ad. Try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Paid Ad Campaigns</h1>
                    <p className="text-gray-500 font-medium italic">Manage and track your AI-generated ad creatives across Meta and Google.</p>
                </div>

                <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Launch New Campaign</span>
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Weekly Budget', value: '$450.00', icon: DollarSign, color: 'indigo' },
                    { label: 'Spent So Far', value: '$128.42', icon: TrendingUp, color: 'green' },
                    { label: 'Total CPC', value: '$0.84', icon: MousePointer2, color: 'orange' },
                    { label: 'Estimated ROAS', value: '4.2x', icon: Zap, color: 'purple' },
                ].map((stat) => (
                    <Card key={stat.label} className="rounded-[2rem] border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center",
                                stat.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                                stat.color === 'green' && "bg-green-50 text-green-600",
                                stat.color === 'orange' && "bg-orange-50 text-orange-600",
                                stat.color === 'purple' && "bg-purple-50 text-purple-600",
                            )}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-gray-300" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ad Builder / Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black">Active Campaign Preview</CardTitle>
                                <p className="text-sm text-gray-400 font-medium italic mt-1">Meta Ads Placement (Feed)</p>
                            </div>
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg bg-white shadow-sm font-bold text-xs">
                                    <Smartphone className="h-3 w-3 mr-2 text-indigo-600" /> Mobile
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-xs text-gray-400">
                                    <Monitor className="h-3 w-3 mr-2" /> Desktop
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1 bg-gray-50/50 flex items-center justify-center">
                            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                                <div className="p-4 flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                                        {currentWorkspace?.name.charAt(0) || 'B'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{currentWorkspace?.name || 'BrandForge Pro'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter flex items-center">
                                            Sponsored <span className="mx-1">•</span> <Monitor className="h-2 w-2" />
                                        </p>
                                    </div>
                                </div>
                                <div className="aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                                    {activeAd ? (
                                        <img src={activeAd.image_url} alt="Ad content" className="w-full h-full object-cover" />
                                    ) : (
                                        <Sparkles className="h-12 w-12 text-gray-200" />
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
                                            {currentWorkspace?.name.toUpperCase() || 'BRANDFORGE.AI'}
                                        </p>
                                        <p className="text-sm font-black text-gray-900 uppercase line-clamp-1">
                                            {activeAd?.headline || 'Scale Your Content Today'}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-medium line-clamp-1 mt-0.5">
                                            {activeAd?.body || 'Build a powerful brand presence with AI.'}
                                        </p>
                                    </div>
                                    <Button size="sm" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold h-9">
                                        Learn More
                                    </Button>
                                </div>
                                <div className="p-4 border-t border-gray-100 flex items-center justify-start space-x-6">
                                    <div className="h-4 w-12 bg-gray-100 rounded" />
                                    <div className="h-4 w-12 bg-gray-100 rounded" />
                                    <div className="h-4 w-12 bg-gray-100 rounded" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaign Settings Sidebar */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-indigo-100 shadow-xl shadow-indigo-100/20 bg-indigo-50/30 p-8 space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-indigo-900">Campaign Logic</h3>
                            <p className="text-sm text-indigo-600 font-medium italic mt-1">AI-Powered Optimization Engine</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                                    <Target className="h-3 w-3 mr-2" /> Targeting Goal
                                </p>
                                <p className="text-sm font-bold text-gray-700">Small business owners interested in marketing automation and SaaS efficiency.</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                                    <Megaphone className="h-3 w-3 mr-2" /> Ad Objective
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-700">Direct Conversion</p>
                                    <RefreshCcw className="h-4 w-4 text-indigo-400" />
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerateAd}
                                disabled={generating}
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 uppercase tracking-widest text-xs flex items-center justify-center space-x-2"
                            >
                                {generating ? (
                                    <>
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                        <span>Crafting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Generate Ad Preview</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

