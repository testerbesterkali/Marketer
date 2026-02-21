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
                console.log('AuthGuard: Starting one-time initialization...');

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

                    console.log('AuthGuard: Initialization complete.');
                } catch (err) {
                    console.error('AuthGuard: Initialization error:', err);
                    initializedRef.current = false; // Allow retry if it failed miserably
                }
            }

            // SKIP redirection logic if already on onboarding
            if (currentUser && location.pathname.startsWith('/onboarding')) {
                return;
            }

            if (currentUser && location.pathname.startsWith('/dashboard')) {
                const { currentWorkspace, workspaces } = useWorkspaceStore.getState();
                if (!currentWorkspace && workspaces.length === 0) {
                    // If after init we still have no workspace, go to onboarding
                    navigate('/onboarding/start');
                }
            } else if (!currentUser && !loading) {
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
