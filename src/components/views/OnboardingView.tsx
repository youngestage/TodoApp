import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { Heart, Home3, UserAdd, ArrowRight, ShieldSecurity, Lock, Sms, User, Flash, TickCircle, Copy, Key, Refresh } from 'iconsax-react';

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
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
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
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Generate 6-character uppercase key (e.g. X7K2P9)
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // 1. Try Supabase Auth
      const { data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (authData?.user) {
        // Insert into Supabase households table
        const { data: hhData } = await supabase
          .from('households')
          .insert({
            name: householdName,
            invite_code: generatedCode,
            created_by: authData.user.id
          })
          .select()
          .single();

        if (hhData) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            name,
            household_id: hhData.id,
            role: 'partner_a'
          });
        }
      }

      // Save key in localStorage registry as fail-safe
      const keysMap = JSON.parse(localStorage.getItem('coupletodo_pairing_keys') || '{}');
      keysMap[generatedCode] = {
        name: householdName,
        partnerA: name,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('coupletodo_pairing_keys', JSON.stringify(keysMap));

      setCreatedInviteCode(generatedCode);

    } catch (err: any) {
      console.warn('Supabase household insert fallback:', err);
      // Fail-safe fallback key generation
      const keysMap = JSON.parse(localStorage.getItem('coupletodo_pairing_keys') || '{}');
      keysMap[generatedCode] = {
        name: householdName,
        partnerA: name,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('coupletodo_pairing_keys', JSON.stringify(keysMap));

      setCreatedInviteCode(generatedCode);
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
      let matchedHouseholdName = 'Our Household';
      let matchedPartnerA = 'Partner A';

      // 1. Check Supabase households table
      const { data: hhData } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', targetCode)
        .single();

      if (hhData) {
        matchedHouseholdName = hhData.name;
      } else {
        // 2. Check localStorage pairing registry fallback
        const keysMap = JSON.parse(localStorage.getItem('coupletodo_pairing_keys') || '{}');
        const foundLocal = keysMap[targetCode];

        if (foundLocal) {
          matchedHouseholdName = foundLocal.name;
          matchedPartnerA = foundLocal.partnerA || 'Partner A';
        } else {
          setErrorMsg(`Key "${targetCode}" not found. Please check with your partner and try again.`);
          setLoading(false);
          return;
        }
      }

      // Try Supabase auth
      const { data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (authData?.user && hhData) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          name,
          household_id: hhData.id,
          role: 'partner_b'
        });
      }

      // Update store to 2 Members paired!
      useStore.setState((state) => ({
        currentUser: {
          id: authData?.user?.id || 'usr_partner_b',
          name: name || 'Partner B',
          avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=' + (name || 'Partner B'),
          isOnline: true,
          role: 'partner_b'
        },
        partnerUser: {
          id: 'usr_partner_a',
          name: matchedPartnerA,
          avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=' + matchedPartnerA,
          isOnline: true,
          role: 'partner_a'
        },
        household: {
          id: hhData?.id || `hh-${targetCode}`,
          name: matchedHouseholdName,
          inviteCode: targetCode,
          maxMembers: 2,
          members: [
            {
              id: 'usr_partner_a',
              name: matchedPartnerA,
              avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=' + matchedPartnerA,
              isOnline: true,
              role: 'partner_a'
            },
            {
              id: authData?.user?.id || 'usr_partner_b',
              name: name || 'Partner B',
              avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=' + (name || 'Partner B'),
              isOnline: true,
              role: 'partner_b'
            }
          ],
          settleBalance: {
            debtor: name || 'Partner B',
            creditor: matchedPartnerA,
            amount: 0,
            currency: '₦'
          }
        }
      }));

      setOnboardingCompleted(true);
      setCurrentView('dashboard');

    } catch (err: any) {
      setErrorMsg(err.message || 'Error pairing with key.');
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
    useStore.setState((state) => ({
      currentUser: {
        id: state.currentUser.id || 'usr_partner_a',
        name: name || 'Partner A',
        avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=' + (name || 'Partner A'),
        isOnline: true,
        role: 'partner_a'
      },
      household: {
        ...state.household,
        name: householdName || 'My Household',
        inviteCode: createdInviteCode || 'X7K2P9',
        members: [{
          id: state.currentUser.id || 'usr_partner_a',
          name: name || 'Partner A',
          avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=' + (name || 'Partner A'),
          isOnline: true,
          role: 'partner_a'
        }]
      }
    }));

    setOnboardingCompleted(true);
    setCurrentView('dashboard');
  };

  const handleDemoBypass = () => {
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
                  Explore Workspace →
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
                      placeholder="you@coupletodo.app"
                      className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot_password')}
                      className="text-xs font-semibold text-[#EF713F] hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
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

          {/* FORGOT PASSWORD FORM MODE (EMAIL RESET LINK ONLY) */}
          {authMode === 'forgot_password' && (
            <motion.form
              key="forgot-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleForgotPassword}
              className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
            >
              <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
                <h3 className="font-bold text-xl text-[#231F1E]">Reset Password</h3>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs font-semibold text-[#EF713F] border-0 bg-transparent cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>

              {resetSent ? (
                <div className="p-6 rounded-3xl bg-[#EBF3ED] text-center space-y-3 border-0">
                  <TickCircle size={40} variant="Bold" className="text-[#4A7C59] mx-auto" />
                  <h4 className="font-bold text-lg text-[#231F1E]">Reset Link Dispatched! ✉️</h4>
                  <p className="text-xs text-[#6B6560] leading-relaxed">
                    We sent a password reset link to <span className="font-bold text-[#231F1E]">{email}</span>. Click the link inside your email inbox to set a new password!
                  </p>

                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-full mt-2 py-3 rounded-2xl bg-[#231F1E] hover:bg-black text-white font-bold text-xs transition-all border-0 cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs text-[#6B6560]">
                      Enter your account email address and we'll send a password reset link directly to your inbox.
                    </p>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Registered Email</label>
                      <div className="relative flex items-center">
                        <Sms size={18} variant="Linear" className="absolute left-3.5 text-[#6B6560]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@coupletodo.app"
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
                      <span>Sending Link...</span>
                    ) : (
                      <>
                        <Refresh size={18} variant="Linear" />
                        <span>Send Password Reset Link to Email</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.form>
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
