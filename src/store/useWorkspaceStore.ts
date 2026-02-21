import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface WorkspaceState {
    currentWorkspace: any | null;
    brandProfile: any | null;
    loading: boolean;
    setWorkspace: (workspace: any) => void;
    fetchWorkspace: (id: string) => Promise<void>;
    updateOnboardingStep: (id: string, step: number) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    currentWorkspace: null,
    brandProfile: null,
    loading: false,
    setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
    fetchWorkspace: async (id) => {
        set({ loading: true });
        const { data: workspace } = await supabase
            .from('workspaces')
            .select('*, brand_profiles(*)')
            .eq('id', id)
            .single();

        if (workspace) {
            set({
                currentWorkspace: workspace,
                brandProfile: workspace.brand_profiles,
                loading: false
            });
        } else {
            set({ loading: false });
        }
    },
    updateOnboardingStep: async (id, step) => {
        await supabase
            .from('workspaces')
            .update({ onboarding_step: step })
            .eq('id', id);

        set((state) => ({
            currentWorkspace: state.currentWorkspace ? { ...state.currentWorkspace, onboarding_step: step } : null
        }));
    },
}));
