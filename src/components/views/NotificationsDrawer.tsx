import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CloseCircle, TaskSquare, Wallet3, NoteText, WalletCheck } from 'iconsax-react';

export const NotificationsDrawer: React.FC = () => {
  const { isNotificationsOpen, setNotificationsOpen, setCurrentView, openContextualThread } = useStore();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Task' | 'Budget' | 'Note'>('All');

  const [notificationList, setNotificationList] = useState([
    {
      id: 1,
      title: 'Asa completed dinner reservation task',
      time: '10m ago',
      type: 'Task' as const,
      icon: TaskSquare,
      unread: true,
      targetView: 'tasks' as const,
      threadItem: { type: 'TASK' as const, id: 'task-1', title: 'Book romantic dinner at Chef Alain' }
    },
    {
      id: 2,
      title: 'Fibre Internet Subscription bill auto-logged',
      time: '1h ago',
      type: 'Budget' as const,
      icon: Wallet3,
      unread: true,
      targetView: 'budget' as const,
      threadItem: { type: 'TRANSACTION' as const, id: 'tx-2', title: 'Fibre Internet Subscription' }
    },
    {
      id: 3,
      title: 'Leslie added quick note: Check water filter',
      time: '3h ago',
      type: 'Note' as const,
      icon: NoteText,
      unread: false
    },
    {
      id: 4,
      title: 'Asa paid ₦12,000 settlement balance',
      time: 'Yesterday',
      type: 'Budget' as const,
      icon: WalletCheck,
      unread: false,
      targetView: 'budget' as const
    }
  ]);

  const handleNotificationClick = (item: typeof notificationList[0]) => {
    // 1. Mark as read
    setNotificationList(prev =>
      prev.map(n => (n.id === item.id ? { ...n, unread: false } : n))
    );

    // 2. Close drawer
    setNotificationsOpen(false);

    // 3. Navigate or open thread if available
    if (item.threadItem) {
      openContextualThread(item.threadItem);
    } else if (item.targetView) {
      setCurrentView(item.targetView);
    }
  };

  const filteredNotifications = notificationList.filter(n => {
    if (activeFilter === 'All') return true;
    return n.type === activeFilter;
  });

  return (
    <AnimatePresence>
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Soft Fading Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 bg-black/20 backdrop-blur-xs cursor-pointer"
            onClick={() => setNotificationsOpen(false)}
          />

          {/* Streamlined Notifications Drawer (Icon, Subtitle & Footer Removed) */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
            className="relative w-80 sm:w-96 h-full bg-[#FBF9F5] rounded-l-[32px] z-50 p-6 sm:p-7 space-y-6 flex flex-col justify-between overflow-y-auto border-0 shadow-[-16px_0_40px_rgba(35,31,30,0.08)]"
          >
            <div className="space-y-6">
              
              {/* Clean Header: "Notifications" Title ONLY (No Icon, No Subtitle) */}
              <div className="flex items-center justify-between border-0 pb-1">
                <h3 className="font-display text-2xl font-bold text-[#231F1E]">Notifications</h3>

                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1.5 rounded-full text-[#6B6560] hover:text-[#231F1E] hover:bg-black/5 transition-colors cursor-pointer border-0"
                  aria-label="Close Notifications"
                >
                  <CloseCircle size={22} variant="Broken" />
                </button>
              </div>

              {/* Minimal Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-white/80 p-1 rounded-2xl border-0">
                {(['All', 'Task', 'Budget', 'Note'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer ${
                      activeFilter === tab
                        ? 'bg-[#231F1E] text-white'
                        : 'text-[#6B6560] hover:text-[#231F1E]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Interactive Notifications Activity List (Click to Mark Read & Open) */}
              <div className="space-y-2.5">
                {filteredNotifications.map((n) => {
                  const IconComp = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full p-4 rounded-2xl text-xs space-y-1.5 border-0 text-left transition-all relative cursor-pointer ${
                        n.unread
                          ? 'bg-white shadow-[0_4px_16px_rgba(35,31,30,0.04)] font-semibold'
                          : 'bg-white/60 text-[#6B6560]'
                      }`}
                    >
                      {n.unread && (
                        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#EF713F]" />
                      )}

                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          n.unread ? 'bg-[#FFF5F0] text-[#EF713F]' : 'bg-[#F5F3EF] text-[#6B6560]'
                        }`}>
                          <IconComp size={16} variant="Linear" />
                        </div>
                        <div className="flex-1 flex items-center justify-between pr-4">
                          <span className="text-[10px] font-semibold uppercase font-mono">
                            {n.type}
                          </span>
                          <span className="text-[10px] text-[#6B6560] font-mono">{n.time}</span>
                        </div>
                      </div>

                      <p className={`leading-snug pl-9 ${n.unread ? 'text-[#231F1E]' : 'text-[#6B6560]'}`}>
                        {n.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
