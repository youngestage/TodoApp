import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ProfileSettingsCard } from './settings/ProfileSettingsCard';
import { GlobalPreferencesCard } from './settings/GlobalPreferencesCard';
import { CategoryTreeManager } from './settings/CategoryTreeManager';
import { PaymentAccountsManager } from './settings/PaymentAccountsManager';
import { DebtStrategyCard } from './settings/DebtStrategyCard';
import { DeleteAccountModal } from './settings/DeleteAccountModal';
import {
  Global,
  Category,
  Wallet3,
  Flash,
  Notification,
  LogoutCurve
} from 'iconsax-react';

export const SettingsView: React.FC = () => {
  const { logout } = useStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'global' | 'categories' | 'accounts' | 'debt'>('profile');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 md:pb-6 select-none max-w-4xl mx-auto">
      
      {/* 1. Header with Log Out CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560]">
            Manage profile photo, push notifications, invite code & accounts
          </p>
        </div>

        {/* Prominent Red Log Out Button */}
        <button
          onClick={async () => {
            await logout();
          }}
          className="px-4 py-2.5 rounded-2xl bg-[#FFF5F0] hover:bg-[#FFEAE0] text-[#EF713F] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border-0 shrink-0"
        >
          <LogoutCurve size={18} variant="Bold" />
          <span>Log Out</span>
        </button>
      </div>

      {/* 2. Section Switcher */}
      <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Notifications', icon: Notification },
          { id: 'global', label: 'Global Preferences', icon: Global },
          { id: 'categories', label: 'Category Tree', icon: Category },
          { id: 'accounts', label: 'Payment Accounts', icon: Wallet3 },
          { id: 'debt', label: 'Debt & Savings', icon: Flash }
        ].map((sec) => {
          const IconComp = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                isActive
                  ? 'bg-[#231F1E] text-white'
                  : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
              }`}
            >
              <IconComp size={16} variant={isActive ? "Bold" : "Linear"} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'profile' && (
          <motion.div
            key="profile-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <ProfileSettingsCard onOpenDeleteModal={() => setDeleteModalOpen(true)} />
          </motion.div>
        )}

        {activeSection === 'global' && (
          <motion.div
            key="global-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <GlobalPreferencesCard />
          </motion.div>
        )}

        {activeSection === 'categories' && (
          <motion.div
            key="cat-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <CategoryTreeManager />
          </motion.div>
        )}

        {activeSection === 'accounts' && (
          <motion.div
            key="acc-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <PaymentAccountsManager />
          </motion.div>
        )}

        {activeSection === 'debt' && (
          <motion.div
            key="debt-sec"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <DebtStrategyCard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />

    </div>
  );
};
