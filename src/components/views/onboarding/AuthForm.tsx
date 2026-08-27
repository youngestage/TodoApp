import React, { useState } from 'react';
import { Sms, Lock, User as UserIcon, ArrowRight } from 'iconsax-react';

interface AuthFormProps {
  activeTab: 'signin' | 'signup';
  onTabChange: (tab: 'signin' | 'signup') => void;
  onSignIn: (email: string, pass: string) => Promise<void>;
  onSignUp: (name: string, email: string, pass: string) => Promise<void>;
  onForgotPassword: () => void;
  loading: boolean;
  errorMsg: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  activeTab,
  onTabChange,
  onSignIn,
  onSignUp,
  onForgotPassword,
  loading,
  errorMsg
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email, password);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp(name, email, password);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl space-y-5 border-0 shadow-xs">
      {/* Tab Switcher */}
      <div className="flex bg-[#F6F4EE] p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => onTabChange('signin')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border-0 cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-white text-[#231F1E] shadow-sm'
              : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => onTabChange('signup')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border-0 cursor-pointer ${
            activeTab === 'signup'
              ? 'bg-white text-[#EF713F] shadow-sm'
              : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
          }`}
        >
          Sign Up
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* SIGN IN FORM */}
      {activeTab === 'signin' && (
        <form onSubmit={handleSignInSubmit} className="space-y-4">
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
                  onClick={onForgotPassword}
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
                <span>Log In to Household</span>
                <ArrowRight size={18} variant="Linear" />
              </>
            )}
          </button>
        </form>
      )}

      {/* SIGN UP FORM */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Your Name</label>
              <div className="relative flex items-center">
                <UserIcon size={18} variant="Linear" className="absolute left-3.5 text-[#6B6560]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name..."
                  className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Sms size={18} variant="Linear" className="absolute left-3.5 text-[#6B6560]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters..."
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account & Setup Space</span>
                <ArrowRight size={18} variant="Linear" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
