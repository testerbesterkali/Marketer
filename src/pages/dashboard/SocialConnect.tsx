import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    CheckCircle2,
    Plus,
    ExternalLink,
    ShieldCheck,
    Zap,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-gray-900', bg: 'bg-gray-50' },
];

export const SocialConnect = () => {
    const { currentWorkspace } = useWorkspaceStore();
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentWorkspace) return;

        const fetchConnections = async () => {
            const { data } = await supabase
                .from('social_connections')
                .select('*')
                .eq('workspace_id', currentWorkspace.id);

            if (data) {
                setConnections(data);
            }
            setLoading(false);
        };

        fetchConnections();
    }, [currentWorkspace]);

    const handleConnect = async (platformId: string) => {
        if (!currentWorkspace) return;

        // Placeholder for OAuth flow
        toast.info(`Connecting to ${platformId}...`, {
            description: "Redirecting to secure authorization page."
        });

        setTimeout(async () => {
            const { data, error } = await supabase
                .from('social_connections')
                .insert({
                    workspace_id: currentWorkspace.id,
                    platform: platformId,
                    account_name: `${currentWorkspace.name} ${platformId.charAt(0).toUpperCase() + platformId.slice(1)}`,
                    connected: true
                })
                .select()
                .single();

            if (!error && data) {
                setConnections([...connections, data]);
                toast.success(`Successfully connected ${platformId}!`);
            }
        }, 1500);
    };

    const isConnected = (platformId: string) => {
        return connections.some(c => c.platform === platformId && c.connected);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <RefreshCcw className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Social Integrations</h1>
                    <p className="text-gray-500 font-medium italic">Connect your brand accounts to enable AI-powered scheduling and publishing.</p>
                </div>
                <div className="flex items-center space-x-3 bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">Enterprise Grade Encryption Active</span>
                </div>
            </div>

            {/* Grid of Platforms */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {PLATFORMS.map((platform) => {
                    const connected = isConnected(platform.id);
                    const Icon = platform.icon;

                    return (
                        <Card key={platform.id} className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-gray-100 transition-all group border-2 hover:border-indigo-100">
                            <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                                <div className={`h-24 w-24 rounded-3xl ${platform.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-12 w-12 ${platform.color}`} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-gray-900">{platform.name}</h3>
                                    {connected ? (
                                        <div className="flex items-center justify-center space-x-1.5 text-green-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">Connected</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Not Linked</p>
                                    )}
                                </div>

                                {connected ? (
                                    <Button variant="outline" className="w-full rounded-2xl h-14 border-gray-200 font-bold group-hover:bg-gray-50 transition-colors">
                                        Manage Settings
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleConnect(platform.id)}
                                        className="w-full rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span>Connect Account</span>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Pro Tips / Status Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-gray-50/50">
                    <CardContent className="p-8 space-y-4 text-center">
                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <Zap className="h-6 w-6 text-yellow-500" />
                        </div>
                        <h4 className="font-black text-gray-900">Auto-Renew Enabled</h4>
                        <p className="text-sm text-gray-500 font-medium">We'll automatically keep your tokens fresh so your posts are never missed.</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-gray-50/50 lg:col-span-2">
                    <CardContent className="p-8 flex items-center space-x-6">
                        <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-sm flex-shrink-0">
                            <AlertCircle className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900">Why connect?</h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                Connecting your profiles allows BrandForge to analyze your history for better content suggestions and gives you one-click publishing. No password sharing required.
                            </p>
                            <Button variant="link" className="p-0 h-auto text-indigo-600 font-bold mt-2 flex items-center">
                                <span>Learn more about security</span>
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
