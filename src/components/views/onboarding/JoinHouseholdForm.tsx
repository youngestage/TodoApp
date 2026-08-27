import React, { useState } from 'react';
import { Key } from 'iconsax-react';

interface JoinHouseholdFormProps {
  onSubmit: (inviteCode: string, name?: string, email?: string, pass?: string) => Promise<void>;
  onBack: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  errorMsg: string | null;
}

export const JoinHouseholdForm: React.FC<JoinHouseholdFormProps> = ({
  onSubmit,
  onBack,
  isAuthenticated,
  loading,
  errorMsg
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inviteCode, name, email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none"
    >
      <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
        <h3 className="font-bold text-xl text-[#231F1E]">Join Household with Key</h3>
        <button
          type="button"
          onClick={onBack}
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

        {!isAuthenticated && (
          <>
            <div>
              <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
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
                placeholder="you@example.com"
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
          </>
        )}
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
    </form>
  );
};
