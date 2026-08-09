import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Add,
  MessageText,
  Calendar,
  ArrowDown2,
  ArrowUp2
} from 'iconsax-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    toggleJointTaskTap,
    setQuickActionOpen,
    setQuickActionTab,
    openContextualThread,
    currentUser,
    partnerUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Mine' | 'Partner' | 'Joint'>('All');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddNewTask = () => {
    setQuickActionTab('task');
    setQuickActionOpen(true);
  };

  const pendingTasks = tasks.filter((task) => {
    if (task.completed) return false;
    if (activeTab === 'Mine') return task.assignedToName === currentUser.name || task.isJoint;
    if (activeTab === 'Partner') return task.assignedToName === partnerUser.name || task.isJoint;
    if (activeTab === 'Joint') return task.isJoint;
    return true;
  });

  const completedTasks = tasks.filter((task) => {
    if (!task.completed) return false;
    if (activeTab === 'Mine') return task.assignedToName === currentUser.name || task.isJoint;
    if (activeTab === 'Partner') return task.assignedToName === partnerUser.name || task.isJoint;
    if (activeTab === 'Joint') return task.isJoint;
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6 select-none">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
            Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560]">
            Shared household chores & joint partner check-offs
          </p>
        </div>

        <button
          onClick={handleAddNewTask}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer shrink-0"
        >
          <Add size={16} variant="Linear" />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. Simplified Filter Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto">
          {(['All', 'Mine', 'Partner', 'Joint'] as const).map((tab) => {
            const labelMap = {
              All: 'All',
              Mine: 'Mine',
              Partner: `${partnerUser.name}'s`,
              Joint: 'Joint',
            };

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#231F1E] text-white'
                    : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-[#6B6560] px-2 hidden sm:inline">
          {pendingTasks.length} Pending
        </span>
      </div>

      {/* 3. Active Tasks List */}
      <div className="space-y-3">
        {pendingTasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white text-center space-y-2 border-0">
            <p className="font-display text-lg font-bold text-[#231F1E]">All caught up! 🎉</p>
            <p className="text-xs text-[#6B6560]">No pending tasks under this filter.</p>
          </div>
        ) : (
          pendingTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-3 hover:bg-white/90 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Left: Dual Partner Check Pills & Title */}
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  
                  {/* Dual Partner Check Pills */}
                  <div className="flex items-center space-x-1 shrink-0 pt-0.5">
                    {/* Leslie Check Pill */}
                    <button
                      onClick={() => toggleJointTaskTap(task.id, 'Leslie')}
                      disabled={currentUser.name !== 'Leslie'}
                      className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 ${
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
                    {task.isJoint && (
                      <button
                        onClick={() => toggleJointTaskTap(task.id, 'Asa')}
                        disabled={currentUser.name !== 'Asa'}
                        className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 ${
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
                    )}
                  </div>

                  {/* Task Metadata & Description */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-semibold text-base text-[#231F1E]">
                        {task.title}
                      </h3>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold">
                        {task.category}
                      </span>

                      {task.isJoint && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F6F3FA] text-[#8964B3] text-[10px] font-mono font-semibold">
                          Joint (2/2)
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#6B6560] leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-xs text-[#6B6560] pt-0.5 font-mono">
                      <span className="flex items-center space-x-1">
                        <Calendar size={13} variant="Linear" className="text-[#EF713F]" />
                        <span>{task.dueDate}</span>
                      </span>
                      <span>• Assigned to {task.assignedToName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Auto-Logged Expense & Discussion Trigger */}
                <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                  {task.linkedExpense && (
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-[#6B6560] block">Auto-Logs</span>
                      <span className="text-xs font-bold text-[#EF713F]">
                        ₦{task.linkedExpense.amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => openContextualThread({ type: 'TASK', id: task.id, title: task.title })}
                    className="p-2.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-semibold transition-colors relative border-0 cursor-pointer flex items-center space-x-1.5"
                  >
                    <MessageText size={16} variant="Linear" className="text-[#EF713F]" />
                    <span className="hidden sm:inline">Discussion</span>
                    {task.commentsCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#EF713F] text-white text-[9px] font-bold flex items-center justify-center">
                        {task.commentsCount}
                      </span>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 4. Collapsible Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between py-2 px-1 text-xs font-semibold text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer font-mono"
          >
            <span>Completed Tasks ({completedTasks.length})</span>
            {showCompleted ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />}
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2.5 overflow-hidden"
              >
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/60 rounded-3xl p-4 border-0 opacity-75 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-[#4A7C59] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-[#6B6560] line-through truncate">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-[#6B6560] font-mono">
                          Completed • {task.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
