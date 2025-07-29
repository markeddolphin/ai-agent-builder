import { supabase } from '../../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  emailConfirmed?: boolean;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

class AuthService {
  async signUp(email: string, password: string): Promise<AuthResponse> {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
          }
        });
        

        if (error) throw error;
        
        if (data.user) {
          // check if email confirmation is required
          const emailConfirmed = !!data.user.email_confirmed_at;
          
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.email?.split('@')[0] || 'User',
            emailConfirmed,
          };
          
          // create user
          try {
            const response = await fetch(`http://localhost:${import.meta.env.VITE_PORT || 3001}/api/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: data.user.id,
                email: data.user.email || '',
                name: data.user.email?.split('@')[0] || 'User',
                emailConfirmed,
              }),
            });
            
            if (response.status === 202) {
              return { 
                user: null, 
                requiresEmailConfirmation: true,
                error: 'Please check your email and confirm your account before signing in.'
              };
            }
          } catch (dbError) {
            throw dbError;
          }
          
          if (!emailConfirmed) {
            return { 
              user: null, 
              requiresEmailConfirmation: true,
              error: 'Please check your email and confirm your account before signing in.'
            };
          }
          
          return { user };
        }
        return { user: null };
      } catch (error) {
        return { 
          user: null, 
          error: error instanceof Error ? error.message : 'Signup failed' 
        };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          const emailConfirmed = !!data.user.email_confirmed_at;
          
          if (!emailConfirmed) {
            return { 
              user: null, 
              requiresEmailConfirmation: true,
              error: 'Please confirm your email before signing in.'
            };
          }
          
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.email?.split('@')[0] || 'User',
            emailConfirmed,
          };
          
          try {
            const response = await fetch(`http://localhost:${import.meta.env.VITE_PORT || 3001}/api/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: data.user.id,
                email: data.user.email || '',
                name: data.user.email?.split('@')[0] || 'User',
                emailConfirmed,
              }),
            });
            
            if (response.status === 202) {
              return { 
                user: null, 
                requiresEmailConfirmation: true,
                error: 'Please confirm your email before signing in.'
              };
            }
            
            if (!response.ok) {
              const errorData = await response.json();
              
              if (errorData.error === 'Email already registered with a different account') {
                console.warn('Email already registered, continuing with authentication');
              }
            } else {
            }
          } catch (dbError) {
            console.error('Failed to ensure user in database:', dbError);
          }
          
          return { user };
        }
        return { user: null };
      } catch (error) {
        return { 
          user: null, 
          error: error instanceof Error ? error.message : 'Sign in failed' 
        };
    }
  }

  async signOut(): Promise<AuthResponse> {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { user: null };
      } catch (error) {
        return { 
          user: null, 
          error: error instanceof Error ? error.message : 'Sign out failed' 
        };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return null;
      }
      
      if (!session) {
        return null;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        return null;
      }
      
        if (user) {
          const emailConfirmed = user.email_confirmed_at !== null;
          
          if (!emailConfirmed) {
            return null;
          }
          
        const userData = {
            id: user.id,
            email: user.email || '',
            name: user.email?.split('@')[0] || 'User',
            emailConfirmed,
          };
        return userData;
        }
        return null;
      } catch (error) {
        return null;
    }
  }

  async resendConfirmationEmail(email: string): Promise<AuthResponse> {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        
        if (error) throw error;
        
        return { 
          user: null,
          error: 'Confirmation email sent. Please check your inbox.'
        };
      } catch (error) {
        return { 
          user: null, 
          error: error instanceof Error ? error.message : 'Failed to resend confirmation email' 
      };
    }
  }

  async checkEmailConfirmation(email: string): Promise<{ confirmed: boolean; error?: string }> {
    try {
      const response = await fetch(`http://localhost:${import.meta.env.VITE_PORT || 3001}/api/users/check-email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { confirmed: false };
        }
        const errorData = await response.json();
        return { confirmed: false, error: errorData.error || 'Failed to check email confirmation' };
      }

      const data = await response.json();
      
      return { confirmed: data.confirmed || false };
    } catch (error) {
      return { confirmed: false, error: error instanceof Error ? error.message : 'Failed to check email confirmation' };
    }
  }

  async createConfirmedUser(userId: string, email: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`http://localhost:${import.meta.env.VITE_PORT || 3001}/api/users/confirmed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          email,
          name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create confirmed user');
      }

      const userData = await response.json();
      
      return { user: userData };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Failed to create confirmed user' 
      };
    }
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
      return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService(); 