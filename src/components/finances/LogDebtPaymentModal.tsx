import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { DebtAccount } from '../../types';
import { CloseCircle, TickCircle } from 'iconsax-react';

interface LogDebtPaymentModalProps {
  debt: DebtAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogDebtPaymentModal: React.FC<LogDebtPaymentModalProps> = ({ debt, isOpen, onClose }) => {
  const { logDebtPayment, currentUser, partnerUser } = useStore();
  const [amount, setAmount] = useState(debt?.minimumPayment ? String(debt.minimumPayment) : '20000');
  const [paidBy, setPaidBy] = useState<string>(currentUser?.name || 'Leslie');

  if (!isOpen || !debt) return null;

  const paymentVal = parseFloat(amount) || 0;
  const monthlyRate = (debt.effectiveAPR / 100) / 12;
  const interestPaid = Math.round(debt.balance * monthlyRate);
  const principalPaid = Math.max(0, paymentVal - interestPaid);
  const remainingBalance = Math.max(0, debt.balance - principalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentVal <= 0) return;

    logDebtPayment({
      debtId: debt.id,
      amount: paymentVal,
      paidBy
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
              <TickCircle size={20} variant="Bold" className="text-[#4A7C59]" />
              <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">
                Log Payment for {debt.name}
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
            {/* Current Balance Display */}
            <div className="p-4 rounded-2xl bg-[#FBF9F5] border-0 space-y-1">
              <span className="text-xs font-semibold text-[#6B6560] block uppercase font-mono tracking-wider">
                Current Outstanding Balance
              </span>
              <div className="text-xl font-mono font-extrabold text-[#EF713F]">
                ₦{debt.balance.toLocaleString()}
              </div>
            </div>

            {/* Payment Amount Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Payment Amount (₦)</label>
              <input
                type="number"
                required
                placeholder="20000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-sm font-mono text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Principal vs Interest Auto-Split Breakdown */}
            {paymentVal > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#F0F7F2] border border-[#D5EAD9] space-y-2 text-xs">
                <span className="font-bold text-[#4A7C59] block font-mono">
                  📊 Auto-Split Breakdown:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#231F1E]">
                  <div>
                    Principal Reduced: <strong className="text-[#4A7C59]">₦{principalPaid.toLocaleString()}</strong>
                  </div>
                  <div>
                    Interest Paid: <strong className="text-[#EF713F]">₦{interestPaid.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="pt-1 border-t border-[#D5EAD9] font-mono text-[11px] text-[#4A7C59] font-bold">
                  New Remaining Balance: ₦{remainingBalance.toLocaleString()}
                </div>
              </div>
            )}

            {/* Paid By */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Who Made This Payment?</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              >
                <option value={currentUser?.name || 'Leslie'}>{currentUser?.name || 'Leslie'} (You)</option>
                <option value={partnerUser?.name || 'Asa'}>{partnerUser?.name || 'Asa'} (Partner)</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#4A7C59] hover:bg-[#3D6849] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer shadow-md"
            >
              Log Payment & Update Balance
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
