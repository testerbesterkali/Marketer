import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Sparkles, Wand2, Calendar, Target, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const steps = [
    { id: 'strategy', label: 'Processing content strategy', icon: Target },
    { id: 'topics', label: 'Generating viral topic ideas', icon: Sparkles },
    { id: 'scheduling', label: 'Drafting your first calendar', icon: Calendar },
    { id: 'finishing', label: 'Finalizing your workspace', icon: Wand2 },
];

export const TopicGenerationScreen = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('id');
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!workspaceId) return;

        const triggerGeneration = async () => {
            const { error } = await supabase.functions.invoke('generate-topics', {
                body: { workspace_id: workspaceId },
            });

            if (error) {
                console.error('Generation error:', error);
            }
        };

        triggerGeneration();

        const channel = supabase
            .channel(`workspace_topics:${workspaceId}`)
            .on('broadcast', { event: 'progress' }, (payload) => {
                const { step } = payload.payload;
                const stepIndex = steps.findIndex(s => s.id === step);
                if (stepIndex !== -1) setCurrentStep(stepIndex);

                if (step === 'completed') {
                    navigate('/dashboard');
                }
            })
            .subscribe();

        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) return prev + 1;
                return prev;
            });
        }, 6000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [workspaceId, navigate]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="max-w-2xl w-full px-6 relative z-10 text-center space-y-12">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-24 w-24 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center mx-auto"
                >
                    <Loader2 className="h-12 w-12 text-white animate-spin" />
                </motion.div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">
                        Forging your content plan...
                    </h2>
                    <p className="text-xl text-indigo-100 max-w-md mx-auto">
                        Our AI is generating a personalized 2-week content calendar tailored to your brand voice.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-6 text-left max-w-md mx-auto">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep;

                        return (
                            <div key={step.id} className="flex items-center space-x-4">
                                <div className={cn(
                                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-500",
                                    isCompleted ? "bg-green-400" : isActive ? "bg-white scale-110" : "bg-white/10"
                                )}>
                                    {isCompleted ? (
                                        <Check className="h-5 w-5 text-white" />
                                    ) : isActive ? (
                                        <step.icon className="h-5 w-5 text-indigo-600" />
                                    ) : (
                                        <step.icon className="h-5 w-5 text-white/40" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-lg font-bold transition-all duration-500",
                                    isCompleted ? "text-white/60" : isActive ? "text-white" : "text-white/30"
                                )}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="dot"
                                        className="h-1.5 w-1.5 bg-white rounded-full animate-bounce"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
