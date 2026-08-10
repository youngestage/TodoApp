import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CloseCircle, Setting2, Copy, TickCircle, Mobile } from 'iconsax-react';
import { Avatar } from '../ui/Avatar';
import {
  requestNotificationPermission,
  getNotificationPermissionState
} from '../../utils/notifications';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, household, currentUser, partnerUser, setCurrentView } = useStore();
  const [copied, setCopied] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isSettingsOpen) {
      setPermissionState(getNotificationPermissionState());
    }
  }, [isSettingsOpen]);

  const isEnabled = permissionState === 'granted';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleNotifications = async () => {
    if (permissionState !== 'granted') {
      await requestNotificationPermission();
      setPermissionState(getNotificationPermissionState());
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl border-0 shadow-2xl p-6 space-y-6 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-0 pb-1">
              <div className="flex items-center space-x-2">
                <Setting2 size={22} variant="Bold" className="text-[#231F1E]" />
                <h3 className="font-zodiak text-xl font-bold text-[#231F1E]">Quick Household Settings</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
              >
                <CloseCircle size={22} variant="Broken" />
              </button>
            </div>

            {/* PWA Push Notifications Toggle */}
            <div className="p-4 rounded-2xl bg-[#FBF9F5] border-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#EF713F] flex items-center justify-center shadow-xs">
                    <Mobile size={20} variant="Bold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#231F1E]">Push Notifications</h4>
                    <p className="text-[11px] text-[#6B6560]">Get alerts for tasks, expenses & chat</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleNotifications}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 border-0 cursor-pointer ${
                    isEnabled ? 'bg-[#4A7C59]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="text-[10px] font-mono text-[#6B6560] border-t border-[#F5F3EF] pt-2 flex items-center justify-between">
                <span>Browser Permission:</span>
                <span className={`font-bold ${isEnabled ? 'text-[#4A7C59]' : 'text-[#CF9130]'}`}>
                  {permissionState.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Household Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
                  Household Partners
                </span>
                <span className="text-[10px] font-mono text-[#4A7C59] font-bold">2/2 Connected</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6EB] border-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-[#231F1E] block">{currentUser.name} (You)</span>
                      <span className="text-[10px] text-[#6B6560]">Partner A • Primary</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
                </div>

                <div className="flex items-center justify-between border-t border-[#F5ECCF] pt-2.5">
                  <div className="flex items-center space-x-2">
                    <Avatar name={partnerUser.name} src={partnerUser.avatarUrl} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-[#231F1E] block">{partnerUser.name}</span>
                      <span className="text-[10px] text-[#6B6560]">Partner B • Synced</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
                </div>
              </div>
            </div>

            {/* Invite Link */}
            <div className="p-4 rounded-2xl bg-[#FBF9F5] border-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#231F1E]">Partner Invite Code</span>
                <span className="text-[10px] text-[#6B6560]">Share with your partner</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-white rounded-xl font-mono text-xs font-bold text-[#231F1E] text-center border-0">
                  {household.inviteCode}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-[#231F1E] text-white hover:bg-black transition-colors cursor-pointer border-0 flex items-center justify-center"
                >
                  {copied ? <TickCircle size={16} variant="Bold" className="text-[#4A7C59]" /> : <Copy size={16} variant="Linear" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSettingsOpen(false);
                setCurrentView('settings');
              }}
              className="w-full py-3 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-semibold text-xs border-0 transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <Setting2 size={16} variant="Bold" />
              <span>Open Full App Settings Architecture →</span>
            </button>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
