import React, { useState } from 'react';
import { Sms, Refresh, TickCircle } from 'iconsax-react';

interface ResetPasswordModalProps {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  errorMsg: string | null;
  resetSent: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  onSubmit,
  onBack,
  loading,
  errorMsg,
  resetSent
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
    >
      <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
        <h3 className="font-bold text-xl text-[#231F1E]">Reset Password</h3>
        <button
          type="button"
          onClick={onBack}
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
            onClick={onBack}
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
    </form>
  );
};
