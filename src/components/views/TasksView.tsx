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
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    toggleJointTaskTap,
    toggleSubTask,
    addSubTask,
    deleteSubTask,
    deleteTask,
    setQuickActionOpen,
    setQuickActionTab,
    openContextualThread,
    currentUser,
    partnerUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Mine' | 'Partner' | 'Joint'>('All');
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [newSubTaskTitles, setNewSubTaskTitles] = useState<Record<string, string>>({});

  const handleAddNewTask = () => {
    setQuickActionTab('task');
    setQuickActionOpen(true);
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddSubTaskSubmit = (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    const title = newSubTaskTitles[taskId]?.trim();
    if (title) {
      addSubTask(taskId, title);
      setNewSubTaskTitles(prev => ({ ...prev, [taskId]: '' }));
    }
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

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === 'none') return null;
    switch (priority) {
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EF713F] text-[10px] font-mono font-semibold">High 🔴</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-mono font-semibold">Medium 🟡</span>;
      case 'Low':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#4A7C59] text-[10px] font-mono font-semibold">Low 🟢</span>;
      default:
        return null;
    }
  };

  const getUserAvatar = (name: string) => {
    if (name === currentUser?.name) return currentUser?.avatarUrl;
    if (name === partnerUser?.name) return partnerUser?.avatarUrl;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  };

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
          <div className="p-8 rounded-3xl bg-white text-center space-y-3 border-0">
            <img src="/emptystate.svg" alt="All caught up" className="w-24 h-24 mx-auto object-contain" />
            <p className="font-bold text-base text-[#231F1E]">All caught up! 🎉</p>
            <p className="text-xs text-[#6B6560]">No pending tasks under this filter.</p>
          </div>
        ) : (
          pendingTasks.map((task) => {
            const isExpanded = !!expandedTasks[task.id];
            const subTasks = task.subTasks || [];
            const completedSubCount = subTasks.filter(st => st.completed).length;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-3 hover:bg-white/90 transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Dual Partner Check Pills & Title */}
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    
                    {/* Dual Partner Check Pills */}
                    <div className="flex items-center space-x-1 shrink-0 pt-0.5">
                      {/* Current User Check Pill */}
                      <button
                        onClick={() => toggleJointTaskTap(task.id, currentUser.name)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 cursor-pointer ${
                          task.userACompleted
                            ? 'bg-[#EF713F] text-white'
                            : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                        }`}
                        title={`${currentUser.name}'s Check`}
                      >
                        {currentUser.name.charAt(0).toUpperCase()}{task.userACompleted ? '✓' : ''}
                      </button>

                      {/* Partner Check Pill */}
                      {task.isJoint && (
                        <button
                          onClick={() => toggleJointTaskTap(task.id, partnerUser.name)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center border-0 cursor-pointer ${
                            task.userBCompleted
                              ? 'bg-[#4A7C59] text-white'
                              : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                          }`}
                          title={`${partnerUser.name}'s Check`}
                        >
                          {partnerUser.name.charAt(0).toUpperCase()}{task.userBCompleted ? '✓' : ''}
                        </button>
                      )}
                    </div>

                    {/* Task Metadata & Description */}
                    <div className="space-y-1 min-w-0 flex-1 cursor-pointer" onClick={() => toggleTaskExpanded(task.id)}>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-base text-[#231F1E]">
                          {task.title}
                        </h3>

                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold">
                          {task.category}
                        </span>

                        {getPriorityBadge(task.priority)}

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
                        {subTasks.length > 0 && (
                          <span className="text-[#8964B3] font-semibold">
                            • {completedSubCount}/{subTasks.length} Sub-tasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions, Expenses & Discussion */}
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
                      {(task.commentsCount ?? 0) > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#EF713F] text-white text-[9px] font-bold flex items-center justify-center">
                          {task.commentsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => toggleTaskExpanded(task.id)}
                      className="p-2.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] text-xs font-semibold transition-colors border-0 cursor-pointer flex items-center space-x-1"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2.5 rounded-2xl bg-[#FBF9F5] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-0 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Collapsible Sub-tasks Checklist */}
                {isExpanded && (
                  <div className="bg-[#F5F3EF] rounded-2xl p-4 mt-3 space-y-2">
                    <div className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Checklist / Sub-tasks</div>
                    {subTasks.map(st => (
                      <div key={st.id} className="flex items-center justify-between py-1.5 border-b border-gray-200/50 last:border-0">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleSubTask(task.id, st.id, currentUser.name)}
                            className="text-gray-400 hover:text-[#8964B3] border-0 bg-transparent cursor-pointer p-0"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#8964B3]" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <span className={`text-xs sm:text-sm ${st.completed ? 'line-through text-gray-400' : 'text-[#231F1E]'}`}>
                            {st.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {st.completed && st.completedBy && (
                            <span className="flex items-center text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                              <img src={getUserAvatar(st.completedBy)} alt={st.completedBy} className="w-3.5 h-3.5 rounded-full mr-1" />
                              Done by {st.completedBy}
                            </span>
                          )}
                          <button
                            onClick={() => deleteSubTask(task.id, st.id)}
                            className="text-gray-300 hover:text-red-500 border-0 bg-transparent cursor-pointer p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <form onSubmit={(e) => handleAddSubTaskSubmit(e, task.id)} className="flex items-center bg-white rounded-xl px-3 py-1.5 mt-2 border border-gray-200">
                      <Plus className="w-4 h-4 text-gray-400 mr-2" />
                      <input
                        type="text"
                        value={newSubTaskTitles[task.id] || ''}
                        onChange={(e) => setNewSubTaskTitles(prev => ({ ...prev, [task.id]: e.target.value }))}
                        placeholder="Add a sub-task checklist item..."
                        className="w-full bg-transparent border-0 focus:outline-none text-xs text-[#231F1E] placeholder-gray-400"
                      />
                    </form>
                  </div>
                )}
              </motion.div>
            );
          })
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
                          Completed • {task.category} {task.completedBy ? `by ${task.completedBy}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-300 hover:text-red-500 border-0 bg-transparent cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
