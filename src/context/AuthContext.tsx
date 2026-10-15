import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { storeService } from '../services/storeService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storeService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  // Helper to sync user profile with Supabase profiles table
  const syncProfileFromAuth = async (authUser: any): Promise<UserProfile> => {
    const defaultName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0] ||
      'Customer';
    const defaultPhone = authUser.user_metadata?.phone || '';
    const defaultRole: Role = (authUser.user_metadata?.role as Role) || 'customer';

    let profile: UserProfile = {
      id: authUser.id,
      email: authUser.email || '',
      fullName: defaultName,
      phone: defaultPhone,
      role: defaultRole,
      createdAt: authUser.created_at || new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (dbProfile && !error) {
          profile = {
            ...profile,
            fullName: dbProfile.full_name || profile.fullName,
            phone: dbProfile.phone || profile.phone,
            role: (dbProfile.role as Role) || profile.role,
          };
        } else {
          // Attempt upserting profile row
          await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: profile.fullName,
            phone: profile.phone || null,
            role: profile.role,
          });
        }
      } catch (err) {
        console.warn('Profile fetch note:', err);
      }
    }

    setUser(profile);
    storeService.setCurrentUser(profile);
    return profile;
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check existing active session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          syncProfileFromAuth(session.user).finally(() => {
            if (isMounted) setIsLoading(false);
          });
        } else {
          const cached = storeService.getCurrentUser();
          if (cached && cached.id !== 'usr-customer-01') {
            setUser(cached);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    // Subscribe to auth state changes (sign in, sign out, token refreshed)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await syncProfileFromAuth(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        storeService.setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real Supabase User Sign Up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      // Local fallback if Supabase not configured
      const localUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        fullName: fullName || email.split('@')[0],
        phone: phone || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      storeService.setCurrentUser(localUser);
      return { success: true, message: 'Account registered successfully!' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || '',
            role: 'customer',
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.session?.user) {
        await syncProfileFromAuth(data.session.user);
        setIsAuthModalOpen(false);
        return { success: true, message: 'Account registered and logged in successfully!' };
      }

      if (data.user) {
        // Confirmation email was dispatched by Supabase
        return {
          success: true,
          message:
            'Registration successful! Please check your email inbox to verify your account, or proceed to sign in.',
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'An unexpected error occurred during registration.',
      };
    }
  };

  // Real Supabase User Sign In
  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!supabase || !isSupabaseConfigured || !password) {
      // Fallback
      const localUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      storeService.setCurrentUser(localUser);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Email not confirmed')) {
          msg = 'Please confirm your email address by clicking the verification link sent to your inbox.';
        } else if (msg.includes('Invalid login credentials')) {
          msg = 'Invalid email or password. Please verify your credentials and try again.';
        }
        return { success: false, message: msg };
      }

      if (data.user) {
        await syncProfileFromAuth(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to sign in. Please try again.',
      };
    }
  };

  // Sign out
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    storeService.setCurrentUser(null);
    setUser(null);
  };

  // Testing switch role
  const switchRole = (newRole: Role) => {
    if (!user) {
      const tempUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: newRole === 'admin' ? 'admin@yehmart.pk' : 'customer@yehmart.pk',
        fullName: newRole === 'admin' ? 'Store Administrator' : 'Valued Customer',
        role: newRole,
        createdAt: new Date().toISOString(),
      };
      setUser(tempUser);
      storeService.setCurrentUser(tempUser);
      return;
    }
    const updated = { ...user, role: newRole };
    storeService.setCurrentUser(updated);
    setUser(updated);
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    storeService.setCurrentUser(updated);
    setUser(updated);

    if (supabase && user.id && !user.id.startsWith('usr-')) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.fullName,
            phone: updated.phone || null,
          })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Profile DB update error:', e);
      }
    }
  };

  const role = user?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        login,
        signUp,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
