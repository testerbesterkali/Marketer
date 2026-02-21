import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
    user: User | null;
    profile: any | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setProfile: (profile: any | null) => void;
    signOut: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    loading: true,
    setUser: (user) => set({ user, loading: false }),
    setProfile: (profile) => set({ profile }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },
    fetchProfile: async (userId) => {
        const { data, error } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error) {
            set({ profile: data });
        }
    },
}));
