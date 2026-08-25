import React from 'react';
import { useStore } from '../../store/useStore';
import { Home, TaskSquare, WalletMoney, MessageText, Setting2, UserAdd, Heart, MagicStar } from 'iconsax-react';
import { ViewMode } from '../../types';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, household, partnerUser, setQuickActionOpen } = useStore();

  const isPartnerConnected = (household.members?.length || 0) >= 2 || (partnerUser && partnerUser.id !== 'usr_partner_waiting');

  const navItems: { id: ViewMode; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: Home },
    { id: 'tasks', label: 'Joint Tasks', icon: TaskSquare },
    { id: 'budget', label: 'Finances', icon: WalletMoney },
    { id: 'chat', label: 'Contextual Chat', icon: MessageText },
    { id: 'settings', label: 'App Settings', icon: Setting2 },
  ];

  if (currentView === 'onboarding') return null;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#FBF9F5] border-0 min-h-[calc(100vh-61px)] p-6 space-y-8 select-none">
      {/* Household Status Pill */}
      <div className="p-4 rounded-2xl bg-white border-0 shadow-none space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#EF713F] via-[#E9C277] to-[#BEABD8] p-0.5 shadow-none">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Heart size={16} variant="Bold" className="text-[#EF713F]" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#231F1E] truncate max-w-[140px]">{household.name}</h3>
            <p className="text-[11px] text-[#6B6560]">
              {isPartnerConnected ? '2/2 Members Active' : '1/2 Members (Invite Partner)'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('invite')}
          className="w-full py-1.5 px-3 rounded-xl bg-[#FAF6EB] hover:bg-[#F5ECCF] text-[#CF9130] border-0 text-xs font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          <UserAdd size={14} variant="Broken" />
          <span>{isPartnerConnected ? 'View Household' : 'Invite Partner Link'}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        <p className="px-3 text-[11px] font-semibold text-[#6B6560] uppercase tracking-wider mb-2 font-mono">
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#EF713F] border-0 shadow-none font-semibold'
                  : 'text-[#6B6560] hover:text-[#231F1E] hover:bg-white/60'
              }`}
            >
              <Icon size={20} variant={isActive ? "Bold" : "Broken"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Action Button */}
      <div className="pt-4 border-0">
        <button
          onClick={() => setQuickActionOpen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors border-0 cursor-pointer"
        >
          <MagicStar size={18} variant="Bold" />
          <span>Quick Household Action</span>
        </button>
      </div>
    </aside>
  );
};
