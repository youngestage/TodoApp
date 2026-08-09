import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CloseCircle, TaskSquare, Wallet3, NoteText, WalletCheck, Notification } from 'iconsax-react';

export const NotificationsDrawer: React.FC = () => {
  const { isNotificationsOpen, setNotificationsOpen, setCurrentView, openContextualThread, tasks, transactions, quickNotes, currentUser, partnerUser } = useStore();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Task' | 'Budget' | 'Note'>('All');

  // Derive real notifications dynamically from active store data
  const realNotifications = [
    ...tasks.slice(0, 3).map(t => ({
      id: `notif-task-${t.id}`,
      title: `${t.assignedToName} task: ${t.title}`,
      time: t.dueDate,
      type: 'Task' as const,
      icon: TaskSquare,
      unread: !t.completed,
      targetView: 'tasks' as const,
      threadItem: { type: 'TASK' as const, id: t.id, title: t.title }
    })),
    ...transactions.slice(0, 3).map(tx => ({
      id: `notif-tx-${tx.id}`,
      title: `${tx.paidBy} logged ${tx.type === 'EXPENSE' ? 'expense' : 'income'}: ${tx.title} (₦${tx.amount.toLocaleString()})`,
      time: tx.date,
      type: 'Budget' as const,
      icon: Wallet3,
      unread: false,
      targetView: 'budget' as const,
      threadItem: { type: 'TRANSACTION' as const, id: tx.id, title: tx.title }
    })),
    ...quickNotes.slice(0, 3).map(n => ({
      id: `notif-note-${n.id}`,
      title: `${n.authorName} note: ${n.text}`,
      time: n.timestamp,
      type: 'Note' as const,
      icon: NoteText,
      unread: false
    }))
  ];

  const filteredNotifications = realNotifications.filter(n => {
    if (activeFilter === 'All') return true;
    return n.type === activeFilter;
  });

  const handleNotificationClick = (item: typeof realNotifications[0]) => {
    setNotificationsOpen(false);
    if (item.threadItem) {
      openContextualThread(item.threadItem);
    } else if (item.targetView) {
      setCurrentView(item.targetView);
    }
  };

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

          {/* Streamlined Notifications Drawer */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
            className="relative w-80 sm:w-96 h-full bg-[#FBF9F5] rounded-l-[32px] z-50 p-6 sm:p-7 space-y-6 flex flex-col justify-between overflow-y-auto border-0 shadow-[-16px_0_40px_rgba(35,31,30,0.08)] select-none"
          >
            <div className="space-y-6">
              
              {/* Clean Header: "Notifications" Title ONLY */}
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

              {/* Notification Cards List */}
              <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => {
                    const IconComp = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 rounded-2xl border-0 transition-all cursor-pointer flex items-start space-x-3 group ${
                          n.unread
                            ? 'bg-white shadow-xs hover:bg-white/90'
                            : 'bg-white/60 hover:bg-white/90'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          n.type === 'Task'
                            ? 'bg-[#FFF5F0] text-[#EF713F]'
                            : n.type === 'Budget'
                            ? 'bg-[#EBF3ED] text-[#4A7C59]'
                            : 'bg-[#F6F3FA] text-[#8964B3]'
                        }`}>
                          <IconComp size={20} variant="Bold" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-[#231F1E] leading-snug group-hover:text-[#EF713F] transition-colors truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#6B6560] block">
                            {n.time}
                          </span>
                        </div>

                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#EF713F] shrink-0 mt-1" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 space-y-2 bg-white/60 rounded-3xl p-6 border-0">
                    <img src="/emptystate.svg" alt="No notifications" className="w-20 h-20 mx-auto object-contain" />
                    <p className="text-xs font-bold text-[#231F1E]">All caught up! 🎉</p>
                    <p className="text-[11px] text-[#6B6560]">No new notifications in this category</p>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
