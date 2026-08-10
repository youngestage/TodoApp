import React, { useState } from 'react';
import { Sms, Lock, ArrowRight } from 'iconsax-react';

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => Promise<void>;
  onBack: () => void;
  onForgotPassword: () => void;
  loading: boolean;
  errorMsg: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onBack,
  onForgotPassword,
  loading,
  errorMsg
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
    >
      <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
        <h3 className="font-bold text-xl text-[#231F1E]">Log In to Household</h3>
        <button
          type="button"
          onClick={onBack}
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
            <span>Log In to Account</span>
            <ArrowRight size={18} variant="Linear" />
          </>
        )}
      </button>
    </form>
  );
};
