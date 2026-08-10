import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Eye,
  EyeSlash,
  ImportSquare,
  ExportSquare,
  MagicStar,
  Wallet3,
  ArrowRight
} from 'iconsax-react';

export const BalanceCardsCarousel: React.FC = () => {
  const {
    transactions,
    household,
    hideBalances,
    toggleHideBalances,
    setSettleUpOpen
  } = useStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const calculateBalances = () => {
    let totalSpent = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        totalSpent += tx.amount;
      }
    });

    const netSettle = household.settleBalance;
    const settleDisplayAmount = hideBalances ? '••••' : `₦${netSettle.amount.toLocaleString()}`;

    return {
      totalSpent: hideBalances ? '••••' : `₦${totalSpent.toLocaleString()}`,
      settleDisplayAmount,
      debtor: netSettle.debtor,
      creditor: netSettle.creditor,
      isSettled: netSettle.amount === 0
    };
  };

  const balances = calculateBalances();

  const cards = [
    {
      id: 'total-spent',
      title: 'TOTAL SPENT',
      subtitle: `${transactions.length} shared transactions`,
      value: balances.totalSpent,
      badge: 'Joint Expenses',
      theme: 'orange',
      bgClass: 'bg-white',
      accentColor: '#EF713F',
      actionLabel: null,
      icon: ExportSquare
    },
    {
      id: 'settle-up',
      title: 'NET SETTLE-UP BALANCE',
      subtitle: balances.isSettled
        ? 'All shared expenses are 100% settled up! 🎉'
        : `${balances.debtor} owes ${balances.creditor}`,
      value: balances.settleDisplayAmount,
      badge: balances.isSettled ? 'Settled Up ✓' : 'Pending Settlement',
      theme: 'purple',
      bgClass: 'bg-white',
      accentColor: '#8964B3',
      actionLabel: 'Settle Up Now',
      onAction: () => setSettleUpOpen(true),
      icon: Wallet3
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [cards.length, isPaused]);

  const currentCard = cards[currentIndex];
  const IconComp = currentCard.icon;

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-white border-0 p-5 sm:p-6 shadow-xs min-h-[160px] flex flex-col justify-between">
        
        {/* Card Header & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className="w-8 h-8 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
              style={{ backgroundColor: currentCard.accentColor }}
            >
              <IconComp size={16} variant="Bold" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#6B6560] uppercase">
                {currentCard.title}
              </span>
              <div className="text-[11px] font-medium text-[#6B6560]">
                {currentCard.subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={toggleHideBalances}
            className="p-2 rounded-xl hover:bg-[#F5F3EF] text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer flex items-center space-x-1 text-xs"
            title={hideBalances ? 'Show Balance' : 'Hide Balance'}
          >
            {hideBalances ? <EyeSlash size={16} /> : <Eye size={16} />}
            <span className="text-[11px] font-mono hidden sm:inline">{hideBalances ? 'Show' : 'Hide'}</span>
          </button>
        </div>

        {/* Big Balance Amount & Action */}
        <div className="my-3 flex flex-wrap items-baseline justify-between gap-2">
          <motion.div
            key={currentCard.id + hideBalances}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl sm:text-4xl font-extrabold text-[#231F1E] tracking-tight"
          >
            {currentCard.value}
          </motion.div>

          {currentCard.actionLabel && currentCard.onAction && (
            <button
              onClick={currentCard.onAction}
              className="py-2 px-4 rounded-2xl text-white font-bold text-xs border-0 cursor-pointer shadow-sm hover:opacity-95 transition-all flex items-center space-x-1.5"
              style={{ backgroundColor: currentCard.accentColor }}
            >
              <span>{currentCard.actionLabel}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center justify-between border-t border-[#F5F3EF] pt-3">
          <div className="flex items-center space-x-1.5">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all border-0 cursor-pointer p-0 ${
                  currentIndex === idx ? 'w-6 bg-[#231F1E]' : 'w-1.5 bg-[#E5E0D8] hover:bg-[#6B6560]'
                }`}
                title={card.title}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-[#6B6560]">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

      </div>
    </div>
  );
};
