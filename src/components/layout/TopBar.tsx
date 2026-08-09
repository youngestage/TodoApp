import React from 'react';
import { useStore } from '../../store/useStore';
import { Notification } from 'iconsax-react';

export const TopBar: React.FC = () => {
  const { toggleNotificationsOpen } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5] px-4 sm:px-8 py-4 border-0 shadow-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo (No BG) */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.svg"
            alt="Couples Studio Logo"
            className="w-8 h-8 object-contain shrink-0"
          />
        </div>

        {/* Notifications Icon ONLY - Toggles Right Drawer */}
        <div className="relative">
          <button
            onClick={toggleNotificationsOpen}
            className="p-2.5 rounded-full hover:bg-black/5 text-[#231F1E] transition-colors relative focus:outline-none cursor-pointer border-0"
            aria-label="Notifications"
          >
            <Notification size={22} variant="Linear" className="text-[#231F1E]" />
            
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF713F] ring-2 ring-[#FBF9F5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
