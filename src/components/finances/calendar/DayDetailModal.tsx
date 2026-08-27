import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface DayDetailModalProps {
  selectedDayStr: string | null;
  onClose: () => void;
  selectedDayData?: {
    incomes: number;
    expenses: number;
    items: Array<{ id: string; title: string; amount: number; type: 'income' | 'expense' | 'bill' | 'debt' | 'savings'; subtitle?: string }>;
  } | null;
  currency: string;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  selectedDayStr,
  onClose,
  selectedDayData,
  currency
}) => {
  if (!selectedDayStr || !selectedDayData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border-0"
        >
          <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-[#EF713F]" />
              <h3 className="font-bold text-lg text-[#231F1E]">
                {new Date(selectedDayStr + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#6B6560] hover:text-[#231F1E] bg-transparent border-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
            {selectedDayData.items.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-[#FBF9F5] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-[#231F1E] truncate">{item.title}</h4>
                  {item.subtitle && <p className="text-xs text-[#6B6560] font-mono">{item.subtitle}</p>}
                </div>
                <span
                  className={`font-mono text-sm font-extrabold shrink-0 ${
                    item.type === 'income' ? 'text-[#4A7C59]' : 'text-[#231F1E]'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}{currency}{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
