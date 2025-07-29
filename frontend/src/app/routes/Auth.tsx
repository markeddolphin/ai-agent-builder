import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {  Mail, Lock, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const Auth : React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isCheckingConfirmation, setIsCheckingConfirmation] = useState(false);
  const { user, isAuthenticated, login, signup, resendConfirmationEmail, resetAll, isLoading, requiresEmailConfirmation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  // check if user is returning from email confirmation
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      toast.success('Email confirmed! You can now sign in.');
      setPendingEmail('');
    }
  }, [searchParams]);


  // check if user was redirected
  useEffect(() => {
    const emailConfirmation = searchParams.get('emailConfirmation');
    if (emailConfirmation === 'true' && user) {
      setPendingEmail(user.email);
      toast.error('Please confirm your email before accessing the dashboard.');
    }
  }, [searchParams, user]);

  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true' && email) {
      setIsCheckingConfirmation(true);
      const attemptAutoSignIn = async () => {
        try {
          await login(email, password);
          toast.success('Email confirmed and signed in successfully!');
          navigate('/dashboard');
        } catch (error) {
          setIsCheckingConfirmation(false);
          toast.info('Email confirmed! Please sign in with your credentials.');
        }
      };
      
      if (email && password) {
        attemptAutoSignIn();
      } else {
        setIsCheckingConfirmation(false);
        toast.success('Email confirmed! Please sign in with your credentials.');
      }
    }
  }, [searchParams, email, password, login, navigate]);

  useEffect(() => {
    if (isAuthenticated && user && user.emailConfirmed) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleAuth = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      if (isSignUp) {
        setPendingEmail(email);
        await signup(email, password);
        toast.success('Account created! Please check your email to confirm your account.');
      } else {
        await login(email, password);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      await resendConfirmationEmail(pendingEmail);
      toast.success('Confirmation email sent! Please check your inbox.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend email';
      toast.error(errorMessage);
    }
  };

  if (isCheckingConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ai-primary to-ai-secondary rounded-2xl flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent mb-4">
            AI Agent Builder
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ai-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying email confirmation...</p>
        </div>
      </div>
    );
  }

  if (requiresEmailConfirmation || pendingEmail) {
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ai-primary to-ai-secondary rounded-2xl flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent">
              AI Agent Builder
            </h1>
          </div>

          <Card className="shadow-ai">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Email Confirmation Required</CardTitle>
              <CardDescription>
                Please check your email and confirm your account before signing in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>We sent a confirmation email to:</p>
                <p className="font-medium text-foreground mt-1">{pendingEmail}</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Check your email inbox (and spam folder)</li>
                      <li>• Click the confirmation link in the email</li>
                      <li>• Return here to sign in with your account</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleResendConfirmation}
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Confirmation Email
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => {
                    setPendingEmail('');
                    setIsSignUp(false);
                    resetAll();
                  }}
                  variant="ghost" 
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ai-primary to-ai-secondary rounded-2xl flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent">
            AI Agent Builder
          </h1>
          <p className="text-muted-foreground mt-2">
            Create powerful AI workflows in minutes
          </p>
        </div>

        <Card className="shadow-ai">
          <CardHeader className="text-center">
            <CardTitle className="bg-gradient-to-r from-ai-primary to-ai-secondary bg-clip-text text-transparent">
              {!isSignUp ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Start building your first AI pipeline today'
                : 'Sign in to access your AI pipelines'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {isSignUp && <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>}
                
              

                <Button 
                type="submit" 
                variant="ai" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (!isSignUp ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {!isSignUp ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setPendingEmail('');
                    }}
                    variant="link"
                    className="ml-1 p-0 h-auto text-ai-primary"
                    disabled={isLoading}
                  >
                    {!isSignUp ? 'Sign up' : 'Sign in'}
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground mb-4">Trusted by AI enthusiasts worldwide</p>
          <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <span>📝</span> Summarize
            </div>
            <div className="flex items-center gap-1">
              <span>🌐</span> Translate
            </div>
            <div className="flex items-center gap-1">
              <span>✍️</span> Rewrite
            </div>
            <div className="flex items-center gap-1">
              <span>🔍</span> Extract
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;