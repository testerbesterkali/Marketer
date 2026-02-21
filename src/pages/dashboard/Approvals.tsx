import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    XCircle,
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    Check,
    RefreshCcw,
    Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PostEditor } from './PostEditor';

const PLATFORM_ICONS: Record<string, any> = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook,
};

export const Approvals = () => {
    const { currentWorkspace } = useWorkspaceStore();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [filter, setFilter] = useState('all');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const fetchPosts = async () => {
        if (!currentWorkspace) return;
        setLoading(true);
        const { data } = await supabase
            .from('posts')
            .select('*, topics(*)')
            .eq('workspace_id', currentWorkspace.id)
            .in('status', ['draft', 'generating', 'failed'])
            .order('created_at', { ascending: false });

        if (data) setPosts(data);
        setLoading(false);
    };

    useEffect(() => {
        if (!currentWorkspace) return;
        fetchPosts();

        // Subscribe to changes in the posts table for live status updates
        const channel = supabase
            .channel(`posts-changes-${currentWorkspace.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'posts',
                    filter: `workspace_id=eq.${currentWorkspace.id}`,
                },
                (payload: any) => {
                    console.log('Realtime update received:', payload);
                    fetchPosts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentWorkspace]);

    const toggleSelect = (id: string) => {
        setSelectedPosts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleBulkApprove = async () => {
        if (selectedPosts.length === 0) return;
        const { error } = await supabase
            .from('posts')
            .update({ status: 'approved' })
            .in('id', selectedPosts);

        if (!error) {
            toast.success(`Approved ${selectedPosts.length} posts!`);
            setSelectedPosts([]);
            fetchPosts();
        }
    };

    const filteredPosts = posts.filter(post =>
        filter === 'all' || post.platform === filter
    );

    if (loading && posts.length === 0) return (
        <div className="flex-1 flex items-center justify-center">
            <RefreshCcw className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Content Approvals</h1>
                    <p className="text-gray-500 font-medium italic">Review and approve your AI-generated posts for the upcoming week.</p>
                </div>

                <div className="flex items-center space-x-3">
                    {selectedPosts.length > 0 && (
                        <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-sm font-bold text-gray-400 mr-2">{selectedPosts.length} Selected</span>
                            <Button
                                variant="outline"
                                className="rounded-xl border-red-100 text-red-600 hover:bg-red-50"
                                onClick={() => setSelectedPosts([])}
                                aria-label="Cancel selection"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                                onClick={handleBulkApprove}
                                aria-label={`Approve ${selectedPosts.length} selected posts`}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve All
                            </Button>
                        </div>
                    )}

                    <div className="h-10 w-px bg-gray-100 mx-2" />

                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['all', 'instagram', 'linkedin', 'twitter'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setFilter(p)}
                                aria-label={`Filter by ${p}`}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                    filter === p ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
                <Card className="rounded-[2.5rem] border-dashed border-2 border-gray-100 py-24 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No posts pending approval</h3>
                    <p className="text-gray-400 mt-2">Try generating more content or adjusting your filters.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => {
                        const Icon = PLATFORM_ICONS[post.platform] || Instagram;
                        const isSelected = selectedPosts.includes(post.id);

                        return (
                            <Card
                                key={post.id}
                                className={cn(
                                    "rounded-[2.5rem] border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden",
                                    isSelected && "ring-2 ring-indigo-600 border-transparent shadow-indigo-100"
                                )}
                            >
                                <div
                                    className="aspect-square bg-gray-100 relative cursor-pointer"
                                    onClick={() => {
                                        setSelectedPostId(post.id);
                                        setIsEditorOpen(true);
                                    }}
                                >
                                    <img
                                        src={post.image_url}
                                        alt={`${post.platform} ${post.post_type} post preview`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Selection Overlay */}
                                    <div
                                        className="absolute top-6 left-6 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelect(post.id);
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "h-8 w-8 rounded-xl flex items-center justify-center border-2 transition-all",
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200"
                                                    : "bg-white/80 backdrop-blur-md border-white/50 hover:scale-110"
                                            )}
                                            aria-label={isSelected ? "Unselect post" : "Select post"}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            {isSelected && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                    </div>

                                    <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-gray-900 border-none font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-tighter">
                                        {post.post_type}
                                    </Badge>
                                </div>

                                <CardContent className="p-8 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                <Icon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{post.platform}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase text-indigo-600 border-indigo-100 bg-indigo-50/50">
                                            {post.status}
                                        </Badge>
                                    </div>

                                    <p className="text-sm font-medium text-gray-700 line-clamp-2 leading-relaxed italic">
                                        {post.caption || "No caption generated yet..."}
                                    </p>

                                    <div className="pt-4 flex items-center space-x-2">
                                        <Button
                                            className="flex-1 rounded-xl h-11 bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                            onClick={() => {
                                                setSelectedPostId(post.id);
                                                setIsEditorOpen(true);
                                            }}
                                            aria-label="Edit and approve post"
                                        >
                                            Edit & Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-11 w-11 rounded-xl border-gray-100 p-0 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50"
                                            aria-label="Delete post"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Editor Modal */}
            <PostEditor
                postId={selectedPostId}
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    fetchPosts(); // Refresh list on close
                }}
            />
        </div>
    );
};
