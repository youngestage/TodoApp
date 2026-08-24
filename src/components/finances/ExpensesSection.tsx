import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Transaction } from '../../types';
import {
  Add,
  Edit2,
  MessageText,
  Receipt2,
  Trash,
  TrendDown,
  Wallet3
} from 'iconsax-react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';

export const ExpensesSection: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    updateTransaction,
    preferences,
    currentUser,
    partnerUser,
    setQuickActionOpen,
    setQuickActionTab,
    openContextualThread
  } = useStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const currency = preferences?.currency || '₦';

  const getUserAvatar = (name: string) => getUserAvatarUrl(name, currentUser, partnerUser);

  const pureExpenseCategories = [
    'All',
    'Groceries & Market',
    'Dining & Takeout',
    'Fuel & Transport',
    'Shopping & Fashion',
    'Home Care & Maintenance',
    'Entertainment & Leisure',
    'Health & Wellness',
    'Family & Kids',
    'Personal Care',
    'Other Expense'
  ];

  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');

  const filteredExpenses = expenseTransactions.filter((t) => {
    if (activeCategoryFilter === 'All') return true;
    return t.category === activeCategoryFilter;
  });

  const totalExpenseSpend = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const startEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(String(tx.amount));
  };

  const saveEdit = () => {
    if (!editingTx || !editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0) return;
    updateTransaction(editingTx.id, {
      title: editTitle.trim(),
      amount: parseFloat(editAmount)
    });
    setEditingTx(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Summary Header Card */}
      <div className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F3EF] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#231F1E]">
              Logged Household Expenses
            </h2>
            <p className="text-xs text-[#6B6560]">
              Track groceries, transport, dining & daily spending (Bills, Savings & Debt are in dedicated tabs)
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right font-mono">
              <span className="text-xs text-[#6B6560] block font-semibold">Total Logged Expenses</span>
              <span className="text-xl font-extrabold text-[#EF713F]">
                {currency}{Math.round(totalExpenseSpend).toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                setQuickActionTab('expense');
                setQuickActionOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer shadow-sm"
            >
              <Add size={16} variant="Linear" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* 2. Pure Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
          {pureExpenseCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-[#231F1E] text-white'
                  : 'bg-[#FBF9F5] text-[#6B6560] hover:text-[#231F1E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Expense Items List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white text-center space-y-3 border-0">
            <Receipt2 size={36} className="mx-auto text-gray-300" />
            <p className="font-bold text-base text-[#231F1E]">No logged expenses found</p>
            <p className="text-xs text-[#6B6560]">Tap Log Expense to record groceries, transport, dining out or shopping.</p>
          </div>
        ) : (
          filteredExpenses.map((tx) => (
            <motion.div
              key={tx.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-3 hover:bg-white/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center text-xl shrink-0 font-bold">
                  🛍️
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  {editingTx?.id === tx.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-[#FBF9F5] p-2 rounded-xl text-xs font-semibold text-[#231F1E] border-0 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="bg-[#FBF9F5] p-2 rounded-xl text-xs font-mono text-[#231F1E] border-0 focus:outline-none w-24"
                      />
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 rounded-xl bg-[#4A7C59] text-white text-xs font-bold border-0 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-bold text-base text-[#231F1E] truncate">
                          {tx.title}
                        </h3>

                        <span className="px-2 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold">
                          {tx.category}
                        </span>

                        {tx.isShared && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F6F3FA] text-[#8964B3] text-[10px] font-mono font-bold">
                            50/50 Shared
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-[#6B6560] font-mono">
                        <img
                          src={getUserAvatar(tx.paidBy)}
                          alt={tx.paidBy}
                          className="w-4 h-4 rounded-full object-cover border border-[#EF713F]"
                        />
                        <span>Paid by <strong className="text-[#231F1E]">{tx.paidBy}</strong></span>
                        <span>• Account: {tx.account || 'Card'}</span>
                        <span>• {tx.date}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-right font-mono">
                  <span className="text-lg font-extrabold text-[#EF713F] block">
                    -{currency}{tx.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openContextualThread({ type: 'TRANSACTION', id: tx.id, title: tx.title })}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#8964B3] transition-colors border-0 cursor-pointer"
                    title="Discuss with Partner"
                  >
                    <MessageText size={16} variant="Linear" />
                  </button>

                  <button
                    onClick={() => startEdit(tx)}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                    title="Edit Expense"
                  >
                    <Edit2 size={16} variant="Linear" />
                  </button>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-0 cursor-pointer"
                    title="Delete Expense"
                  >
                    <Trash size={16} variant="Linear" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
