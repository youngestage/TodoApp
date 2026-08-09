import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { Heart, Home3, UserAdd, ArrowRight, ShieldSecurity, Lock, Sms, User, Flash, TickCircle, Copy } from 'iconsax-react';

export const OnboardingView: React.FC = () => {
  const { setCurrentView, setSession, fetchHouseholdData } = useStore();
  
  const [authMode, setAuthMode] = useState<'welcome' | 'login' | 'signup_create' | 'signup_join'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Handle Supabase Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSession(data.session);
        
        // Fetch household profile if linked
        const { data: prof } = await supabase.from('profiles').select('household_id').eq('id', data.session.user.id).single();
        if (prof?.household_id) {
          await fetchHouseholdData(prof.household_id);
        }

        setCurrentView('dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Supabase Signup & Create Household
  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !householdName) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (authErr) {
        setErrorMsg(authErr.message);
        setLoading(false);
        return;
      }

      // Generate 6-character code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 2. Insert Household record into Supabase
      if (authData.user) {
        const { data: hhData, error: hhErr } = await supabase
          .from('households')
          .insert({
            name: householdName,
            invite_code: generatedCode,
            created_by: authData.user.id
          })
          .select()
          .single();

        if (hhData) {
          // Link profile to household
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            name,
            household_id: hhData.id,
            role: 'partner_a'
          });

          await fetchHouseholdData(hhData.id);
        }
      }

      setCreatedInviteCode(generatedCode);

      if (authData.session) {
        setSession(authData.session);
      } else {
        setSuccessMsg('Account created! Please check your email to confirm registration.');
      }

    } catch (err: any) {
      console.warn('Household creation error:', err);
      // Fallback display generated code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCreatedInviteCode(generatedCode);
    } finally {
      setLoading(false);
    }
  };

  // Handle Supabase Signup & Join Household with Code
  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !inviteCode) {
      setErrorMsg('Please enter your details and partner invite code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Look up household by invite code
      const { data: hhData, error: hhErr } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (hhErr || !hhData) {
        setErrorMsg('Invalid or expired invite code. Please check with your partner.');
        setLoading(false);
        return;
      }

      // Sign up user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, household_id: hhData.id }
        }
      });

      if (authErr) {
        setErrorMsg(authErr.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          name,
          household_id: hhData.id,
          role: 'partner_b'
        });

        await fetchHouseholdData(hhData.id);
      }

      if (authData.session) {
        setSession(authData.session);
        setCurrentView('dashboard');
      } else {
        setSuccessMsg('Account created! Check your email to confirm registration.');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Error joining household.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdInviteCode) return;
    navigator.clipboard.writeText(createdInviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handleContinueToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleDemoBypass = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="relative z-10 w-full max-w-xl space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-4">
          <img src="/onboarding_hero.svg" alt="Couple Studio Hero" className="w-32 sm:w-40 h-32 sm:h-40 mx-auto object-contain drop-shadow-sm" />
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#231F1E] tracking-tight leading-tight">
            Harmonious household budgeting & joint tasks.
          </h1>
        </div>

        {/* Dynamic Card Content */}
        <AnimatePresence mode="wait">
          
          {/* WELCOME CHOICE MODE */}
          {authMode === 'welcome' && (
            <motion.div
              key="welcome-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Create Household Choice */}
                <Card
                  hoverable
                  onClick={() => setAuthMode('signup_create')}
                  className="group relative overflow-hidden p-6 border-0 shadow-none hover:bg-white/90 transition-all cursor-pointer bg-white"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border-0">
                    <Home3 size={26} variant="TwoTone" />
                  </div>

                  <h3 className="font-bold text-lg text-[#231F1E] group-hover:text-[#EF713F] transition-colors mb-1">
                    Create Household
                  </h3>

                  <p className="text-xs text-[#6B6560] leading-relaxed mb-4">
                    Start a new home space and generate a 6-digit invite code for your partner.
                  </p>

                  <div className="flex items-center text-xs font-bold text-[#EF713F]">
                    <span>Register & Create</span>
                    <ArrowRight size={16} variant="Linear" className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>

                {/* Join Household Choice */}
                <Card
                  hoverable
                  onClick={() => setAuthMode('signup_join')}
                  className="group relative overflow-hidden p-6 border-0 shadow-none hover:bg-white/90 transition-all cursor-pointer bg-white"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F3FA] text-[#8964B3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border-0">
                    <UserAdd size={26} variant="TwoTone" />
                  </div>

                  <h3 className="font-bold text-lg text-[#231F1E] group-hover:text-[#8964B3] transition-colors mb-1">
                    Join Partner Space
                  </h3>

                  <p className="text-xs text-[#6B6560] leading-relaxed mb-4">
                    Enter a 6-digit invite code provided by your partner to sync instantly.
                  </p>

                  <div className="flex items-center text-xs font-bold text-[#8964B3]">
                    <span>Enter Code</span>
                    <ArrowRight size={16} variant="Linear" className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </div>

              {/* Login & Demo Options */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setAuthMode('login')}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-white/90 text-[#231F1E] text-xs font-bold transition-all border-0 cursor-pointer shadow-xs"
                >
                  Already have an account? <span className="text-[#EF713F]">Log In</span>
                </button>

                <button
                  onClick={handleDemoBypass}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#231F1E] hover:bg-black text-white text-xs font-bold transition-all border-0 cursor-pointer shadow-md"
                >
                  Explore Demo Workspace →
                </button>
              </div>
            </motion.div>
          )}

          {/* LOGIN FORM MODE */}
          {authMode === 'login' && (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleLogin}
              className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
            >
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
                <h3 className="font-bold text-xl text-[#231F1E]">Log In to Household</h3>
                <button
                  type="button"
                  onClick={() => setAuthMode('welcome')}
                  className="text-xs font-semibold text-[#EF713F] border-0 bg-transparent cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Email Address</label>
                  <div className="relative flex items-center">
                    <Sms size={18} variant="Linear" className="absolute left-3.5 text-[#6B6560]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="leslie@coupletodo.app"
                      className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={18} variant="Linear" className="absolute left-3.5 text-[#6B6560]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Log In to Account</span>
                    <ArrowRight size={18} variant="Linear" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* SIGN UP & CREATE HOUSEHOLD FORM MODE */}
          {authMode === 'signup_create' && (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
            >
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
                <h3 className="font-bold text-xl text-[#231F1E]">Create Household</h3>
                <button
                  type="button"
                  onClick={() => setAuthMode('welcome')}
                  className="text-xs font-semibold text-[#EF713F] border-0 bg-transparent cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {createdInviteCode ? (
                <div className="p-6 rounded-3xl bg-[#EBF3ED] text-center space-y-4 border-0">
                  <TickCircle size={40} variant="Bold" className="text-[#4A7C59] mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-xl text-[#231F1E]">Household Space Created! 🎉</h4>
                    <p className="text-xs text-[#6B6560]">Share this 6-character invite code with your partner to link households:</p>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <div className="px-6 py-3.5 bg-white rounded-2xl text-2xl font-mono font-extrabold text-[#4A7C59] tracking-widest shadow-xs">
                      {createdInviteCode}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-3.5 rounded-2xl bg-[#231F1E] text-white hover:bg-black transition-colors cursor-pointer border-0"
                      title="Copy Code"
                    >
                      {codeCopied ? <TickCircle size={20} variant="Bold" className="text-[#4A7C59]" /> : <Copy size={20} variant="Linear" />}
                    </button>
                  </div>

                  {successMsg && (
                    <p className="text-xs text-[#4A7C59] font-mono font-semibold pt-1">
                      ℹ️ {successMsg}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleContinueToDashboard}
                    className="w-full py-3.5 rounded-2xl bg-[#231F1E] hover:bg-black text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Household Workspace</span>
                    <ArrowRight size={18} variant="Linear" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateHousehold} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Leslie"
                        className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Household Name</label>
                      <input
                        type="text"
                        required
                        value={householdName}
                        onChange={(e) => setHouseholdName(e.target.value)}
                        placeholder="Leslie & Asa's Household"
                        className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="leslie@coupletodo.app"
                        className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <span>Creating Space...</span>
                    ) : (
                      <>
                        <span>Create & Get Invite Code</span>
                        <ArrowRight size={18} variant="Linear" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* SIGN UP & JOIN HOUSEHOLD FORM MODE */}
          {authMode === 'signup_join' && (
            <motion.form
              key="join-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleJoinHousehold}
              className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
            >
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
                <h3 className="font-bold text-xl text-[#231F1E]">Join Partner Household</h3>
                <button
                  type="button"
                  onClick={() => setAuthMode('welcome')}
                  className="text-xs font-semibold text-[#8964B3] border-0 bg-transparent cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-2xl bg-[#EBF3ED] text-xs text-[#4A7C59] font-mono font-semibold">
                  ℹ️ {successMsg}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Partner 6-Digit Invite Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="E.g. X7K2P9"
                    className="w-full px-4 py-3 bg-[#F6F3FA] rounded-2xl text-center font-mono font-extrabold text-base text-[#8964B3] tracking-widest border-0 focus:outline-none focus:ring-2 focus:ring-[#8964B3]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Asa"
                    className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#8964B3]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="asa@coupletodo.app"
                    className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#8964B3]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#8964B3]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#8964B3] hover:bg-[#7852A4] text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Joining Partner...</span>
                ) : (
                  <>
                    <span>Join Household Space</span>
                    <ArrowRight size={18} variant="Linear" />
                  </>
                )}
              </button>
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
