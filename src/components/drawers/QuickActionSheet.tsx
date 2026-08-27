import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CloseCircle, Wallet3, TaskSquare, MessageText, MagicStar, People } from 'iconsax-react';
import { BudgetCategoryType } from '../../types';

export const QuickActionSheet: React.FC = () => {
  const {
    isQuickActionOpen,
    setQuickActionOpen,
    quickActionTab,
    setQuickActionTab,
    addTransaction,
    addTask,
    sendChatMessage,
    currentUser,
    partnerUser
  } = useStore();

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<BudgetCategoryType>('Expenses');
  const [expensePaidBy, setExpensePaidBy] = useState<string>(currentUser?.name ?? '');

  useEffect(() => {
    if (currentUser?.name) {
      setExpensePaidBy(currentUser.name);
    }
  }, [currentUser?.name]);
  const [expenseAccount, setExpenseAccount] = useState<string>('Joint Account');
  const [expenseIsShared, setExpenseIsShared] = useState(true);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'Home' | 'Bills' | 'Travel' | 'Date Night' | 'Shopping'>('Home');
  const [taskIsJoint, setTaskIsJoint] = useState(true);
  const [taskDueDate, setTaskDueDate] = useState('Tomorrow');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const [messageText, setMessageText] = useState('');

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    addTransaction({
      title: expenseTitle,
      amount: parseFloat(expenseAmount) || 0,
      type: 'EXPENSE',
      category: expenseCategory,
      paidBy: expensePaidBy,
      account: expenseAccount,
      isShared: expenseIsShared,
      date: 'Just now'
    });

    setExpenseTitle('');
    setExpenseAmount('');
    setQuickActionOpen(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    addTask({
      title: taskTitle,
      category: taskCategory,
      isJoint: taskIsJoint,
      assignedToName: (taskIsJoint ? 'Both' : currentUser?.name) as any,
      dueDate: taskDueDate,
      priority: taskPriority,
      subTasks: []
    });

    setTaskTitle('');
    setQuickActionOpen(false);
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendChatMessage(messageText);
    setMessageText('');
    setQuickActionOpen(false);
  };

  return (
    <AnimatePresence>
      {isQuickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setQuickActionOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-0 pb-3">
              <div className="flex items-center space-x-2">
                <MagicStar size={20} variant="Bold" className="text-[#EF713F]" />
                <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">Quick Household Action</h2>
              </div>
              <button
                onClick={() => setQuickActionOpen(false)}
                className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
              >
                <CloseCircle size={22} variant="Broken" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-[#FBF9F5] rounded-xl border-0 text-xs font-medium">
              <button
                onClick={() => setQuickActionTab('expense')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 border-0 transition-all cursor-pointer ${
                  quickActionTab === 'expense'
                    ? 'bg-[#EF713F] text-white font-semibold'
                    : 'text-[#6B6560] hover:text-[#231F1E]'
                }`}
              >
                <Wallet3 size={16} variant={quickActionTab === 'expense' ? "Bold" : "Broken"} />
                <span>Log Expense</span>
              </button>

              <button
                onClick={() => setQuickActionTab('task')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 border-0 transition-all cursor-pointer ${
                  quickActionTab === 'task'
                    ? 'bg-[#8964B3] text-white font-semibold'
                    : 'text-[#6B6560] hover:text-[#231F1E]'
                }`}
              >
                <TaskSquare size={16} variant={quickActionTab === 'task' ? "Bold" : "Broken"} />
                <span>Add Task</span>
              </button>

              <button
                onClick={() => setQuickActionTab('message')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 border-0 transition-all cursor-pointer ${
                  quickActionTab === 'message'
                    ? 'bg-[#231F1E] text-white font-semibold'
                    : 'text-[#6B6560] hover:text-[#231F1E]'
                }`}
              >
                <MessageText size={16} variant={quickActionTab === 'message' ? "Bold" : "Broken"} />
                <span>Quick Note</span>
              </button>
            </div>

            {/* EXPENSE FORM */}
            {quickActionTab === 'expense' && (
              <form onSubmit={handleExpenseSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#6B6560]">Expense Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Weekly Farmers Market Produce"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Amount (₦)</label>
                    <input
                      type="number"
                      required
                      placeholder="5000"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm font-mono text-[#231F1E] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Paid By</label>
                    <select
                      value={expensePaidBy}
                      onChange={(e) => setExpensePaidBy(e.target.value)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                    >
                      <option value={currentUser?.name ?? ''}>{currentUser?.name ?? 'Me'}</option>
                      {partnerUser?.name && partnerUser.name !== 'Waiting for Partner...' && (
                        <option value={partnerUser.name}>{partnerUser.name}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as any)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                    >
                      <option value="Groceries & Market">Groceries & Market</option>
                      <option value="Dining & Takeout">Dining & Takeout</option>
                      <option value="Fuel & Transport">Fuel & Transport</option>
                      <option value="Shopping & Fashion">Shopping & Fashion</option>
                      <option value="Home Care & Maintenance">Home Care & Maintenance</option>
                      <option value="Entertainment & Leisure">Entertainment & Leisure</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Family & Kids">Family & Kids</option>
                      <option value="Personal Care">Personal Care</option>
                      <option value="Other Expense">Other Expense</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Account</label>
                    <select
                      value={expenseAccount}
                      onChange={(e) => setExpenseAccount(e.target.value)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                    >
                      <option value="Personal Account">Personal Account</option>
                      <option value="Joint Account">Joint Account</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAF6EB] rounded-xl border-0">
                  <span className="text-xs font-medium text-[#231F1E]">Split 50/50 Shared Expense?</span>
                  <button
                    type="button"
                    onClick={() => setExpenseIsShared(!expenseIsShared)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 border-0 cursor-pointer ${
                      expenseIsShared ? 'bg-[#EF713F]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        expenseIsShared ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#EF713F] hover:bg-[#D95220] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer"
                >
                  Save & Log Expense
                </button>
              </form>
            )}

            {/* TASK FORM */}
            {quickActionTab === 'task' && (
              <form onSubmit={handleTaskSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#6B6560]">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Confirm romantic dinner reservation"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Category</label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value as any)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                    >
                      <option value="Home">Home</option>
                      <option value="Bills">Bills</option>
                      <option value="Travel">Travel</option>
                      <option value="Date Night">Date Night</option>
                      <option value="Shopping">Shopping</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Due Date</label>
                    <select
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                    >
                      <option value="Tonight">Tonight</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                      <option value="Next Week">Next Week</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#6B6560]">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                    >
                      <option value="High">High 🔴</option>
                      <option value="Medium">Medium 🟡</option>
                      <option value="Low">Low 🟢</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F6F3FA] rounded-xl border-0">
                  <div className="flex items-center space-x-2">
                    <People size={18} variant="Bold" className="text-[#8964B3]" />
                    <span className="text-xs font-medium text-[#231F1E]">Joint 2/2 Partner Confirmation?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTaskIsJoint(!taskIsJoint)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 border-0 cursor-pointer ${
                      taskIsJoint ? 'bg-[#8964B3]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        taskIsJoint ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#8964B3] hover:bg-[#7852A4] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer"
                >
                  Create Joint Task
                </button>
              </form>
            )}

            {/* MESSAGE FORM */}
            {quickActionTab === 'message' && (
              <form onSubmit={handleMessageSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#6B6560]">Contextual Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Send a quick note or update to partner..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#231F1E] hover:bg-black text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer"
                >
                  Send to Household Chat
                </button>
              </form>
            )}

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
