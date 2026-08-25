import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { GoalCategory, GoalCadence, GoalOwnership, SavingsGoal } from '../../types';
import { calculateRequiredContribution } from '../../utils/savingsEngine';
import { CloseCircle, Cup, DirectNotification, InfoCircle } from 'iconsax-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: SavingsGoal | null;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose, editingGoal }) => {
  const { addSavingsGoal, updateSavingsGoal } = useStore();

  const [name, setName] = useState(editingGoal?.name || '');
  const [icon, setIcon] = useState(editingGoal?.icon || '🎯');
  const [category, setCategory] = useState<GoalCategory>(editingGoal?.category || 'General' as any);
  const [targetAmount, setTargetAmount] = useState(editingGoal?.targetAmount ? String(editingGoal.targetAmount) : '');
  const [startingBalance, setStartingBalance] = useState(editingGoal?.startingBalance ? String(editingGoal.startingBalance) : '0');
  const [currency, setCurrency] = useState(editingGoal?.currency || '₦');
  const [targetDate, setTargetDate] = useState(editingGoal?.targetDate || '');
  const [cadence, setCadence] = useState<GoalCadence>(editingGoal?.cadence || 'monthly');
  const [externalStorageNote, setExternalStorageNote] = useState(editingGoal?.externalStorageNote || '');
  const [ownership, setOwnership] = useState<GoalOwnership>(editingGoal?.ownership || 'joint');
  const [isPrivate, setIsPrivate] = useState(editingGoal?.isPrivate || false);

  const presets = [
    { name: 'Japa Relocation & Visa', icon: '✈️', category: 'Japa' as const, storage: 'PiggyVest SafeLock (15% p.a.)' },
    { name: 'Wedding & Reception', icon: '💍', category: 'Wedding' as const, storage: 'Cowrywise Mutual Fund' },
    { name: 'House Rent Renewal', icon: '🏠', category: 'Rent' as const, storage: 'Kuda Target Savings' },
    { name: 'Emergency Umbrella Pot', icon: '☂️', category: 'Emergency' as const, storage: 'PiggyVest Flex NGN' },
    { name: 'New Car Purchase', icon: '🚗', category: 'New Car' as const, storage: 'Bank Fixed Deposit' },
    { name: 'Anniversary Vacation', icon: '🌴', category: 'Travel' as const, storage: 'Dollar Vault (USD)' }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setIcon(p.icon);
    setCategory(p.category);
    setExternalStorageNote(p.storage);
  };

  const currentVal = parseFloat(startingBalance) || 0;
  const targetVal = parseFloat(targetAmount) || 0;
  const suggestedRate = calculateRequiredContribution(targetVal, currentVal, targetDate, cadence);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetVal <= 0) return;

    const payload = {
      name: name.trim(),
      icon: icon || '🎯',
      category,
      targetAmount: targetVal,
      startingBalance: currentVal,
      currentAmount: editingGoal ? editingGoal.currentAmount : currentVal,
      currency,
      targetDate: targetDate || undefined,
      cadence,
      suggestedContribution: suggestedRate,
      ownership,
      externalStorageNote: externalStorageNote.trim() || undefined,
      isPrivate
    };

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, payload);
    } else {
      addSavingsGoal(payload);
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
              <Cup size={20} variant="Bold" className="text-[#4A7C59]" />
              <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">
                {editingGoal ? 'Edit Savings Goal' : 'Create Couple or Household Savings Goal'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
            >
              <CloseCircle size={22} variant="Broken" />
            </button>
          </div>

          {/* Presets */}
          {!editingGoal && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-[#6B6560] uppercase font-mono tracking-wider">
                🎯 Nigerian & Couple Savings Presets
              </label>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-medium whitespace-nowrap border-0 cursor-pointer transition-colors shrink-0 flex items-center space-x-1.5"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Name & Emoji Icon */}
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1 col-span-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Emoji Icon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-center text-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1 col-span-3">
                <label className="block text-xs font-semibold text-[#6B6560]">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Japa Relocation Fund, Rent 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                />
              </div>
            </div>

            {/* Category & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
                >
                  <option value="Wedding">Wedding & Ceremony</option>
                  <option value="Japa">Japa & Visa Relocation</option>
                  <option value="Rent">House Rent Renewal</option>
                  <option value="New Car">New Vehicle / Car</option>
                  <option value="Emergency">Emergency Umbrella</option>
                  <option value="Travel">Vacation & Travel</option>
                  <option value="Education">Education & Tuitions</option>
                  <option value="Gift">Gift & Surprise Pot</option>
                  <option value="Custom">Custom Goal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
                >
                  <option value="₦">NGN (₦ - Naira)</option>
                  <option value="$">USD ($ - Dollars)</option>
                  <option value="£">GBP (£ - Pounds)</option>
                </select>
              </div>
            </div>

            {/* Target Amount & Starting Balance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Target Amount ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="5000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs font-mono text-[#231F1E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Starting Balance ({currency})</label>
                <input
                  type="number"
                  placeholder="0"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs font-mono text-[#231F1E] focus:outline-none"
                />
              </div>
            </div>

            {/* Cadence & Target Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Savings Cadence</label>
                <select
                  value={cadence}
                  onChange={(e) => setCadence(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none capitalize"
                >
                  <option value="monthly">Monthly Target</option>
                  <option value="weekly">Weekly Target</option>
                  <option value="bi-weekly">Bi-weekly (2 Weeks)</option>
                  <option value="daily">Daily Target</option>
                  <option value="manual">Manual / As You Can</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Target Deadline Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
                />
              </div>
            </div>

            {/* PiggyVest Target Savings Math Banner */}
            {suggestedRate > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#F0F7F2] border border-[#D5EAD9] flex items-center space-x-2 text-xs text-[#4A7C59]">
                <InfoCircle size={16} variant="Bold" className="shrink-0" />
                <span className="font-mono text-[11px]">
                  Target Savings Rate: <strong>{currency}{suggestedRate.toLocaleString()} / {cadence}</strong> needed to hit deadline!
                </span>
              </div>
            )}

            {/* Yield / External Storage Location Note */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">
                Physical Money Storage / Yield Note
              </label>
              <input
                type="text"
                placeholder="E.g. High-Yield Savings Account or Mutual Fund"
                value={externalStorageNote}
                onChange={(e) => setExternalStorageNote(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Ownership Scope & Privacy */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Who Contributes?</label>
                <select
                  value={ownership}
                  onChange={(e) => setOwnership(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
                >
                  <option value="joint">Joint / Couple Shared</option>
                  <option value="individual">Individual Personal</option>
                  <option value="household">Household Group (Ajo Mode)</option>
                </select>
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center space-x-2 p-3 bg-[#FBF9F5] rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded accent-[#4A7C59]"
                  />
                  <span className="text-xs text-[#6B6560] font-medium">Keep Private</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#4A7C59] hover:bg-[#3D6849] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer shadow-md"
            >
              {editingGoal ? 'Save Goal Changes' : 'Create & Start Saving Goal'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
