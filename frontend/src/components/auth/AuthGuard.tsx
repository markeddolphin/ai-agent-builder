import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallbackPath = '/auth' 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/auth' && location.pathname !== '/') {
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ai-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (user && user.emailConfirmed) {
    return <>{children}</>;
  }

  if (user && !user.emailConfirmed) {
    toast.error('Please confirm your email before accessing the dashboard.');
    return <Navigate to="/auth?emailConfirmation=true" replace />;
  }

  return <Navigate to={fallbackPath} replace />;
};

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ai-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && user.emailConfirmed) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && !user.emailConfirmed) {
    return <>{children}</>;
  }

  return <>{children}</>;
}; 