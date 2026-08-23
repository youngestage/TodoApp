import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import {
  AuthForm,
  HouseholdChoiceCard,
  CreateHouseholdForm,
  JoinHouseholdForm,
  ResetPasswordModal
} from './onboarding';

export const OnboardingView: React.FC = () => {
  const { session, setSession, fetchHouseholdData, setOnboardingCompleted, setCurrentView, logout } = useStore();

  const [authMode, setAuthMode] = useState<'auth' | 'household_choice' | 'signup_create' | 'signup_join' | 'forgot_password'>('auth');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('household_id').eq('id', session.user.id).maybeSingle().then(({ data: prof }) => {
        if (prof?.household_id) {
          fetchHouseholdData(prof.household_id).then(() => {
            setOnboardingCompleted(true);
            setCurrentView('dashboard');
          });
        } else if (authMode === 'auth') {
          setAuthMode('household_choice');
        }
      });
    }
  }, [session]);

  // Handle Sign In Submit
  const handleSignIn = async (email: string, pass: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSession(data.session);

        const { data: prof } = await supabase.from('profiles').select('household_id').eq('id', data.session.user.id).maybeSingle();
        if (prof?.household_id) {
          await fetchHouseholdData(prof.household_id);
          setOnboardingCompleted(true);
          setCurrentView('dashboard');
        } else {
          setAuthMode('household_choice');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (name: string, email: string, pass: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name } }
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else {
        if (data.session) {
          setSession(data.session);
        }
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name,
            role: 'partner_a'
          });
        }
        setAuthMode('household_choice');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Reset Link
  const handleForgotPasswordSubmit = async (resetEmail: string) => {
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

  // Handle Household Creation & Key Generation
  const handleCreateHousehold = async (householdName: string, name?: string, email?: string, pass?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let userId = session?.user?.id;

      if (!userId) {
        if (!email || !pass || !name) {
          setErrorMsg('Please provide your name, email, and password.');
          setLoading(false);
          return;
        }
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { name } }
        });
        if (signUpErr) throw new Error(signUpErr.message);
        if (signUpData.session) setSession(signUpData.session);
        userId = signUpData.user?.id;
      }

      if (!userId) throw new Error('Could not establish user session.');

      let freshCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      let hhData: any = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('households')
          .insert({
            name: householdName,
            invite_code: freshCode,
            created_by: userId
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

      localStorage.setItem('coupletodo_permanent_invite_code', freshCode);

      const { error: profErr } = await supabase.from('profiles').upsert({
        id: userId,
        name: name || session?.user?.email?.split('@')[0] || 'Partner A',
        household_id: hhData.id,
        role: 'partner_a'
      });

      if (profErr) throw new Error(profErr.message || 'Error saving profile.');

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
  const handleJoinHousehold = async (inviteCode: string, name?: string, email?: string, pass?: string) => {
    setLoading(true);
    setErrorMsg(null);

    const targetCode = inviteCode.toUpperCase().trim();

    try {
      const { data: hhData } = await supabase
        .from('households')
        .select('*')
        .ilike('invite_code', targetCode)
        .maybeSingle();

      if (!hhData) {
        throw new Error(`Household code "${targetCode}" not found. Please verify the 6-character key shared by your partner.`);
      }

      let userId = session?.user?.id;

      if (!userId) {
        if (!email || !pass || !name) {
          setErrorMsg('Please complete your details and enter the partner key.');
          setLoading(false);
          return;
        }
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { name } }
        });
        if (signUpErr) throw new Error(signUpErr.message);
        if (signUpData.session) setSession(signUpData.session);
        userId = signUpData.user?.id;
      }

      if (!userId) throw new Error('Could not establish user session.');

      const { error: profErr } = await supabase.from('profiles').upsert({
        id: userId,
        name: name || session?.user?.email?.split('@')[0] || 'Partner B',
        household_id: hhData.id,
        role: 'partner_b'
      });

      if (profErr) throw new Error(profErr.message || 'Error linking profile to household.');

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

  const handleSignOutUser = async () => {
    await logout();
    setAuthMode('auth');
    setActiveTab('signin');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="relative z-10 w-full max-w-xl space-y-6">
        
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <img src="/onboarding_hero.svg" alt="Couple Studio Hero" className="w-32 sm:w-40 h-32 sm:h-40 mx-auto object-contain drop-shadow-sm" />
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#231F1E] tracking-tight leading-tight">
            Harmonious household budgeting & joint tasks.
          </h1>
        </div>

        {/* Views Orchestration */}
        <AnimatePresence mode="wait">

          {/* 1. Auth Form (Sign In / Sign Up) */}
          {authMode === 'auth' && (
            <motion.div key="auth-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AuthForm
                activeTab={activeTab}
                onTabChange={(tab) => { setActiveTab(tab); setErrorMsg(null); }}
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                onForgotPassword={() => setAuthMode('forgot_password')}
                loading={loading}
                errorMsg={errorMsg}
              />
            </motion.div>
          )}

          {/* 2. Household Choice Cards (Create vs Join) */}
          {authMode === 'household_choice' && (
            <motion.div key="household-choice-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <HouseholdChoiceCard
                onSelectCreate={() => setAuthMode('signup_create')}
                onSelectJoin={() => setAuthMode('signup_join')}
                userEmail={session?.user?.email}
                onSignOut={handleSignOutUser}
                onBackToAuth={() => setAuthMode('auth')}
              />
            </motion.div>
          )}

          {/* 3. Create Household Form */}
          {authMode === 'signup_create' && (
            <motion.div key="create-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <CreateHouseholdForm
                onSubmit={handleCreateHousehold}
                onBack={() => setAuthMode(session?.user ? 'household_choice' : 'auth')}
                createdInviteCode={createdInviteCode}
                onCopyCode={handleCopyCode}
                codeCopied={codeCopied}
                onContinue={handleContinueToDashboard}
                isAuthenticated={!!session?.user}
                loading={loading}
                errorMsg={errorMsg}
              />
            </motion.div>
          )}

          {/* 4. Join Household Form */}
          {authMode === 'signup_join' && (
            <motion.div key="join-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <JoinHouseholdForm
                onSubmit={handleJoinHousehold}
                onBack={() => setAuthMode(session?.user ? 'household_choice' : 'auth')}
                isAuthenticated={!!session?.user}
                loading={loading}
                errorMsg={errorMsg}
              />
            </motion.div>
          )}

          {/* 5. Reset Password Modal */}
          {authMode === 'forgot_password' && (
            <motion.div key="forgot-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ResetPasswordModal
                onSubmit={handleForgotPasswordSubmit}
                onBack={() => setAuthMode('auth')}
                loading={loading}
                errorMsg={errorMsg}
                resetSent={resetSent}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
