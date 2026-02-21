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
        try {
            const profilePromise = supabase
                .from('users_profile')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout fetching profile")), 10000)
            );

            const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

            if (!error) {
                set({ profile: data });
            }
        } catch (err) {
            console.error('AuthStore: fetchProfile error:', err);
        }
    },
    deductCredits: (amount: number) => {
        const { profile } = useAuthStore.getState();
        if (profile) {
            set({
                profile: {
                    ...profile,
                    credits_remaining: (profile.credits_remaining || 0) - amount
                }
            });
        }
    },
}));
