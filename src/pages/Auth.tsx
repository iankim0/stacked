import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/auth-form';
import { supabase } from '@/integrations/supabase/client'; 
import { User } from '@supabase/supabase-js';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Stacked</h1>
          <p className="text-muted-foreground">Your workout tracking companion</p>
        </div>
        
        <AuthForm mode={mode} onToggleMode={toggleMode} />
      </div>
    </div>
  );
}
