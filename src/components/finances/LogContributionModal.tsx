import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { SavingsGoal } from '../../types';
import { CloseCircle, Cup, TickCircle } from 'iconsax-react';

interface LogContributionModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogContributionModal: React.FC<LogContributionModalProps> = ({ goal, isOpen, onClose }) => {
  const { logSavingsContribution, currentUser, partnerUser } = useStore();
  const [amount, setAmount] = useState(goal?.suggestedContribution ? String(goal.suggestedContribution) : '50000');
  const [contributorName, setContributorName] = useState<string>(currentUser?.name || 'Leslie');
  const [note, setNote] = useState('');

  if (!isOpen || !goal) return null;

  const depositVal = parseFloat(amount) || 0;
  const currency = goal.currency || '₦';
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositVal <= 0) return;

    logSavingsContribution({
      goalId: goal.id,
      amount: depositVal,
      contributorName,
      note: note.trim() || undefined
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
            <div className="flex items-center space-x-2">
              <Cup size={20} variant="Bold" className="text-[#4A7C59]" />
              <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">
                Add Deposit to {goal.icon} {goal.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
            >
              <CloseCircle size={22} variant="Broken" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Goal Progress Summary */}
            <div className="p-4 rounded-2xl bg-[#FBF9F5] border-0 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
                  Current Saved
                </span>
                <span className="text-xl font-mono font-extrabold text-[#4A7C59]">
                  {currency}{goal.currentAmount.toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
                  Target
                </span>
                <span className="text-sm font-mono font-bold text-[#231F1E]">
                  {currency}{goal.targetAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Deposit Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Deposit Amount ({currency})</label>
              <input
                type="number"
                required
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-sm font-mono text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Suggested Split Banner */}
            {goal.ownership === 'joint' && depositVal > 0 && (
              <div className="p-3 rounded-xl bg-[#F6F3FA] border border-[#E8DEF2] text-xs text-[#8964B3] font-mono">
                💡 50/50 Joint Split Recommendation: <strong>{currency}{(depositVal / 2).toLocaleString()}</strong> per partner.
              </div>
            )}

            {/* Contributor Picker */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Who Made This Deposit?</label>
              <select
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              >
                <option value={currentUser?.name || 'Leslie'}>{currentUser?.name || 'Leslie'} (You)</option>
                <option value={partnerUser?.name || 'Asa'}>{partnerUser?.name || 'Asa'} (Partner)</option>
                <option value="Household Pool">Household Joint Pool (Ajo Group)</option>
              </select>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Note / Source (Optional)</label>
              <input
                type="text"
                placeholder="E.g. Bonus payout or PiggyVest auto-save"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#4A7C59] hover:bg-[#3D6849] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer shadow-md"
            >
              Log Savings Deposit 🎉
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
