import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AuthForm } from './features/auth/AuthForm';
import { Dashboard } from './features/dashboard/Dashboard';

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Check current login state immediately when app loads up
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // 2. Continually listen for real-time changes (Sign in, Sign out, Account registration)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-blue-500 border-zinc-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Router logic: Show dashboard if session exists, else show the Glassmorphic Auth card setup
  return (
    <>
      {session ? (
        <Dashboard />
      ) : (
        <div className="min-h-screen w-full bg-[#09090b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4">
          <AuthForm />
        </div>
      )}
    </>
  );
}

export default App;