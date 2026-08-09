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

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0) || 450000;

  const totalSpent = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const leftToSpend = totalIncome - totalSpent;

  const cardsData = [
    {
      id: 'income',
      title: 'Total Income',
      amount: `₦${totalIncome.toLocaleString()}`,
      subtitle: 'Combined Household Pool',
      icon: ImportSquare,
      accentColor: 'bg-[#4A7C59]',
      textColor: 'text-[#4A7C59]',
    },
    {
      id: 'spent',
      title: 'Total Spent',
      amount: `₦${totalSpent.toLocaleString()}`,
      subtitle: `${transactions.filter(t => t.type === 'EXPENSE').length} shared transactions`,
      icon: ExportSquare,
      accentColor: 'bg-[#EF713F]',
      textColor: 'text-[#EF713F]',
    },
    {
      id: 'leftover',
      title: 'Left to Spend',
      amount: `₦${leftToSpend.toLocaleString()}`,
      subtitle: 'On track for savings target',
      icon: MagicStar,
      accentColor: 'bg-[#8964B3]',
      textColor: 'text-[#8964B3]',
    },
    {
      id: 'settle',
      title: 'Settle Up Balance',
      amount: household.settleBalance.amount > 0
        ? `₦${household.settleBalance.amount.toLocaleString()}`
        : 'Settled ✓',
      subtitle: household.settleBalance.amount > 0
        ? `${household.settleBalance.debtor} owes ${household.settleBalance.creditor}`
        : 'Household balance is clear',
      icon: Wallet3,
      accentColor: 'bg-[#E9C277]',
      textColor: 'text-[#CF9130]',
      settleButton: household.settleBalance.amount > 0
    }
  ];

  // Auto-switch carousel every 4 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cardsData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, cardsData.length]);

  const currentCard = cardsData[currentIndex];
  const IconComponent = currentCard.icon;

  const maskAmount = (val: string) => {
    if (!hideBalances) return val;
    return val.replace(/₦[\d,]+/g, '₦••••••••');
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-white rounded-3xl p-6 border-0 shadow-none overflow-hidden h-[175px] flex flex-col justify-between select-none"
    >
      
      {/* Top Bar: Card Selector Dots & Eye Icon Toggle */}
      <div className="flex items-center justify-between z-10 shrink-0">
        
        {/* Navigation Indicator Dots */}
        <div className="flex items-center space-x-2">
          {cardsData.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                currentIndex === idx
                  ? 'w-6 bg-[#231F1E]'
                  : 'w-2 bg-[#EFECE6] hover:bg-[#6B6560]'
              }`}
              aria-label={`Go to ${card.title}`}
            />
          ))}
        </div>

        {/* Eye Icon for hiding/revealing balances */}
        <button
          onClick={toggleHideBalances}
          className="p-1.5 rounded-full hover:bg-[#F5F3EF] text-[#6B6560] hover:text-[#231F1E] transition-colors flex items-center space-x-1.5 text-xs font-medium border-0 cursor-pointer"
          title={hideBalances ? "Show Balances" : "Hide Balances"}
        >
          {hideBalances ? (
            <EyeSlash size={18} variant="Linear" className="text-[#EF713F]" />
          ) : (
            <Eye size={18} variant="Linear" className="text-[#231F1E]" />
          )}
          <span className="hidden sm:inline text-xs">{hideBalances ? 'Show' : 'Hide'}</span>
        </button>
      </div>

      {/* Glitch-Free Absolute Positioned Card Stage */}
      <div className="relative flex-1 mt-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col justify-center space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-7 h-7 rounded-xl ${currentCard.accentColor} text-white flex items-center justify-center shrink-0`}>
                  <IconComponent size={16} variant="Bold" />
                </div>
                <span className="text-xs font-semibold text-[#6B6560] uppercase tracking-wider font-mono">
                  {currentCard.title}
                </span>
              </div>

              {currentCard.settleButton && (
                <button
                  onClick={() => setSettleUpOpen(true)}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#E9C277] hover:bg-[#DFAA4D] text-[#231F1E] font-bold text-xs transition-colors border-0 cursor-pointer"
                >
                  <span>Pay Now</span>
                  <ArrowRight size={12} variant="Linear" />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              <h2 className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${currentCard.textColor}`}>
                {maskAmount(currentCard.amount)}
              </h2>
              <p className="text-xs text-[#6B6560] font-sans truncate">
                {currentCard.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
