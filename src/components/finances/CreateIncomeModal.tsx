import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { IncomeCategory, IncomeCadence, IncomeStream } from '../../types';
import { CloseCircle, MoneySend } from 'iconsax-react';

interface CreateIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStream?: IncomeStream | null;
}

export const CreateIncomeModal: React.FC<CreateIncomeModalProps> = ({ isOpen, onClose, editingStream }) => {
  const { addIncomeStream, updateIncomeStream, currentUser, partnerUser } = useStore();

  const userAName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Leslie';
  const userBName = partnerUser?.name && !partnerUser.name.startsWith('Waiting') ? partnerUser.name.split(' ')[0] : 'Asa';

  const [title, setTitle] = useState(editingStream?.title || '');
  const [category, setCategory] = useState<IncomeCategory>(editingStream?.category || 'Salary');
  const [amount, setAmount] = useState(editingStream?.amount ? String(editingStream.amount) : '');
  const [currency, setCurrency] = useState(editingStream?.currency || '₦');
  const [cadence, setCadence] = useState<IncomeCadence>(editingStream?.cadence || 'monthly');
  const [earnedBy, setEarnedBy] = useState<string>(editingStream?.earnedBy || 'Shared');
  const [notes, setNotes] = useState(editingStream?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!title.trim() || !val || val <= 0) return;

    const payload = {
      title: title.trim(),
      category,
      amount: val,
      currency,
      cadence,
      earnedBy,
      notes: notes.trim() || undefined,
      status: 'ACTIVE' as const
    };

    if (editingStream) {
      updateIncomeStream(editingStream.id, payload);
    } else {
      addIncomeStream(payload);
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
          className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
            <div className="flex items-center space-x-2">
              <MoneySend size={20} variant="Bold" className="text-[#4A7C59]" />
              <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">
                {editingStream ? 'Edit Income Source' : 'New Household Income Source'}
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
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Income Title / Source</label>
              <input
                type="text"
                required
                placeholder="E.g. Senior Developer Salary, Design Retainer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Category & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
                >
                  <option value="Salary">Salary / Employment</option>
                  <option value="Freelance">Freelance / Retainer</option>
                  <option value="Business">Business / Side Hustle</option>
                  <option value="Dividends">Dividends / Investments</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Gift Income">Gift / Cash Support</option>
                  <option value="Crypto/Investments">Crypto / Crypto Yield</option>
                  <option value="Other">Other Income</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
                >
                  <option value="₦">NGN (₦)</option>
                  <option value="$">USD ($)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Amount & Cadence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Amount ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="1500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs font-mono text-[#231F1E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Cadence / Frequency</label>
                <select
                  value={cadence}
                  onChange={(e) => setCadence(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none capitalize"
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-weekly (2 Weeks)</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-off">One-off / Irregular</option>
                </select>
              </div>
            </div>

            {/* Earner / Recipient */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Who Earns This Income?</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEarnedBy('Joint')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    earnedBy === 'Joint' ? 'bg-[#4A7C59] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  Joint Household
                </button>

                <button
                  type="button"
                  onClick={() => setEarnedBy(userAName)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    earnedBy === userAName || earnedBy === currentUser?.name || (userAName === 'Leslie' && earnedBy === 'Leslie') ? 'bg-[#231F1E] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  {userAName}
                </button>

                <button
                  type="button"
                  onClick={() => setEarnedBy(userBName)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    earnedBy === userBName || earnedBy === partnerUser?.name || (userBName === 'Asa' && earnedBy === 'Asa') ? 'bg-[#231F1E] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  {userBName}
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Notes (Optional)</label>
              <input
                type="text"
                placeholder="E.g. Payday 25th of every month"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#4A7C59] hover:bg-[#3D6849] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer shadow-md"
            >
              {editingStream ? 'Save Income Changes' : 'Save & Track Income Source'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
