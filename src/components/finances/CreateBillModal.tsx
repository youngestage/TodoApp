import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { BillFrequency, BillPaymentMethod, BudgetCategoryType, RecurringBill } from '../../types';
import { CloseCircle, Refresh } from 'iconsax-react';

interface CreateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBill?: RecurringBill | null;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({ isOpen, onClose, editingBill }) => {
  const { addRecurringBill, updateRecurringBill, currentUser, partnerUser } = useStore();

  const userAName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Leslie';
  const userBName = partnerUser?.name && !partnerUser.name.startsWith('Waiting') ? partnerUser.name.split(' ')[0] : 'Asa';

  const [title, setTitle] = useState(editingBill?.title || '');
  const [category, setCategory] = useState<BudgetCategoryType>(editingBill?.category || 'Bills');
  const [amount, setAmount] = useState(editingBill?.amount ? String(editingBill.amount) : '');
  const [frequency, setFrequency] = useState<BillFrequency>(editingBill?.frequency || 'monthly');
  const [customIntervalDays, setCustomIntervalDays] = useState(editingBill?.customIntervalDays || 30);
  const [nextDueDate, setNextDueDate] = useState(editingBill?.nextDueDate || new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<'Leslie' | 'Asa' | 'Shared'>(editingBill?.paidBy || 'Shared');
  const [paymentMethod, setPaymentMethod] = useState<BillPaymentMethod>(editingBill?.paymentMethod || 'card');
  const [notes, setNotes] = useState(editingBill?.notes || '');

  const templates = [
    { title: 'Fibre Internet Unlimited', category: 'Bills' as const, amount: '25000', frequency: 'monthly' as const, icon: '🌐' },
    { title: 'Netflix Premium 4K', category: 'Bills' as const, amount: '5500', frequency: 'monthly' as const, icon: '🍿' },
    { title: 'Spotify Family Plan', category: 'Bills' as const, amount: '3200', frequency: 'monthly' as const, icon: '🎵' },
    { title: 'Electricity Utility Token', category: 'Bills' as const, amount: '15000', frequency: 'monthly' as const, icon: '⚡' },
    { title: 'Apartment Monthly Rent', category: 'Bills' as const, amount: '150000', frequency: 'monthly' as const, icon: '🏠' },
    { title: 'Apple iCloud 2TB', category: 'Bills' as const, amount: '1900', frequency: 'monthly' as const, icon: '☁️' }
  ];

  const applyTemplate = (tmpl: typeof templates[0]) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category);
    setAmount(tmpl.amount);
    setFrequency(tmpl.frequency);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    const payload: Omit<RecurringBill, 'id'> = {
      title: title.trim(),
      category,
      amount: parseFloat(amount),
      frequency,
      customIntervalDays: frequency === 'custom' ? Number(customIntervalDays) : undefined,
      nextDueDate,
      paidBy,
      paymentMethod,
      notes,
      status: editingBill?.status || 'UPCOMING',
      autoLogTransaction: true,
      reminderDaysBefore: 1
    };

    if (editingBill) {
      updateRecurringBill(editingBill.id, payload);
    } else {
      addRecurringBill(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

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
          className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
            <div className="flex items-center space-x-2">
              <Refresh size={20} variant="Bold" className="text-[#8964B3]" />
              <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">
                {editingBill ? 'Edit Recurring Subscription' : 'New Recurring Subscription / Bill'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
            >
              <CloseCircle size={22} variant="Broken" />
            </button>
          </div>

          {/* Quick Templates */}
          {!editingBill && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-[#6B6560] uppercase font-mono tracking-wider">
                ⚡ Quick Templates
              </label>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {templates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="px-3 py-1.5 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-medium whitespace-nowrap border-0 cursor-pointer transition-colors shrink-0 flex items-center space-x-1"
                  >
                    <span>{tmpl.icon}</span>
                    <span>{tmpl.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Bill / Subscription Name</label>
              <input
                type="text"
                required
                placeholder="E.g. Netflix, Rent, Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Amount & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Amount (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="5500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm font-mono text-[#231F1E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                >
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Savings">Savings Target</option>
                  <option value="Investments">Investments</option>
                </select>
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Payment Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {(['monthly', 'weekly', 'bi-weekly', 'quarterly', 'yearly', 'custom'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border-0 cursor-pointer transition-all ${
                      frequency === freq
                        ? 'bg-[#8964B3] text-white'
                        : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                    }`}
                  >
                    {freq === 'bi-weekly' ? '2 Weeks' : freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Interval Days if custom */}
            {frequency === 'custom' && (
              <div className="space-y-1 p-3 bg-[#F6F3FA] rounded-2xl">
                <label className="block text-xs font-semibold text-[#8964B3]">Custom Days Interval</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customIntervalDays}
                  onChange={(e) => setCustomIntervalDays(Number(e.target.value))}
                  className="w-full bg-white border-0 rounded-xl p-2.5 text-xs font-mono text-[#231F1E] focus:outline-none"
                  placeholder="E.g. 10 days"
                />
              </div>
            )}

            {/* Next Due Date & Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Next Due Date</label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                >
                  <option value="card">Debit/Credit Card 💳</option>
                  <option value="bank_transfer">Bank Transfer 🏦</option>
                  <option value="apple_pay">Apple Pay 🍎</option>
                  <option value="cash">Cash 💵</option>
                  <option value="other">Other Tag 🏷️</option>
                </select>
              </div>
            </div>

            {/* Paid By / Split Config */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Covered By / Household Split</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaidBy('Shared')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    paidBy === 'Shared' ? 'bg-[#EF713F] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  Shared (50/50)
                </button>

                <button
                  type="button"
                  onClick={() => setPaidBy('Leslie')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    paidBy === 'Leslie' ? 'bg-[#231F1E] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  {userAName} Only
                </button>

                <button
                  type="button"
                  onClick={() => setPaidBy('Asa')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    paidBy === 'Asa' ? 'bg-[#231F1E] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  {userBName} Only
                </button>
              </div>
            </div>

            {/* Notes / Details */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Notes / Account Number (Optional)</label>
              <textarea
                rows={2}
                placeholder="E.g. Meter # 45102931029 or Login email"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#8964B3] hover:bg-[#7852A4] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer shadow-md"
            >
              {editingBill ? 'Save Changes' : 'Save & Track Recurring Bill'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
