import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Globe, ArrowRight } from 'lucide-react';

export const UrlInputScreen = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();
    const { setWorkspace } = useWorkspaceStore();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);

        try {
            // 1. Create workspace
            const { data: workspace, error: wsError } = await supabase
                .from('workspaces')
                .insert({
                    owner_id: user?.id,
                    name: new URL(url).hostname.replace('www.', ''),
                    website_url: url,
                    onboarding_step: 1
                })
                .select()
                .single();

            if (wsError) throw wsError;

            setWorkspace(workspace);

            // 2. Advance to next step
            navigate(`/onboarding/analyzing?id=${workspace.id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Please enter a valid URL',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center px-4">
            <div className="max-w-xl w-full text-center space-y-8">
                <div className="space-y-4">
                    <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Globe className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        Let's build your brand identity
                    </h1>
                    <p className="text-lg text-gray-600">
                        Enter your website URL, and our AI will extract your brand assets,
                        voice, and values in seconds.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="h-16 px-6 text-lg rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-0 transition-all shadow-sm"
                        />
                        <Button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6"
                            disabled={loading || !url}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span>Analyse Website</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Don't have a website yet? <button type="button" className="text-indigo-600 font-medium hover:underline">Set up manually</button>
                    </p>
                </form>

                <div className="grid grid-cols-3 gap-6 pt-12">
                    {['Extract Assets', 'Define Voice', 'Content Plan'].map((item) => (
                        <div key={item} className="flex flex-col items-center space-y-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 w-1/3 opacity-30"></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
