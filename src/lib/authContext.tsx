'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, UserData } from '@/lib/authService';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user?: UserData; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ user?: UserData; error?: string }>;
  signOut: () => void;
  updateUser: (data: Partial<UserData>) => Promise<{ user?: UserData; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, you would check for stored token and validate it
        // For now, we'll just try to get the current user
        const { user: currentUser } = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn({ email, password });
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const result = await authService.signUp({ name, email, password });
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signOut = () => {
    setUser(null);
    authService.signOut(); // Call the signOut function from authService to remove token
  };

  const updateUser = async (data: Partial<UserData>) => {
    const result = await authService.updateProfile(data);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};