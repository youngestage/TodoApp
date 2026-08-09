import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Copy, TickCircle, Heart, People, ArrowLeft, ArrowRight } from 'iconsax-react';

export const InviteView: React.FC = () => {
  const { household, setCurrentView, currentUser } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-lg space-y-6">
        
        <button
          onClick={() => setCurrentView('onboarding')}
          className="inline-flex items-center space-x-1.5 text-xs text-[#6B6560] hover:text-[#231F1E] font-medium transition-colors"
        >
          <ArrowLeft size={16} variant="Linear" />
          <span>Back to options</span>
        </button>

        <Card className="p-8 space-y-6 text-center border-0 shadow-none relative overflow-hidden">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF6EB] border-0 mx-auto flex items-center justify-center">
              <Heart size={26} variant="Bold" className="text-[#EF713F]" />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-[#231F1E]">
              {household.name}
            </h2>
            <p className="text-xs text-[#6B6560]">
              Share this code with your partner to pair your household budget & tasks.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F5F3EF] border-0 text-xs font-mono text-[#6B6560]">
            <People size={14} variant="Bold" className="text-[#8964B3]" />
            <span>Max household capacity: {household.maxMembers} partners</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-[#6B6560] uppercase tracking-wider font-mono">
              Unique Household Pairing Code
            </label>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FBF9F5] border-0">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-[#231F1E] pl-2">
                {household.inviteCode}
              </span>

              <button
                onClick={handleCopyCode}
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border-0 transition-all ${
                  copied
                    ? 'bg-[#4A7C59] text-white'
                    : 'bg-[#EF713F] hover:bg-[#D95220] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <TickCircle size={16} variant="Bold" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} variant="Linear" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F3FA] border-0 space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <Avatar name={currentUser.name} src={currentUser.avatarUrl} isOnline size="md" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4A7C59] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
              </div>

              <div className="flex items-center space-x-1 text-[#8964B3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8964B3] animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8964B3] animate-ping delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8964B3] animate-ping delay-300" />
              </div>

              <div className="w-9 h-9 rounded-full border-0 flex items-center justify-center bg-white text-[#8964B3]">
                <People size={16} variant="Linear" className="opacity-60" />
              </div>
            </div>

            <p className="text-xs text-[#8964B3] font-medium animate-pulse">
              Waiting for your partner to join...
            </p>
          </div>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full py-3 px-4 rounded-xl bg-[#231F1E] hover:bg-black text-white text-sm font-medium flex items-center justify-center space-x-2 border-0 transition-all"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight size={16} variant="Linear" />
          </button>
        </Card>
      </div>
    </div>
  );
};
