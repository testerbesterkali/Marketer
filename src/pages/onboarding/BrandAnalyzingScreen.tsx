import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Search, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const steps = [
    { id: 'scraping', label: 'Exploring your website', icon: Globe },
    { id: 'analyzing', label: 'Analyzing brand identity', icon: Search },
    { id: 'competitors', label: 'Checking competitors', icon: Zap },
    { id: 'finishing', label: 'Finalizing brand kit', icon: CheckCircle2 },
];

export const BrandAnalyzingScreen = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('id');
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!workspaceId) return;

        // 1. Check if already analyzed (Resume/Refresh)
        const checkExisting = async () => {
            console.log('Checking if brand profile already exists for:', workspaceId);
            const { data } = await supabase
                .from('brand_profiles')
                .select('id')
                .eq('workspace_id', workspaceId)
                .maybeSingle();

            if (data) {
                console.log('Brand profile found! Skipping to review.');
                navigate(`/onboarding/review?id=${workspaceId}`);
                return true;
            }
            return false;
        };

        // 2. Trigger Edge Function
        const triggerAnalysis = async () => {
            const isDone = await checkExisting();
            if (isDone) return;

            console.log('Triggering new analysis Edge Function...');
            const { error } = await supabase.functions.invoke('analyze-brand', {
                body: { workspace_id: workspaceId },
            });

            if (error) {
                console.error('Analysis error:', error);
                toast({
                    title: 'Analysis Error',
                    description: 'The AI extraction failed. Please try refreshing.',
                    variant: 'destructive',
                });
            }
        };

        triggerAnalysis();

        // 3. Subscribe to Realtime for progress updates
        const channel = supabase
            .channel(`workspace:${workspaceId}`)
            .on('broadcast', { event: 'progress' }, (payload) => {
                const { step } = payload.payload;
                const stepIndex = steps.findIndex(s => s.id === step);
                if (stepIndex !== -1) {
                    setCurrentStep(stepIndex);
                }

                if (step === 'completed') {
                    navigate(`/onboarding/review?id=${workspaceId}`);
                }
            })
            .subscribe();

        // Simulated progress for demo/safety (remove or refine for production)
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) return prev + 1;
                return prev;
            });
        }, 8000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [workspaceId, navigate, toast]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

            <div className="max-w-2xl w-full px-6 relative z-10 text-center space-y-12">
                {/* Animated Icon Ring */}
                <div className="relative h-48 w-48 mx-auto">
                    <motion.div
                        className="absolute inset-0 border-4 border-indigo-100 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-0 border-t-4 border-indigo-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-4 bg-indigo-50 rounded-full flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {React.createElement(steps[currentStep].icon, {
                                key: steps[currentStep].id,
                                className: "h-12 w-12 text-indigo-600",
                                initial: { scale: 0.5, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                exit: { scale: 1.5, opacity: 0 }
                            } as any)}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Magically building your brand...
                    </h2>
                    <p className="text-lg text-gray-500 max-w-md mx-auto">
                        BrandForge is exploring your website to understand your unique value proposition.
                    </p>
                </div>

                {/* Progress List */}
                <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6 text-left max-w-md mx-auto">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep;

                        return (
                            <div key={step.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-500",
                                        isCompleted ? "bg-green-100" : isActive ? "bg-indigo-100" : "bg-gray-100"
                                    )}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : isActive ? (
                                            <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                                        ) : (
                                            <div className="h-1 w-1 bg-gray-400 rounded-full" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-semibold transition-colors duration-500",
                                        isCompleted ? "text-gray-900" : isActive ? "text-indigo-600" : "text-gray-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                                {isCompleted && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full"
                                    >
                                        Done
                                    </motion.span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="pt-8">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                        </span>
                        <span>AI Analyzing Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
