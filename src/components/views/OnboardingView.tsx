import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { ensureAuthSession } from '../../services';
import { WelcomeHero, LoginForm, ResetPasswordModal } from './onboarding';
import { Home3, UserAdd, ArrowRight, Lock, Sms, TickCircle, Copy, Key, Refresh } from 'iconsax-react';

export const OnboardingView: React.FC = () => {
  const { setCurrentView, setSession, fetchHouseholdData, setOnboardingCompleted } = useStore();
  
  const [authMode, setAuthMode] = useState<'welcome' | 'login' | 'signup_create' | 'signup_join' | 'forgot_password'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Handle Supabase Login
  const handleLoginSubmit = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    if (!userEmail || !userPass) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPass
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

        setOnboardingCompleted(true);
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Reset Email Link
  const handleForgotPasswordSubmit = async (resetEmail: string) => {
    setEmail(resetEmail);
    if (!resetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Real Household Creation & Key Generation
  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !householdName) {
      setErrorMsg('Please fill in all fields to create your household space.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Guarantee authenticated session
      const { user } = await ensureAuthSession(email, password, name);

      // 2. Insert Household record with a fresh unique invite code
      let freshCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      let hhData: any = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('households')
          .insert({
            name: householdName,
            invite_code: freshCode,
            created_by: user.id
          })
          .select()
          .single();

        if (data) {
          hhData = data;
          break;
        }

        if (error && error.code === '23505') {
          freshCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        } else if (error) {
          throw new Error(error.message || 'Error creating household.');
        }
      }

      if (!hhData) throw new Error('Failed to create household space. Please try again.');

      // Save fresh code for this user
      localStorage.setItem('coupletodo_permanent_invite_code', freshCode);

      // 3. Upsert profile with household_id
      const { error: profErr } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        household_id: hhData.id,
        role: 'partner_a'
      });

      if (profErr) throw new Error(profErr.message || 'Error saving profile.');

      // 4. Fetch updated household state from DB
      await fetchHouseholdData(hhData.id);

      setCreatedInviteCode(freshCode);

    } catch (err: any) {
      console.error('Household creation error:', err);
      setErrorMsg(err.message || 'Error creating household.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Partner Joining with 6-Digit Key
  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !inviteCode) {
      setErrorMsg('Please enter your details and partner 6-digit key.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const targetCode = inviteCode.toUpperCase().trim();

    try {
      // 1. Look up household in Supabase by invite code
      const { data: hhData } = await supabase
        .from('households')
        .select('*')
        .ilike('invite_code', targetCode)
        .maybeSingle();

      if (!hhData) {
        throw new Error(`Household code "${targetCode}" not found. Please verify the 6-character key shared by your partner.`);
      }

      // 2. Guarantee authenticated session for Partner B
      const { user } = await ensureAuthSession(email, password, name);

      // 3. Link Partner B profile to Partner A's household ID as partner_b
      const { error: profErr } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        household_id: hhData.id,
        role: 'partner_b'
      });

      if (profErr) throw new Error(profErr.message || 'Error linking profile to household.');

      // 4. Fetch synced household data (both Partner A and Partner B profiles)
      await fetchHouseholdData(hhData.id);

      setOnboardingCompleted(true);
      setCurrentView('dashboard');

    } catch (err: any) {
      console.error('Join household error:', err);
      setErrorMsg(err.message || 'Error joining household with key.');
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

  const handleContinueToDashboard = async () => {
    const hhId = useStore.getState().household.id;
    if (hhId && !hhId.startsWith('hh_')) {
      await fetchHouseholdData(hhId);
    }
    setOnboardingCompleted(true);
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
                    Start a new home space and generate a 6-digit key for your partner.
                  </p>

                  <div className="flex items-center text-xs font-bold text-[#EF713F]">
                    <span>Generate Key & Start</span>
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
                    Enter a 6-digit key provided by your partner to sync instantly.
                  </p>

                  <div className="flex items-center text-xs font-bold text-[#8964B3]">
                    <span>Enter Key</span>
                    <ArrowRight size={16} variant="Linear" className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </div>

              {/* Login Option Only */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setAuthMode('login')}
                  className="w-full py-3.5 rounded-2xl bg-white hover:bg-white/90 text-[#231F1E] text-xs font-bold transition-all border-0 cursor-pointer shadow-xs"
                >
                  Already have an account? <span className="text-[#EF713F]">Log In to Household</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* LOGIN FORM MODE */}
          {authMode === 'login' && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LoginForm
                onSubmit={handleLoginSubmit}
                onBack={() => setAuthMode('welcome')}
                onForgotPassword={() => setAuthMode('forgot_password')}
                loading={loading}
                errorMsg={errorMsg}
              />
            </motion.div>
          )}

          {/* FORGOT PASSWORD FORM MODE */}
          {authMode === 'forgot_password' && (
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ResetPasswordModal
                onSubmit={handleForgotPasswordSubmit}
                onBack={() => setAuthMode('login')}
                loading={loading}
                errorMsg={errorMsg}
                resetSent={resetSent}
              />
            </motion.div>
          )}

          {/* KEY GENERATION SCREEN / HOUSEHOLD CREATION */}
          {authMode === 'signup_create' && (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
            >
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
                <h3 className="font-bold text-xl text-[#231F1E]">Create Household Key</h3>
                <button
                  type="button"
                  onClick={() => setAuthMode('welcome')}
                  className="text-xs font-semibold text-[#EF713F] border-0 bg-transparent cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {createdInviteCode ? (
                <div className="p-6 rounded-3xl bg-[#EBF3ED] text-center space-y-5 border-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#4A7C59] text-white flex items-center justify-center mx-auto shadow-sm">
                    <Key size={28} variant="Bold" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-2xl text-[#231F1E]">YOUR HOUSEHOLD KEY</h4>
                    <p className="text-xs text-[#6B6560]">Share this 6-character key with your partner to pair your workspace:</p>
                  </div>

                  <div className="flex items-center justify-center space-x-3">
                    <div className="px-6 py-4 bg-white rounded-2xl text-3xl font-mono font-extrabold text-[#4A7C59] tracking-widest shadow-xs">
                      {createdInviteCode}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-4 rounded-2xl bg-[#231F1E] text-white hover:bg-black transition-colors cursor-pointer border-0"
                      title="Copy Key"
                    >
                      {codeCopied ? <TickCircle size={24} variant="Bold" className="text-[#4A7C59]" /> : <Copy size={24} variant="Linear" />}
                    </button>
                  </div>

                  <div className="p-3 bg-white/80 rounded-2xl text-xs font-mono text-[#6B6560]">
                    Status: <span className="font-bold text-[#CF9130]">1/2 Members (Waiting for partner)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueToDashboard}
                    className="w-full py-4 rounded-2xl bg-[#231F1E] hover:bg-black text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
                  >
                    <span>Enter My Household Workspace →</span>
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
                        placeholder="Leslie's Space"
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
                      <span>Generating Key...</span>
                    ) : (
                      <>
                        <Key size={18} variant="Bold" />
                        <span>Generate Household 6-Digit Key</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* SIGN UP & JOIN HOUSEHOLD WITH KEY */}
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
                <h3 className="font-bold text-xl text-[#231F1E]">Join Household with Key</h3>
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

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Partner 6-Digit Key</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="E.g. X7K2P9"
                    className="w-full px-4 py-3 bg-[#F6F3FA] rounded-2xl text-center font-mono font-extrabold text-lg text-[#8964B3] tracking-widest border-0 focus:outline-none focus:ring-2 focus:ring-[#8964B3]/30"
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
                  <span>Syncing Household...</span>
                ) : (
                  <>
                    <Key size={18} variant="Bold" />
                    <span>Join & Pair Household Space</span>
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
