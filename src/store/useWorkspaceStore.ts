import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

interface WorkspaceState {
    currentWorkspace: any | null;
    workspaces: any[];
    brandProfile: any | null;
    loading: boolean;
    setWorkspace: (workspace: any) => void;
    setBrandProfile: (profile: any) => void;
    fetchWorkspaces: (userId?: string) => Promise<void>;
    fetchWorkspace: (id: string) => Promise<void>;
    updateOnboardingStep: (id: string, step: number) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
    currentWorkspace: null,
    workspaces: [],
    brandProfile: null,
    loading: false,
    setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
    setBrandProfile: (profile) => set({ brandProfile: profile }),

    fetchWorkspaces: async (userId?: string) => {
        let id = userId;
        if (!id) {
            const { user } = useAuthStore.getState();
            id = user?.id;
        }
        if (!id) return;

        console.log('WorkspaceStore: Fetching all brands for user:', id);

        const fetchPromise = supabase
            .from('workspaces')
            .select('*')
            .eq('owner_id', id)
            .order('created_at', { ascending: false });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout fetching workspaces")), 15000)
        );

        try {
            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (error) {
                console.error('WorkspaceStore: Fetch workspaces error:', error);
                return;
            }

            set({ workspaces: data || [] });

            // If no workspace is selected, pick the most completed one
            if (!get().currentWorkspace && data && data.length > 0) {
                const sorted = [...data].sort((a, b) => (b.onboarding_step || 0) - (a.onboarding_step || 0));
                get().fetchWorkspace(sorted[0].id);
            }
        } catch (err) {
            console.error('WorkspaceStore: fetchWorkspaces error:', err);
        }
    },

    fetchWorkspace: async (id) => {
        set({ loading: true });
        console.log('WorkspaceStore: Fetching details for workspace:', id);

        try {
            // 1. Fetch Workspace
            const wsPromise = supabase
                .from('workspaces')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout fetching workspace details")), 15000)
            );

            const { data: workspace, error: wsError } = await Promise.race([wsPromise, timeoutPromise]) as any;

            if (wsError) {
                console.error('WorkspaceStore: Workspace fetch error:', wsError);
                set({ loading: false });
                return;
            }

            if (workspace) {
                // 2. Fetch Brand Profile
                const { data: profile } = await supabase
                    .from('brand_profiles')
                    .select('*')
                    .eq('workspace_id', id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                set({
                    currentWorkspace: workspace,
                    brandProfile: profile || null,
                    loading: false
                });
                console.log('WorkspaceStore: Workspace established:', workspace.name);
            } else {
                set({ loading: false });
            }
        } catch (err) {
            console.error('WorkspaceStore: fetchWorkspace error:', err);
            set({ loading: false });
        }
    },

    updateOnboardingStep: async (id, step) => {
        await supabase
            .from('workspaces')
            .update({ onboarding_step: step })
            .eq('id', id);

        set((state) => ({
            currentWorkspace: state.currentWorkspace ? { ...state.currentWorkspace, onboarding_step: step } : null,
            workspaces: state.workspaces.map(w => w.id === id ? { ...w, onboarding_step: step } : w)
        }));
    },
}));
