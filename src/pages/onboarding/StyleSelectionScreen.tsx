import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STYLES = [
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, airy, and simple', color: 'bg-gray-100' },
    { id: 'bold-vibrant', name: 'Bold & Vibrant', description: 'Energetic and eye-catching', color: 'bg-pink-100' },
    { id: 'editorial', name: 'Editorial', description: 'Premium fashion-led layouts', color: 'bg-beige-100' },
    { id: 'corporate-clean', name: 'Corporate Clean', description: 'Professional and trustworthy', color: 'bg-blue-100' },
    { id: 'playful', name: 'Playful', description: 'Fun, rounded, and friendly', color: 'bg-yellow-100' },
    { id: 'dark-luxury', name: 'Dark Luxury', description: 'Sleek, moody, and upscale', color: 'bg-slate-900', textColor: 'text-white' },
    { id: 'warm-earthy', name: 'Warm Earthy', description: 'Natural and organic tones', color: 'bg-orange-100' },
    { id: 'neon-futuristic', name: 'Neon Futuristic', description: 'High-tech and glowing', color: 'bg-indigo-900', textColor: 'text-white' },
];

export const StyleSelectionScreen = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('id');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleStyle = (id: string) => {
        setSelectedStyles(prev => {
            if (prev.includes(id)) return prev.filter(s => s !== id);
            if (prev.length < 3) return [...prev, id];
            return prev;
        });
    };

    const handleNext = async () => {
        if (selectedStyles.length === 0) return;
        setLoading(true);

        const { error } = await supabase
            .from('style_preferences')
            .upsert({
                workspace_id: workspaceId,
                selected_styles: selectedStyles,
            });

        if (!error) {
            navigate(`/onboarding/plan?id=${workspaceId}`);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] pt-20 pb-40 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Choose your Visual Style
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Select up to 3 visual directions that best represent your brand.
                        Our AI will use these to generate your social media content.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STYLES.map((style) => {
                        const isSelected = selectedStyles.includes(style.id);
                        return (
                            <motion.button
                                key={style.id}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toggleStyle(style.id)}
                                className={cn(
                                    "relative aspect-[3/4] rounded-3xl overflow-hidden border-4 transition-all duration-300 text-left p-6 shadow-sm",
                                    isSelected ? "border-indigo-600 shadow-xl shadow-indigo-100" : "border-white hover:border-indigo-100"
                                )}
                            >
                                {/* Style Visual (using colored background as placeholder) */}
                                <div className={cn("absolute inset-0 z-0", style.color)} />

                                {/* Content */}
                                <div className={cn("relative z-10 h-full flex flex-col justify-end", style.textColor)}>
                                    <h3 className="text-xl font-bold mb-1">{style.name}</h3>
                                    <p className="text-xs opacity-80 font-medium">{style.description}</p>
                                </div>

                                {/* Selection Overlay */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 bg-indigo-600 rounded-full p-2 z-20 shadow-lg animate-in zoom-in duration-300">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Footer Navigation */}
                <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-50">
                    <div className="max-w-5xl w-full flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">
                                {selectedStyles.length} of 3 Selected
                            </span>
                            <p className="text-xs text-gray-400">Choose at least one style to continue.</p>
                        </div>

                        <Button
                            onClick={handleNext}
                            disabled={selectedStyles.length === 0 || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 px-10 rounded-2xl shadow-lg shadow-indigo-100 group transition-all"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Next: Define Content Plan</span>
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
