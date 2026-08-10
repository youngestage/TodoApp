import React from 'react';
import { Home3, UserAdd } from 'iconsax-react';

interface WelcomeHeroProps {
  onSelectCreate: () => void;
  onSelectJoin: () => void;
  onSelectLogin: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onSelectCreate,
  onSelectJoin,
  onSelectLogin
}) => {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <h2 className="font-zodiak text-3xl sm:text-4xl font-extrabold text-[#231F1E] tracking-tight">
          Synchronize Your Household
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] max-w-sm mx-auto leading-relaxed">
          Manage joint tasks, shared budget settlement, and live partner communication in real-time.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onSelectCreate}
          className="w-full py-4 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-sm shadow-xl transition-transform hover:scale-[1.02] border-0 cursor-pointer flex items-center justify-center space-x-2"
        >
          <Home3 size={20} variant="Bold" />
          <span>Create New Household</span>
        </button>

        <button
          onClick={onSelectJoin}
          className="w-full py-4 rounded-2xl bg-[#FAF6EB] hover:bg-[#F5ECCF] text-[#231F1E] font-bold text-sm transition-transform hover:scale-[1.02] border-0 cursor-pointer flex items-center justify-center space-x-2"
        >
          <UserAdd size={20} variant="Bold" className="text-[#8964B3]" />
          <span>Join Partner's Household</span>
        </button>

        <button
          onClick={onSelectLogin}
          className="w-full py-3 text-xs text-[#6B6560] hover:text-[#231F1E] font-semibold border-0 bg-transparent cursor-pointer transition-colors"
        >
          Already registered? <span className="text-[#EF713F] underline">Sign in to your account</span>
        </button>
      </div>
    </div>
  );
};
