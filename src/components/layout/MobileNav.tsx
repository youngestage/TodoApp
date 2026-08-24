import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Home,
  TaskSquare,
  WalletMoney,
  MessageText,
  Add,
  NoteText,
  Setting2,
  Wallet,
  Task
} from 'iconsax-react';
import { ViewMode } from '../../types';
import { liquidGlass } from '../ui/liquidGlass';

export const MobileNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    tasks,
    chatMessages,
    isFullChatActive,
    setQuickActionOpen,
    setQuickActionTab,
    setQuickNoteOpen
  } = useStore();

  const navRef = useRef<HTMLElement>(null);
  const plusBtnRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  // Liquid glass refraction effect on main purple nav
  useEffect(() => {
    if (!navRef.current) return;
    const instance = liquidGlass(navRef.current, {
      scale: -140,
      chroma: 8,
      border: 0,
      mapBlur: 10,
      blur: 2,
      saturate: 1.3,
    });
    return () => instance.destroy();
  }, []);

  // Liquid glass refraction effect on isolated circular + button
  useEffect(() => {
    if (!plusBtnRef.current) return;
    const instance = liquidGlass(plusBtnRef.current, {
      scale: -140,
      chroma: 8,
      border: 0,
      mapBlur: 10,
      blur: 2,
      saturate: 1.3,
    });
    return () => instance.destroy();
  }, []);

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<any>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: TaskSquare, badge: pendingTasksCount },
    { id: 'budget', label: 'Finances', icon: WalletMoney },
    { id: 'chat', label: 'Chat', icon: MessageText, badge: chatMessages.length > 0 ? chatMessages.length : undefined },
  ];

  // Quick Action items
  const actionItems = [
    {
      id: 'quick-note',
      title: 'Quick note',
      description: 'Jot down a sticky reminder',
      icon: NoteText,
      action: () => setQuickNoteOpen(true)
    },
    {
      id: 'log-expense',
      title: 'Log Expense',
      description: 'Split or individual transaction',
      icon: Wallet,
      action: () => {
        setQuickActionTab('expense');
        setQuickActionOpen(true);
      }
    },
    {
      id: 'add-task',
      title: 'Add Joint Task',
      description: 'Both partners tap confirmation',
      icon: Task,
      action: () => {
        setQuickActionTab('task');
        setQuickActionOpen(true);
      }
    },
    {
      id: 'settings',
      title: 'App Settings',
      description: 'Currencies, categories, debt strategy & accounts',
      icon: Setting2,
      action: () => setCurrentView('settings')
    }
  ];

  // Hide bottom nav in full-screen chat, onboarding, or invite modes!
  if (currentView === 'onboarding' || currentView === 'invite' || (currentView === 'chat' && isFullChatActive)) {
    return null;
  }

  return (
    <>
      {/* Pure White Backdrop Overlay (Matching inspo.png) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-white/70 backdrop-blur-md cursor-pointer overflow-hidden border-0"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2.5 max-w-[95vw]">
        
        {/* 1. Main Brand Purple Liquid Glass Bottom Nav Pill */}
        <nav
          ref={navRef}
          className="relative overflow-hidden rounded-full liquid-glass-nav p-1.5 flex items-center justify-center gap-1 border-0 transition-all duration-300"
          role="tablist"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setIsMenuOpen(false);
                  setCurrentView(item.id);
                }}
                whileTap={{ scale: 0.94 }}
                className="relative focus:outline-none cursor-pointer select-none"
              >
                <div
                  className={`relative flex items-center space-x-2 h-10 px-3.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[#E9C277] text-[#231F1E] font-bold shadow-md'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon
                      size={20}
                      variant={isActive ? "Bold" : "Broken"}
                      className="transition-transform duration-200"
                    />
                    
                    {!isActive && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#E9C277] text-[#231F1E] text-[9px] font-bold flex items-center justify-center border-0 shadow-xs">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="text-xs font-sans whitespace-nowrap overflow-hidden pr-0.5"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* 2. Floating Circular FAB & Inspo.png Style Action List */}
        <div className="relative">
          
          {/* Action List (Single-Line Text + Pure White Circular Icon Buttons) */}
          <AnimatePresence>
            {isMenuOpen && (
              <div className="absolute bottom-16 right-0 z-50 flex flex-col items-end space-y-4 pb-2 pr-0.5">
                {actionItems.map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 15, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                        delay: (actionItems.length - 1 - i) * 0.04
                      }}
                      onClick={() => {
                        setIsMenuOpen(false);
                        item.action();
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center space-x-3.5 group cursor-pointer text-right border-0 bg-transparent whitespace-nowrap"
                    >
                      {/* Left: Full Unstacked Single-Line Text */}
                      <div className="whitespace-nowrap text-right">
                        <span className="font-sans font-bold text-sm sm:text-base text-[#18181B] group-hover:text-[#EF713F] transition-colors">
                          {item.title}
                        </span>
                        <span className="font-sans text-xs text-[#71717A] ml-2 font-normal hidden sm:inline">
                          — {item.description}
                        </span>
                      </div>

                      {/* Right: Pure White Circular Icon Button */}
                      <div className="w-12 h-12 rounded-full bg-white text-[#18181B] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border-0">
                        <IconComponent size={22} variant="Linear" className="text-[#18181B]" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Bottom-Right Circular Close/Open Button (Always Pure White Background) */}
          <motion.button
            ref={plusBtnRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 select-none cursor-pointer border-0 z-50 relative liquid-glass-white text-[#231F1E]"
            aria-label="Quick Actions Menu"
          >
            <Add
              size={24}
              variant="Linear"
              className={`transition-transform duration-300 text-[#231F1E] stroke-[2] ${
                isMenuOpen ? 'rotate-45' : ''
              }`}
            />
          </motion.button>
        </div>
      </div>
    </>
  );
};
