import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Heart, CloseCircle, TickCircle, ArrowRight } from 'iconsax-react';
import { Avatar } from '../ui/Avatar';

export const SettleUpModal: React.FC = () => {
  const { isSettleUpOpen, setSettleUpOpen, household, settleUpBalance } = useStore();

  const { debtor, creditor, amount } = household.settleBalance;

  return (
    <AnimatePresence>
      {isSettleUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setSettleUpOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl border-0 shadow-2xl p-6 space-y-6 text-center overflow-hidden"
          >
            <div className="flex items-center justify-between border-0 pb-1">
              <div className="flex items-center space-x-2">
                <Heart size={20} variant="Bold" className="text-[#EF713F]" />
                <h3 className="font-bold text-xl text-[#231F1E]">Pay Household Balance</h3>
              </div>
              <button
                onClick={() => setSettleUpOpen(false)}
                className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
              >
                <CloseCircle size={22} variant="Broken" />
              </button>
            </div>

            <img src="/settle_up.svg" alt="Settle Up Balance" className="w-28 h-28 mx-auto object-contain drop-shadow-xs py-1" />

            <div className="flex items-center justify-center space-x-4 py-2">
              <div className="text-center space-y-1">
                <Avatar name={debtor} size="lg" />
                <span className="block text-xs font-semibold text-[#231F1E]">{debtor}</span>
                <span className="text-[10px] text-[#EF713F] font-mono font-bold">Payer</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="px-3.5 py-1.5 rounded-full bg-[#FAF6EB] border-0 font-mono text-sm font-bold text-[#231F1E]">
                  ₦{amount.toLocaleString()}
                </div>
                <ArrowRight size={18} variant="Linear" className="text-[#CF9130] mt-1" />
              </div>

              <div className="text-center space-y-1">
                <Avatar name={creditor} size="lg" />
                <span className="block text-xs font-semibold text-[#231F1E]">{creditor}</span>
                <span className="text-[10px] text-[#4A7C59] font-mono font-bold">Receiver</span>
              </div>
            </div>

            <p className="text-xs text-[#6B6560] leading-relaxed">
              Mark ₦{amount.toLocaleString()} as paid to zero out the household settlement balance.
            </p>

            <button
              onClick={() => settleUpBalance()}
              className="w-full py-3.5 bg-[#4A7C59] hover:bg-[#3D6849] text-white font-bold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <TickCircle size={18} variant="Bold" />
              <span>Confirm & Mark as Paid</span>
            </button>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
