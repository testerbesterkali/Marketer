import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user, loading, setUser, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const initializedRef = React.useRef(false);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser && !initializedRef.current) {
                initializedRef.current = true;

                try {
                    // 1. Failsafe for missing profile
                    const profilePromise = supabase
                        .from('users_profile')
                        .select('id')
                        .eq('id', currentUser.id)
                        .maybeSingle();

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Profile check timeout")), 15000)
                    );

                    const { data: profile, error: pError } = await Promise.race([profilePromise, timeoutPromise]) as any;

                    if (pError) throw pError;

                    if (!profile) {
                        console.log('AuthGuard: Creating missing profile...');
                        await supabase.from('users_profile').insert({
                            id: currentUser.id,
                            full_name: currentUser.user_metadata?.full_name || 'User',
                        });
                    }

                    // 2. Load essential data
                    await Promise.all([
                        fetchProfile(currentUser.id),
                        useWorkspaceStore.getState().fetchWorkspaces(currentUser.id)
                    ]);

                    // 3. Routing Check (AFTER data is loaded)
                    if (location.pathname.startsWith('/dashboard')) {
                        const { currentWorkspace, workspaces } = useWorkspaceStore.getState();
                        if (!currentWorkspace && workspaces.length === 0) {
                            console.log('AuthGuard: No workspaces found, redirecting to onboarding.');
                            navigate('/onboarding/start');
                        }
                    }
                } catch (err) {
                    console.error('AuthGuard: Initialization error:', err);
                    initializedRef.current = false; // Allow retry if it failed miserably
                }
            }

            // Route protection for non-logged in users
            if (!currentUser && !loading) {
                navigate('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, fetchProfile, navigate]); // Removed location to prevent listener spam

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
};
