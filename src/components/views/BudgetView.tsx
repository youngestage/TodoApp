import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { BalanceCardsCarousel } from '../widgets';
import { RecurringBillsSection } from '../finances/RecurringBillsSection';
import { DebtStrategySection } from '../finances/DebtStrategySection';
import { SavingsGoalsSection } from '../finances/SavingsGoalsSection';
import { IncomeSection } from '../finances/IncomeSection';
import { ExpensesSection } from '../finances/ExpensesSection';
import {
  Add,
  MessageText,
  ArrowUp,
  ArrowDown
} from 'iconsax-react';

export const BudgetView: React.FC = () => {
  const {
    transactions,
    recurringBills,
    debtAccounts,
    savingsGoals,
    incomeStreams,
    setQuickActionOpen,
    setQuickActionTab,
    setSettleUpOpen,
    openContextualThread
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Expenses' | 'Income' | 'Bills' | 'Debt' | 'Savings'>('All');

  const handleOpenTransactionForm = () => {
    setQuickActionTab('expense');
    setQuickActionOpen(true);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === 'Expenses') return t.type === 'EXPENSE';
    if (activeTab === 'Income') return t.type === 'INCOME';
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6 select-none">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
            Finances
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560]">
            Shared household expenses, income sources, recurring bills, debt strategy & savings goals
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setSettleUpOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-[#E9C277] hover:bg-[#DFAA4D] text-[#231F1E] font-bold text-xs transition-colors border-0 cursor-pointer shadow-xs text-center"
          >
            Settle Up Now
          </button>

          <button
            onClick={handleOpenTransactionForm}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer shadow-xs"
          >
            <Add size={16} variant="Linear" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Financial Balance Cards Carousel */}
      <BalanceCardsCarousel />

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'All', label: 'All Activity' },
            { id: 'Expenses', label: 'Expenses' },
            { id: 'Income', label: 'Income' },
            { id: 'Bills', label: 'Subscriptions & Bills' },
            { id: 'Debt', label: 'Debt Strategy' },
            { id: 'Savings', label: 'Savings Goals' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#231F1E] text-white'
                  : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-[#6B6560] px-2 hidden sm:inline">
          {activeTab === 'Bills'
            ? `${recurringBills.length} Active Bills`
            : activeTab === 'Debt'
            ? `${debtAccounts.length} Debt Accounts`
            : activeTab === 'Savings'
            ? `${savingsGoals.length} Savings Goals`
            : activeTab === 'Income'
            ? `${incomeStreams.length} Income Sources`
            : `${filteredTransactions.length} Logged Transactions`}
        </span>
      </div>

      {/* 4. Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Expenses' ? (
          /* Pure Expenses Section */
          <motion.div
            key="expenses-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <ExpensesSection />
          </motion.div>
        ) : activeTab === 'Income' ? (
          /* Income Section */
          <motion.div
            key="income-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <IncomeSection />
          </motion.div>
        ) : activeTab === 'Bills' ? (
          /* Recurring Bills & Subscriptions Section */
          <motion.div
            key="bills-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <RecurringBillsSection />
          </motion.div>
        ) : activeTab === 'Debt' ? (
          /* Debt Strategy Section */
          <motion.div
            key="debt-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <DebtStrategySection />
          </motion.div>
        ) : activeTab === 'Savings' ? (
          /* Savings Goals Section */
          <motion.div
            key="savings-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <SavingsGoalsSection />
          </motion.div>
        ) : (
          /* Standard Transactions List */
          <motion.div
            key="transactions-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            {filteredTransactions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white text-center space-y-3 border-0">
                <img src="/emptystate.svg" alt="No transactions" className="w-24 h-24 mx-auto object-contain" />
                <p className="font-bold text-base text-[#231F1E]">No transactions logged yet 💸</p>
                <p className="text-xs text-[#6B6560]">Log an expense or income transaction to track household split.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-3xl p-5 border-0 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/90 transition-all"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                        tx.type === 'EXPENSE'
                          ? 'bg-[#FFF5F0] text-[#EF713F]'
                          : 'bg-[#F0F7F2] text-[#4A7C59]'
                      }`}
                    >
                      {tx.type === 'EXPENSE' ? (
                        <ArrowUp size={18} variant="Linear" />
                      ) : (
                        <ArrowDown size={18} variant="Linear" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-base text-[#231F1E] truncate">
                          {tx.title}
                        </h3>

                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold">
                          {tx.category}
                        </span>

                        {tx.isShared && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F6F3FA] text-[#8964B3] text-[10px] font-mono font-semibold">
                            Split 50/50
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6B6560] font-mono">
                        {tx.date} • Paid by {tx.paidBy} via {tx.account}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <div className="text-right font-mono">
                      <span
                        className={`text-base font-extrabold block ${
                          tx.type === 'EXPENSE' ? 'text-[#231F1E]' : 'text-[#4A7C59]'
                        }`}
                      >
                        {tx.type === 'EXPENSE' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => openContextualThread({ type: 'TRANSACTION', id: tx.id, title: tx.title })}
                      className="p-2.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-semibold transition-colors relative border-0 cursor-pointer flex items-center space-x-1.5"
                      title="Discussion"
                    >
                      <MessageText size={16} variant="Linear" className="text-[#EF713F]" />
                      <span className="hidden sm:inline">Discussion</span>
                      {(tx.commentsCount ?? 0) > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#EF713F] text-white text-[9px] font-bold flex items-center justify-center">
                          {tx.commentsCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
