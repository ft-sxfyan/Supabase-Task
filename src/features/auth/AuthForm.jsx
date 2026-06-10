import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Email/Password submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
      else console.log('Logged in successfully!');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) setErrorMsg(error.message);
      else alert('Signup successful! Check your email for confirmation.');
    }
    setLoading(false);
  };

  // Google OAuth Login
const handleGoogleLogin = async (e) => {
    e.preventDefault();
    
    // Yeh strictly check karega ke site live hai ya local aur wahi URL redirect me pass karega
    const currentUrl = "https://supabase-task.vercel.app/";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: currentUrl, 
        },
    });
    
    if (error) console.error(error.message);
};

  // Facebook OAuth Login
  const handleFacebookLogin = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl text-center relative overflow-hidden">
      
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
          {errorMsg}
        </div>
      )}

      {isLogin ? (
        <div className="flex flex-col">
          <h2 className="text-3xl font-light tracking-wide text-white text-left mb-6">Welcome back</h2>
          
          <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40 transition-all text-sm"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40 transition-all text-sm"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 mt-2 rounded-full font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-sm tracking-wide shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Signin'}
            </button>
          </form>

          {/* Social Icons section with working triggers */}
          <div className="mt-6">
            <div className="relative flex py-2 items-center justify-center">
              <div className="w-12 border-t border-white/10"></div>
              <span className="mx-3 text-xs text-gray-500 font-light">or connect with</span>
              <div className="w-12 border-t border-white/10"></div>
            </div>
            
            <div className="flex justify-center gap-4 my-4">
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 12-4.52z" fill="#EA4335"/>
                </svg>
              </button>
              
              <button 
                type="button" 
                onClick={handleFacebookLogin}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-400 font-light">
              Don't have an account?{' '}
              <span onClick={() => { setIsLogin(false); setErrorMsg(''); }} className="text-white font-normal hover:underline cursor-pointer ml-1">
                Signup
              </span>
            </p>
          </div>
        </div>
      ) : (
        /* Signup UI view stays identical */
        <div className="flex flex-col">
          <h2 className="text-3xl font-light tracking-wide text-white text-left mb-6">Create Account</h2>
          <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40 transition-all text-sm"
            />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40 transition-all text-sm"
            />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40 transition-all text-sm"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 mt-2 rounded-full font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-sm tracking-wide shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Signup'}
            </button>
          </form>
          <p className="text-xs text-gray-400 font-light mt-6">
            Already have an account?{' '}
            <span onClick={() => { setIsLogin(true); setErrorMsg(''); }} className="text-white font-normal hover:underline cursor-pointer ml-1">
              Signin
            </span>
          </p>
        </div>
      )}
    </div>
  );
};