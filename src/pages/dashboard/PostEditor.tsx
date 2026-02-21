import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Sparkles,
    RefreshCcw,
    Trash2,
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface PostEditorProps {
    postId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (post: any) => void;
}

const PLATFORM_ICONS: Record<string, any> = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook,
};

export const PostEditor = ({ postId, isOpen, onClose }: PostEditorProps) => {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [caption, setCaption] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [scheduledSuccess, setScheduledSuccess] = useState(false);

    useEffect(() => {
        if (!postId || !isOpen) return;

        const fetchPost = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('posts')
                .select('*, topics(*)')
                .eq('id', postId)
                .single();

            if (data) {
                setPost(data);
                setCaption(data.caption || '');
            }
            setLoading(false);
        };

        fetchPost();
    }, [postId, isOpen]);

    const handleSave = async () => {
        if (!post) return;
        setSaving(true);
        const { error } = await supabase
            .from('posts')
            .update({ caption, status: 'approved' })
            .eq('id', post.id);

        if (!error) {
            toast.success('Post changes saved!');
            onClose();
        }
        setSaving(false);
    };

    const handleSchedule = async () => {
        if (!post || !scheduledTime) {
            toast.error('Please select a time to schedule');
            return;
        }
        setSaving(true);
        const { error } = await supabase
            .from('posts')
            .update({
                status: 'scheduled',
                scheduled_at: new Date(scheduledTime).toISOString()
            })
            .eq('id', post.id);

        if (!error) {
            setScheduledSuccess(true);
            toast.success('Post scheduled successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            toast.error('Failed to schedule post');
        }
        setSaving(false);
    };

    const handleRegenerate = async () => {
        if (!post) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-post', {
                body: { post_id: post.id }
            });

            if (!error && data.success) {
                // Refresh post data
                const { data: updatedPost } = await supabase
                    .from('posts')
                    .select('*, topics(*)')
                    .eq('id', post.id)
                    .single();

                if (updatedPost) {
                    setPost(updatedPost);
                    setCaption(updatedPost.caption || '');
                }
                toast.success('Content regenerated!');
            }
        } catch (err) {
            console.error('Regeneration failed:', err);
            toast.error('Failed to regenerate content');
        }
        setLoading(false);
    };

    const PlatformIcon = post ? PLATFORM_ICONS[post.platform] || Instagram : Instagram;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white pt-10 px-8">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <PlatformIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Post</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {post?.platform} • {post?.post_type || 'Post'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <RefreshCcw className="h-8 w-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Topic Info */}
                                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                                    <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Origin Topic</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{post?.topics?.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
                                        "{post?.topics?.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {/* Visual Preview */}
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Post Visual</Label>
                                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 group">
                                            <img
                                                src={post?.image_url}
                                                alt="Generated visual"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    onClick={handleRegenerate}
                                                    className="bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl space-x-2"
                                                >
                                                    <RefreshCcw className="h-4 w-4" />
                                                    <span>Regenerate Image</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Caption Editor */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Caption & Hashtags</Label>
                                            <button
                                                onClick={handleRegenerate}
                                                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors flex items-center space-x-1"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                <span>AI Rewrite</span>
                                            </button>
                                        </div>
                                        <Textarea
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="Write something engaging..."
                                            className="min-h-[200px] border-gray-100 bg-gray-50/50 focus:bg-white rounded-2xl p-4 font-medium leading-relaxed text-gray-700"
                                        />
                                    </div>

                                    {/* Scheduling Section */}
                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Schedule Publishing</Label>
                                            <Badge className="bg-green-50 text-green-700 border-none font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">AI Optimized</Badge>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                                                <input
                                                    type="datetime-local"
                                                    value={scheduledTime}
                                                    onChange={(e) => setScheduledTime(e.target.value)}
                                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                                />
                                            </div>

                                            <Button
                                                onClick={handleSchedule}
                                                disabled={!scheduledTime || saving || scheduledSuccess}
                                                className={cn(
                                                    "w-full h-14 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2",
                                                    scheduledSuccess
                                                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-100"
                                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                                                )}
                                            >
                                                {scheduledSuccess ? (
                                                    <><CheckCircle2 className="h-5 w-5" /><span>Scheduled!</span></>
                                                ) : (
                                                    <><Clock className="h-5 w-5" /><span>Schedule Post</span></>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                            </Button>
                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-100"
                                >
                                    {saving ? 'Saving...' : 'Approve & Save'}
                                    <CheckCircle2 className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <p className={cn("text-xs font-bold text-gray-400 uppercase tracking-widest", className)}>
        {children}
    </p>
);

import { Badge } from '@/components/ui/badge';

export const Clock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
