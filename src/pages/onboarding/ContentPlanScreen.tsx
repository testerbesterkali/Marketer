import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    ArrowRight,
    TrendingUp,
    Mail,
    PenTool,
    Loader2,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: 'text-gray-900', bg: 'bg-gray-50' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const CONTENT_TYPES = [
    { id: 'educational', name: 'Educational', description: 'How-to guides, tips, and industry insights.', icon: TrendingUp },
    { id: 'promotional', name: 'Promotional', description: 'Product launches, offers, and features.', icon: Target },
    { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Company culture and process.', icon: Users },
    { id: 'engagement', name: 'Audience Engagement', description: 'Polls, questions, and discussions.', icon: MessageSquare },
];

import { Target, Users, MessageSquare } from 'lucide-react';

export const ContentPlanScreen = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('id');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'linkedin']);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['educational', 'engagement']);
    const [frequency, setFrequency] = useState('3');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleType = (id: string) => {
        setSelectedTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleNext = async () => {
        if (selectedPlatforms.length === 0 || selectedTypes.length === 0) return;
        setLoading(true);

        const { error } = await supabase
            .from('content_plans')
            .upsert({
                workspace_id: workspaceId,
                platforms: selectedPlatforms.reduce((acc, p) => ({ ...acc, [p]: { enabled: true } }), {}),
                content_pillars: selectedTypes,
                post_frequency: parseInt(frequency),
            });

        if (!error) {
            navigate(`/onboarding/generating?id=${workspaceId}`);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] pt-20 pb-40 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        <Sparkles className="h-3 w-3" />
                        <span>Step 3: Content Strategy</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Define your Content Plan
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Tell us where you want to grow and what kind of content resonates with your brand.
                        We'll build a strategy that works for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Platform Selection */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 border-b border-gray-50">
                            <CardTitle className="text-xl font-extrabold">Social Platforms</CardTitle>
                            <CardDescription>Where should we post your content?</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {PLATFORMS.map((platform) => (
                                <div
                                    key={platform.id}
                                    onClick={() => togglePlatform(platform.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                        selectedPlatforms.includes(platform.id) ? "border-indigo-600 bg-indigo-50/30" : "border-gray-100 hover:border-indigo-100"
                                    )}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={cn("p-2 rounded-xl", platform.bg)}>
                                            <platform.icon className={cn("h-5 w-5", platform.color)} />
                                        </div>
                                        <span className="font-bold text-gray-900">{platform.name}</span>
                                    </div>
                                    <Checkbox checked={selectedPlatforms.includes(platform.id)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Frequency & Types */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-extrabold text-gray-900">Posting Frequency</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: '1', label: '1x week', desc: 'Maintain' },
                                        { id: '3', label: '3x week', desc: 'Grow' },
                                        { id: '5', label: '5x week', desc: 'Accelerate' },
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFrequency(f.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all text-center space-y-1",
                                                frequency === f.id ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "border-gray-100 hover:border-indigo-100 text-gray-500"
                                            )}
                                        >
                                            <p className="font-black text-lg">{f.label}</p>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-70", frequency === f.id ? "text-white" : "text-gray-400")}>{f.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-extrabold text-gray-900">Content Pillars</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-3">
                                {CONTENT_TYPES.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => toggleType(type.id)}
                                        className={cn(
                                            "flex items-start space-x-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                            selectedTypes.includes(type.id) ? "border-indigo-600 bg-indigo-50/30" : "border-gray-100 hover:border-indigo-100"
                                        )}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                            <type.icon className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{type.name}</p>
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed">{type.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-50">
                    <div className="max-w-5xl w-full flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">Strategy Summary</span>
                            <p className="text-xs text-gray-400 font-medium">
                                {selectedPlatforms.length} platforms • {frequency} posts/week • {selectedTypes.length} pillars
                            </p>
                        </div>

                        <Button
                            onClick={handleNext}
                            disabled={selectedPlatforms.length === 0 || selectedTypes.length === 0 || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-10 rounded-2xl shadow-lg shadow-indigo-100 group transition-all"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Forge my Plan</span>
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
