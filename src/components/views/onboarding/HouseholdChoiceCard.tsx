import React from 'react';
import { Card } from '../../ui/Card';
import { Home3, UserAdd, ArrowRight, Logout } from 'iconsax-react';

interface HouseholdChoiceCardProps {
  onSelectCreate: () => void;
  onSelectJoin: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
  onBackToAuth?: () => void;
}

export const HouseholdChoiceCard: React.FC<HouseholdChoiceCardProps> = ({
  onSelectCreate,
  onSelectJoin,
  userEmail,
  onSignOut,
  onBackToAuth
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create Household Choice */}
        <Card
          hoverable
          onClick={onSelectCreate}
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
          onClick={onSelectJoin}
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

      {/* Sign Out / Back Option */}
      <div className="pt-2 text-center">
        {userEmail ? (
          <button
            onClick={onSignOut}
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-white/90 text-[#6B6560] hover:text-[#EF713F] text-xs font-bold transition-all border-0 cursor-pointer shadow-xs flex items-center justify-center space-x-2"
          >
            <Logout size={16} variant="Linear" />
            <span>Signed in as <span className="text-[#231F1E]">{userEmail}</span> · Log Out</span>
          </button>
        ) : (
          <button
            onClick={onBackToAuth}
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-white/90 text-[#231F1E] text-xs font-bold transition-all border-0 cursor-pointer shadow-xs"
          >
            Already have an account? <span className="text-[#EF713F]">Log In to Household</span>
          </button>
        )}
      </div>
    </div>
  );
};
