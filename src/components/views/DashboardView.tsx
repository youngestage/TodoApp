import React, { useState } from 'react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';
import { resolvePartners } from '../../utils/identityUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CategoryIcon } from '../ui/CategoryIcon';
import { BalanceCardsCarousel, SpeedLogBar, RelationshipClock } from '../widgets';
import { MessageText, ArrowRight } from 'iconsax-react';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    transactions,
    currentUser,
    partnerUser,
    household,
    toggleJointTaskTap,
    setCurrentView,
    openContextualThread
  } = useStore();

  const [activeTab, setActiveTab] = useState<'tasks' | 'activity'>('tasks');

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);
  const isPartnerConnected = (household.members?.length || 0) >= 2 || (partnerUser && partnerUser.id !== 'usr_partner_waiting');

  return (
    <div className="space-y-5 pb-20 md:pb-6 select-none">
      
      {/* Solo Partner Join Banner */}
      {!isPartnerConnected && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#F6F3FA] to-[#FAF6EB] flex flex-col sm:flex-row items-center justify-between gap-3 border-0 shadow-xs">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#8964B3] flex items-center justify-center shrink-0">
              <MessageText size={20} variant="TwoTone" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#231F1E]">Have a Partner's 6-Digit Key?</h4>
              <p className="text-[11px] text-[#6B6560]">Enter key to pair your budget, joint tasks & chat instantly.</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('invite')}
            className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-[#8964B3] hover:bg-[#7853A2] text-white text-xs font-bold transition-all border-0 cursor-pointer shrink-0 flex items-center justify-center space-x-1"
          >
            <span>Enter Key to Join →</span>
          </button>
        </div>
      )}

      {/* 1. Auto-Switching Financial Balance Cards Carousel */}
      <BalanceCardsCarousel />

      {/* 2. Persistent 1-Tap Speed Log Bar */}
      <SpeedLogBar />

      {/* 3. Digital Relationship Age Widget */}
      <RelationshipClock />

      {/* 4. Simplified Mobile & Desktop Section Toggle */}
      <div className="space-y-4">
        
        {/* Simplified Tab Switcher */}
        <div className="flex items-center justify-between border-0">
          <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#231F1E] text-white'
                  : 'text-[#6B6560] hover:text-[#231F1E]'
              }`}
            >
              Tasks ({pendingTasks.length})
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-[#231F1E] text-white'
                  : 'text-[#6B6560] hover:text-[#231F1E]'
              }`}
            >
              Recent Activity
            </button>
          </div>

          <button
            onClick={() => setCurrentView(activeTab === 'tasks' ? 'tasks' : 'budget')}
            className="text-xs font-semibold text-[#EF713F] hover:text-[#D95220] flex items-center space-x-1 border-0 bg-transparent cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={14} variant="Linear" />
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' ? (
            <motion.div
              key="tasks-tab"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2.5"
            >
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border-0 shadow-none flex items-center justify-between gap-3 hover:bg-white/90 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Dual Partner Confirmation Check Pills — role-based, not name-sorted */}
                    {task.isJoint ? (
                      (() => {
                        const { userA, userB, iAmA } = resolvePartners(currentUser, partnerUser);
                        const iCanClickA = iAmA;
                        const iCanClickB = !iAmA;

                        return (
                          <div className="flex items-center space-x-1.5 shrink-0">
                            {/* userA Check Button (partner_a slot) */}
                            <button
                              onClick={() => {
                                if (iCanClickA) toggleJointTaskTap(task.id, userA.name);
                              }}
                              disabled={!iCanClickA}
                              className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center border-2 p-0.5 overflow-hidden ${
                                !iCanClickA ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                              } ${
                                task.userACompleted
                                  ? 'border-[#EF713F] ring-2 ring-[#EF713F]/30 scale-105'
                                  : 'border-gray-200 opacity-60 hover:opacity-100'
                              }`}
                              title={!iCanClickA ? `Only ${userA.name} can check this` : `${userA.name}'s check`}
                            >
                              <img
                                src={getUserAvatarUrl(userA.name, currentUser, partnerUser)}
                                alt={userA.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                              {task.userACompleted && (
                                <div className="absolute inset-0 bg-[#EF713F]/80 flex items-center justify-center text-white font-extrabold text-xs">✓</div>
                              )}
                            </button>

                            {/* userB Check Button (partner_b slot) */}
                            <button
                              onClick={() => {
                                if (iCanClickB) toggleJointTaskTap(task.id, userB.name);
                              }}
                              disabled={!iCanClickB}
                              className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center border-2 p-0.5 overflow-hidden ${
                                !iCanClickB ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                              } ${
                                task.userBCompleted
                                  ? 'border-[#4A7C59] ring-2 ring-[#4A7C59]/30 scale-105'
                                  : 'border-gray-200 opacity-60 hover:opacity-100'
                              }`}
                              title={!iCanClickB ? `Only ${userB.name} can check this` : `${userB.name}'s check`}
                            >
                              <img
                                src={getUserAvatarUrl(userB.name, currentUser, partnerUser)}
                                alt={userB.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                              {task.userBCompleted && (
                                <div className="absolute inset-0 bg-[#4A7C59]/80 flex items-center justify-center text-white font-extrabold text-xs">✓</div>
                              )}
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      (() => {
                        const assignedTo = task.assignedToName || currentUser.name;
                        const isMyTask = assignedTo === currentUser.name || assignedTo === 'Both' || assignedTo === 'Anyone';

                        return (
                          <button
                            onClick={() => {
                              if (isMyTask) {
                                toggleJointTaskTap(task.id, currentUser.name);
                              }
                            }}
                            disabled={!isMyTask}
                            className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center border-2 p-0.5 overflow-hidden ${
                              !isMyTask ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                            } ${
                              task.completed
                                ? 'border-[#EF713F] ring-2 ring-[#EF713F]/30 scale-105'
                                : 'border-gray-200 hover:border-[#EF713F]'
                            }`}
                            title={!isMyTask ? `Assigned to ${assignedTo}` : 'Check off task'}
                          >
                            <img 
                              src={getUserAvatarUrl(assignedTo, currentUser, partnerUser)} 
                              alt={assignedTo} 
                              className="w-full h-full rounded-full object-cover" 
                            />
                            {task.completed && (
                              <div className="absolute inset-0 bg-[#EF713F]/80 flex items-center justify-center text-white font-extrabold text-xs">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })()
                    )}

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-[#231F1E] truncate">
                        {task.title}
                      </h3>
                      <p className="text-[11px] text-[#6B6560] font-mono">
                        {task.dueDate} • {task.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openContextualThread({ type: 'TASK', id: task.id, title: task.title })}
                    className="p-2 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-semibold transition-colors shrink-0 border-0 cursor-pointer flex items-center space-x-1"
                  >
                    <MessageText size={16} variant="Linear" className="text-[#EF713F]" />
                    {(task.commentsCount ?? 0) > 0 && (
                      <span className="text-[10px] font-mono font-bold text-[#EF713F]">
                        {task.commentsCount}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="activity-tab"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2.5"
            >
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border-0 shadow-none flex items-center justify-between gap-3 hover:bg-white/90 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <CategoryIcon category={tx.category} title={tx.title} size="sm" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-[#231F1E] truncate">
                        {tx.title}
                      </h3>
                      <p className="text-[11px] text-[#6B6560] font-mono truncate">
                        Paid by {tx.paidBy} • {tx.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className={`text-sm font-extrabold block ${
                      tx.type === 'INCOME' ? 'text-[#4A7C59]' : 'text-[#231F1E]'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#6B6560]">{tx.date}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
