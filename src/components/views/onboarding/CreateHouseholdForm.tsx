import React, { useState } from 'react';
import { Key, TickCircle, Copy } from 'iconsax-react';

interface CreateHouseholdFormProps {
  onSubmit: (householdName: string, name?: string, email?: string, pass?: string) => Promise<void>;
  onBack: () => void;
  createdInviteCode: string | null;
  onCopyCode: () => void;
  codeCopied: boolean;
  onContinue: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  errorMsg: string | null;
}

export const CreateHouseholdForm: React.FC<CreateHouseholdFormProps> = ({
  onSubmit,
  onBack,
  createdInviteCode,
  onCopyCode,
  codeCopied,
  onContinue,
  isAuthenticated,
  loading,
  errorMsg
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdName, setHouseholdName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(householdName, name, email, password);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border-0 shadow-none">
      <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
        <h3 className="font-bold text-xl text-[#231F1E]">Create Household Key</h3>
        <button
          type="button"
          onClick={onBack}
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
              onClick={onCopyCode}
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
            onClick={onContinue}
            className="w-full py-4 rounded-2xl bg-[#231F1E] hover:bg-black text-white font-bold text-sm transition-all border-0 cursor-pointer shadow-md flex items-center justify-center space-x-2"
          >
            <span>Enter My Household Workspace →</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#FFF5F0] text-xs text-[#EF713F] font-mono font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="space-y-3">
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
                    placeholder="you@example.com"
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
              </>
            )}

            <div>
              <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">Household Name</label>
              <input
                type="text"
                required
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="Our Home Space"
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
    </div>
  );
};
