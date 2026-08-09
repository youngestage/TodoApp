import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ArrowRight, TickCircle, Wallet3, TaskSquare } from 'iconsax-react';

interface DailyInsightPageProps {
  onFinish: () => void;
}

export const DailyInsightPage: React.FC<DailyInsightPageProps> = ({ onFinish }) => {
  const { currentUser, partnerUser, tasks, recurringBills, household, preferences } = useStore();
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const pendingTasks = tasks.filter(t => !t.completed);
  const jointPendingTasks = pendingTasks.filter(t => t.isJoint);
  const dueBills = recurringBills.filter(b => b.status === 'DUE');

  // Dynamic daily review message
  const fullReview = `Good afternoon, ${currentUser.name} ✨\n\nHere is your Daily Household Review:\n\n• ${dueBills.length} bill${dueBills.length === 1 ? '' : 's'} due this week (${preferences.currency}${dueBills.reduce((s, b) => s + b.amount, 0).toLocaleString()})\n• ${pendingTasks.length} pending task${pendingTasks.length === 1 ? '' : 's'} (${jointPendingTasks.length} joint 2/2 confirm)\n• Settle-up balance: ${household.settleBalance.debtor} owes ${preferences.currency}${household.settleBalance.amount.toLocaleString()}\n\nEverything is synced live with ${partnerUser.name}. Have a wonderful day ahead! 💕`;

  useEffect(() => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= fullReview.length) {
        setTypedText(fullReview.slice(0, charIndex));
        charIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typeInterval);
      }
    }, 35);

    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, 15000);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(autoDismissTimer);
    };
  }, [fullReview]);

  const handleDismiss = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('coupletodo_last_daily_insight_date', todayStr);
    onFinish();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-0 z-[100] bg-[#FBF9F5] flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none"
    >
      {/* Background Liquid Woosh Blobs */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 2.2, opacity: 0.25 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#EF713F] via-[#E9C277] to-[#BEABD8] blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 2.5, opacity: 0.2 }}
        transition={{ duration: 3.5, ease: "easeOut" }}
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#BEABD8] via-[#E9C277] to-[#EF713F] blur-3xl pointer-events-none"
      />

      {/* Top Header: Top Right Skip Button (No Tag) */}
      <div className="relative z-10 flex items-center justify-end">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 rounded-2xl bg-white/90 hover:bg-white text-[#231F1E] font-bold text-xs shadow-xs transition-all border-0 cursor-pointer flex items-center space-x-1.5 hover:scale-105"
        >
          <span>Skip</span>
          <ArrowRight size={14} variant="Linear" />
        </button>
      </div>

      {/* Center Main Content: Typewriter Daily Review Text */}
      <div className="relative z-10 max-w-2xl mx-auto w-full my-auto py-8">
        <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border-0 shadow-xl space-y-6">
          
          <div className="font-sans text-base sm:text-lg text-[#231F1E] leading-relaxed whitespace-pre-wrap font-medium">
            {typedText}
            {!isTypingComplete && (
              <span className="inline-block w-2 h-5 ml-1 bg-[#EF713F] animate-pulse rounded-full align-middle" />
            )}
          </div>

          {/* Quick Recap Stat Chips */}
          {isTypingComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F5F3EF]"
            >
              <div className="p-3 rounded-2xl bg-[#FFF5F0] border-0 text-xs">
                <span className="text-[10px] font-mono text-[#6B6560] block">Due Bills</span>
                <span className="font-extrabold text-[#EF713F] text-sm">
                  {dueBills.length} Bills
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F6F3FA] border-0 text-xs">
                <span className="text-[10px] font-mono text-[#6B6560] block">Pending Tasks</span>
                <span className="font-extrabold text-[#8964B3] text-sm">
                  {pendingTasks.length} Tasks
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#EBF3ED] border-0 text-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-[#6B6560] block">Settlement</span>
                <span className="font-extrabold text-[#4A7C59] text-sm">
                  {preferences.currency}{household.settleBalance.amount.toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="relative z-10 flex justify-center pt-4">
        <button
          onClick={handleDismiss}
          className="px-8 py-3.5 rounded-2xl bg-[#231F1E] hover:bg-black text-white font-bold text-sm shadow-xl transition-all border-0 cursor-pointer flex items-center space-x-2 hover:scale-105 font-sans"
        >
          <TickCircle size={18} variant="Bold" className="text-[#4A7C59]" />
          <span>Got it, open dashboard</span>
        </button>
      </div>
    </motion.div>
  );
};
