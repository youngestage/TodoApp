import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { BalanceCardsCarousel } from '../ui/BalanceCardsCarousel';
import { SpeedLogBar } from '../ui/SpeedLogBar';
import { RelationshipClock } from '../ui/RelationshipClock';
import { MessageText, ArrowRight } from 'iconsax-react';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    transactions,
    currentUser,
    toggleJointTaskTap,
    setCurrentView,
    openContextualThread
  } = useStore();

  const [activeTab, setActiveTab] = useState<'tasks' | 'activity'>('tasks');

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-5 pb-20 md:pb-6 select-none">
      
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
                    {/* Dual Partner Confirmation Check Pills */}
                    {task.isJoint ? (
                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Leslie Check Pill */}
                        <button
                          onClick={() => toggleJointTaskTap(task.id, 'Leslie')}
                          disabled={currentUser.name !== 'Leslie'}
                          className={`w-7 h-7 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 ${
                            currentUser.name !== 'Leslie'
                              ? 'opacity-40 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${
                            task.userACompleted
                              ? 'bg-[#EF713F] text-white'
                              : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                          }`}
                          title={currentUser.name !== 'Leslie' ? "Only Leslie can check this side" : "Leslie's Check"}
                        >
                          L{task.userACompleted ? '✓' : ''}
                        </button>

                        {/* Asa Check Pill */}
                        <button
                          onClick={() => toggleJointTaskTap(task.id, 'Asa')}
                          disabled={currentUser.name !== 'Asa'}
                          className={`w-7 h-7 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 ${
                            currentUser.name !== 'Asa'
                              ? 'opacity-40 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${
                            task.userBCompleted
                              ? 'bg-[#4A7C59] text-white'
                              : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                          }`}
                          title={currentUser.name !== 'Asa' ? "Only Asa can check this side" : "Asa's Check"}
                        >
                          A{task.userBCompleted ? '✓' : ''}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleJointTaskTap(task.id, 'Leslie')}
                        disabled={currentUser.name !== 'Leslie'}
                        className={`w-7 h-7 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 ${
                          currentUser.name !== 'Leslie'
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer'
                        } ${
                          task.completed
                            ? 'bg-[#4A7C59] text-white'
                            : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                        }`}
                      >
                        {task.completed ? '✓' : ''}
                      </button>
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
                    {task.commentsCount > 0 && (
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
                    <Avatar name={tx.paidBy} size="sm" />
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
