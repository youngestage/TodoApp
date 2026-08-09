import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Avatar } from '../ui/Avatar';
import { BalanceCardsCarousel } from '../ui/BalanceCardsCarousel';
import {
  Add,
  MessageText,
  TickCircle,
  ArrowUp,
  ArrowDown
} from 'iconsax-react';

export const BudgetView: React.FC = () => {
  const {
    transactions,
    recurringBills,
    payRecurringBill,
    setQuickActionOpen,
    setQuickActionTab,
    setSettleUpOpen,
    openContextualThread
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Expenses' | 'Income' | 'Bills'>('All');

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
      <div className="flex items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-0 shadow-none">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231F1E] tracking-tight">
            Budget & Bills
          </h1>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setSettleUpOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#E9C277] hover:bg-[#DFAA4D] text-[#231F1E] font-bold text-xs transition-colors border-0 cursor-pointer"
          >
            Pay Now
          </button>

          <button
            onClick={handleOpenTransactionForm}
            className="inline-flex items-center space-x-1 px-4 py-2.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer"
          >
            <Add size={16} variant="Linear" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Auto-Switching Financial Balance Cards Carousel */}
      <BalanceCardsCarousel />

      {/* 3. Simplified Section Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto">
          {(['All', 'Expenses', 'Income', 'Bills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#231F1E] text-white'
                  : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
              }`}
            >
              {tab === 'All' ? 'All Activity' : tab}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-[#6B6560] px-2 hidden sm:inline">
          {activeTab === 'Bills' ? `${recurringBills.length} Subscriptions` : `${filteredTransactions.length} Transactions`}
        </span>
      </div>

      {/* 4. Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Bills' ? (
          /* Recurring Bills Section */
          <motion.div
            key="bills-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            {recurringBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-3xl p-5 border-0 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/90 transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center font-bold shrink-0">
                    ⚡
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-semibold text-base text-[#231F1E] truncate">
                      {bill.title}
                    </h3>
                    <p className="text-xs text-[#6B6560] font-mono">
                      {bill.dueDate} • Paid by {bill.paidBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-base font-extrabold text-[#231F1E] block">
                      ₦{bill.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#6B6560] uppercase">{bill.category}</span>
                  </div>

                  {bill.status === 'PAID' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#EBF3ED] text-[#4A7C59] font-mono text-xs font-semibold">
                      <TickCircle size={14} variant="Bold" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => payRecurringBill(bill.id)}
                      className="px-4 py-2 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer"
                    >
                      Pay Bill
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* Transactions List */
          <motion.div
            key="transactions-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-3xl p-5 border-0 shadow-none flex items-center justify-between gap-4 hover:bg-white/90 transition-all"
              >
                {/* Left: Avatar & Details */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-2">
                  <Avatar name={tx.paidBy} size="md" />

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-semibold text-base text-[#231F1E] truncate">
                        {tx.title}
                      </h3>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold">
                        {tx.category}
                      </span>

                      {tx.isShared && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F6F3FA] text-[#8964B3] text-[10px] font-mono font-semibold">
                          50/50 Shared
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6B6560] font-mono truncate">
                      Paid by {tx.paidBy} via {tx.account} • {tx.date}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Discussion */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right font-mono">
                    <span className={`text-base font-extrabold flex items-center justify-end space-x-0.5 ${
                      tx.type === 'INCOME' ? 'text-[#4A7C59]' : 'text-[#231F1E]'
                    }`}>
                      {tx.type === 'INCOME' ? <ArrowDown size={14} className="text-[#4A7C59]" /> : <ArrowUp size={14} className="text-[#EF713F]" />}
                      <span>{tx.type === 'INCOME' ? '+' : '-'}₦{tx.amount.toLocaleString()}</span>
                    </span>
                    <span className="text-[10px] text-[#6B6560] block">{tx.type}</span>
                  </div>

                  <button
                    onClick={() => openContextualThread({ type: 'TRANSACTION', id: tx.id, title: tx.title })}
                    className="p-2.5 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-semibold transition-colors relative border-0 cursor-pointer"
                  >
                    <MessageText size={16} variant="Linear" className="text-[#EF713F]" />
                    {tx.commentsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF713F] text-white text-[9px] font-bold flex items-center justify-center">
                        {tx.commentsCount}
                      </span>
                    )}
                  </button>
                </div>

              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
