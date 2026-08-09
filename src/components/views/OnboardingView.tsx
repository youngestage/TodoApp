import React from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Heart, Home3, UserAdd, ArrowRight, ShieldSecurity } from 'iconsax-react';

export const OnboardingView: React.FC = () => {
  const { setCurrentView } = useStore();

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-xl space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF6EB] text-[#CF9130] text-xs font-medium border-0">
            <Heart size={14} variant="Bold" className="text-[#EF713F]" />
            <span>Welcome to Couples Studio</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#231F1E] tracking-tight leading-tight">
            Harmonious household budgeting & joint tasks.
          </h1>

          <p className="text-[#6B6560] text-sm sm:text-base max-w-md mx-auto">
            Organize shared expenses, divide responsibilities with joint completion mechanics, and chat in context.
          </p>
        </div>

        {/* Option Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <Card
            hoverable
            onClick={() => setCurrentView('invite')}
            className="group relative overflow-hidden p-6 border-0 shadow-none hover:bg-white/80 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-0">
              <Home3 size={26} variant="TwoTone" />
            </div>

            <h3 className="font-zodiak font-bold text-lg text-[#231F1E] group-hover:text-[#EF713F] transition-colors mb-1">
              Create Household
            </h3>

            <p className="text-xs text-[#6B6560] leading-relaxed mb-4">
              Start a new shared home space and generate an invite link for your partner.
            </p>

            <div className="flex items-center text-xs font-medium text-[#EF713F]">
              <span>Get started</span>
              <ArrowRight size={16} variant="Linear" className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => setCurrentView('invite')}
            className="group relative overflow-hidden p-6 border-0 shadow-none hover:bg-white/80 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F6F3FA] text-[#8964B3] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border-0">
              <UserAdd size={26} variant="TwoTone" />
            </div>

            <h3 className="font-zodiak font-bold text-lg text-[#231F1E] group-hover:text-[#8964B3] transition-colors mb-1">
              Join with Code
            </h3>

            <p className="text-xs text-[#6B6560] leading-relaxed mb-4">
              Enter an invite code provided by your partner to sync immediately.
            </p>

            <div className="flex items-center text-xs font-medium text-[#8964B3]">
              <span>Enter code</span>
              <ArrowRight size={16} variant="Linear" className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-[#6B6560] pt-2">
          <ShieldSecurity size={16} variant="Bold" className="text-[#4A7C59]" />
          <span>Max capacity: 2 partners per household • Private & End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};
