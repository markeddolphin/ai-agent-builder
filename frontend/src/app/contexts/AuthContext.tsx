import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../services/authService';
import { authService } from '../services/authService';
import { supabase } from '../../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  checkEmailConfirmation: (email: string) => Promise<boolean>;
  resetAll: () => Promise<void>;
  isLoading: boolean;
  requiresEmailConfirmation: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);

  // check and restor user session
  const checkAndRestoreSession = async () => {
    try {
      // check supabase session directly
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // check if session is expired
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          if (refreshedSession) {
          } else {
            setUser(null);
            setIsLoading(false);
            setIsAuthenticated(true);
            return;
          }
        }
      } 
      // get current user
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      } catch (error) {
      setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    checkAndRestoreSession();

    // listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session && typeof session === 'object' && 'user' in session) {
          const sessionUser = (session as { user: any }).user;
          
          // check if email is confirmed
          const emailConfirmed = sessionUser.email_confirmed_at !== null;
          
          if (!emailConfirmed) {
            setUser(null);
            return;
          }
          
          const userData: User = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            name: sessionUser.email?.split('@')[0] || 'User',
            emailConfirmed,
          };
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRequiresEmailConfirmation(false);
        } else if (event === 'TOKEN_REFRESHED') {

          // check again after token refresh
          setTimeout(checkAndRestoreSession, 100);
        }
      }
    );

    // enhanced page visibility
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkAndRestoreSession, 500);
      }
    };

    const handleFocus = () => {
      setTimeout(checkAndRestoreSession, 500);
    };

    const handleBeforeUnload = () => {
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // add a debug effect to log user state changes
  useEffect(() => {
    const shouldBeAuthenticated = !!user && !!user.emailConfirmed;
    setIsAuthenticated(shouldBeAuthenticated);
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setRequiresEmailConfirmation(false);
    
    try {
      const response = await authService.signIn(email, password);
      
      if (response.requiresEmailConfirmation) {
        setRequiresEmailConfirmation(true);
        setUser(null);
        throw new Error(response.error || 'Email confirmation required');
      }
      
      if (response.error) throw new Error(response.error);
      
      setUser(response.user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    setRequiresEmailConfirmation(false);
    
    try {
      const response = await authService.signUp(email, password);
      
      if (response.requiresEmailConfirmation) {
        setRequiresEmailConfirmation(true);
        setUser(null);
        throw new Error(response.error || 'Email confirmation required');
      }
      
      if (response.error) throw new Error(response.error);
      
      setUser(response.user);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await authService.signOut();
      
      if (response.error) throw new Error(response.error);
      
      setUser(null);
      setRequiresEmailConfirmation(false);
    } catch (error) {
      setUser(null);
      setRequiresEmailConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const response = await authService.resendConfirmationEmail(email);
      if (response.error) throw new Error(response.error);
    } catch (error) {
      throw error;
    }
  };

  const checkEmailConfirmation = async (email: string): Promise<boolean> => {
    try {
      const response = await authService.checkEmailConfirmation(email);
      return response.confirmed || false;
    } catch (error) {
      return false;
    }
  };

  const resetAll = async () => {
    setUser(null);
    setIsLoading(false);
    setIsAuthenticated(false);
    setRequiresEmailConfirmation(false);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      resendConfirmationEmail,
      checkEmailConfirmation,
      resetAll,
      isLoading, 
      requiresEmailConfirmation,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};