import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserProfile, Wallet } from '../types';

interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  secretKey: string;
  password?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  wallets: Wallet[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  wallets: [],
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  updateProfile: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to fetch profile and wallets after auth
  const fetchUserData = async (userId: string, email?: string) => {
    try {
      // 1. Get Profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Self-healing: If profile is missing (e.g. DB reset), recreate it
      if (profileError && (profileError.code === 'PGRST116' || profileError.message.includes('JSON'))) {
          console.warn("Profile missing. Attempting to restore...");
          // Attempt to restore profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email || 'recovered@user.com',
                first_name: 'Recovered',
                last_name: 'User',
                username: email ? email.split('@')[0] : 'recovered',
                role: 'user'
            })
            .select()
            .single();

          if (!createError && newProfile) {
             profile = newProfile;
             // Also give wallets if missing - Set initial balance to 0
             const { error: walletError } = await supabase.from('wallets').insert({ user_id: userId, currency: 'USDT', balance: 0 });
             if (walletError && !walletError.message.includes('unique constraint')) {
                 console.warn("Wallet creation warning:", walletError);
             }
          }
      }

      if (profile) {
        setUser(profile as UserProfile);
      } else {
        // Only set user to null if we really couldn't get/create a profile, 
        // but we still have a session. This prevents UI flicker.
        if (profileError) console.error('Could not fetch or restore profile', profileError);
      }

      // 2. Get Wallets
      if (profile || userId) {
        const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId);

        if (walletError) {
            console.error('Error fetching wallets:', walletError);
        } else {
            setWallets(walletData as Wallet[]);
        }
      }

    } catch (error) {
      console.error('Unexpected error fetching user data:', error);
    }
  };

  // Check for existing session on mount and subscribe to changes
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email);
      } else {
        setUser(null);
        setWallets([]);
      }
      setIsLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
         if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await fetchUserData(session.user.id, session.user.email);
         }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setWallets([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!password) {
        throw new Error("Password is required for login.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        await fetchUserData(data.user.id, data.user.email);
      }
      
    } catch (error: any) {
      console.error("Login error:", error.message);
      alert(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      if (!data.password) throw new Error("Password is required");

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
            secret_key: data.secretKey.trim(),
            username: data.email.split('@')[0], 
          },
        },
      });

      // Handle Failures (Rate Limit, User Exists, etc)
      if (error) {
        // If "Rate Limit" or "User already registered" (sometimes generalized), try Auto-Login
        if (error.message.includes('rate limit') || error.message.includes('registered') || error.status === 429) {
           console.warn("Registration limit hit or user exists. Attempting Auto-Login...");
           
           const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
               email: data.email.trim(),
               password: data.password
           });

           if (!loginError && loginData.user) {
               // Login Successful - Sync Profile Data
               // Since they tried to register, they likely expect the name/details they typed to be saved.
               const { error: updateError } = await supabase.from('profiles').upsert({
                   id: loginData.user.id,
                   email: data.email.trim(),
                   first_name: data.firstName.trim(),
                   last_name: data.lastName.trim(),
                   username: data.email.split('@')[0],
                   secret_key: data.secretKey.trim(),
                   role: 'user', // Default
                   // preserve existing fields if we read them first, but upsert is simple here
               });
               
               if (updateError) console.error("Failed to sync profile after auto-login", updateError);

               await fetchUserData(loginData.user.id, loginData.user.email);
               alert("Account exists. You have been logged in successfully.");
               return; // Success
           } else {
               // Auto-login failed (likely wrong password)
               if (loginError?.message.includes('Invalid login credentials')) {
                    throw new Error("User already exists, but the password provided was incorrect.");
               }
           }
           
           // If we couldn't auto-login, throw friendly error
           throw new Error("Too many attempts or account exists. Please try Logging In.");
        }
        
        throw error;
      }

      if (authData.user) {
        alert("Registration successful! If you don't see the dashboard, try logging in.");
        await fetchUserData(authData.user.id, authData.user.email);
      }

    } catch (error: any) {
      console.error("Registration Error:", error.message);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id);

        if (error) throw error;

        // Optimistic update
        setUser({ ...user, ...data });
    } catch (error: any) {
        console.error("Update profile error:", error.message);
        alert("Failed to update profile.");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        wallets, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register,
        updateProfile,
        logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);