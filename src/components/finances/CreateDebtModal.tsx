import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { DebtCategory, DebtRateType, DebtRepaymentFrequency, DebtAccount } from '../../types';
import { calculateEffectiveAPR } from '../../utils/debtEngine';
import { CloseCircle, Danger, Wallet3 } from 'iconsax-react';

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDebt?: DebtAccount | null;
}

export const CreateDebtModal: React.FC<CreateDebtModalProps> = ({ isOpen, onClose, editingDebt }) => {
  const { addDebtAccount, updateDebtAccount, currentUser, partnerUser } = useStore();

  const userAName = currentUser?.name ? currentUser.name.split(' ')[0] : 'You';
  const userBName = partnerUser?.name && !partnerUser.name.startsWith('Waiting') ? partnerUser.name.split(' ')[0] : 'Partner';

  const [name, setName] = useState(editingDebt?.name || '');
  const [category, setCategory] = useState<DebtCategory>(editingDebt?.category || 'bank_loan');
  const [lenderName, setLenderName] = useState(editingDebt?.lenderName || '');
  const [principalAmount, setPrincipalAmount] = useState(editingDebt?.principalAmount ? String(editingDebt.principalAmount) : '');
  const [balance, setBalance] = useState(editingDebt?.balance ? String(editingDebt.balance) : '');
  const [rateType, setRateType] = useState<DebtRateType>(editingDebt?.rateType || 'flat_monthly');
  const [interestRate, setInterestRate] = useState(editingDebt?.interestRate ? String(editingDebt.interestRate) : '5');
  const [repaymentFrequency, setRepaymentFrequency] = useState<DebtRepaymentFrequency>(editingDebt?.repaymentFrequency || 'monthly');
  const [minimumPayment, setMinimumPayment] = useState(editingDebt?.minimumPayment ? String(editingDebt.minimumPayment) : '');
  const [nextDueDate, setNextDueDate] = useState(editingDebt?.nextDueDate || new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<string>(editingDebt?.paidBy || 'Shared');
  const [isPrivate, setIsPrivate] = useState(editingDebt?.isPrivate || false);
  const [notes, setNotes] = useState(editingDebt?.notes || '');

  // Calculate live effective APR
  const liveAPR = calculateEffectiveAPR(parseFloat(interestRate) || 0, rateType);

  const presets = [
    { name: 'Carbon Loan', category: 'digital_app' as const, lender: 'Carbon', rateType: 'flat_monthly' as const, rate: '5.0' },
    { name: 'GTBank QuickCredit', category: 'bank_loan' as const, lender: 'GTBank', rateType: 'flat_monthly' as const, rate: '2.8' },
    { name: 'FairMoney Loan', category: 'microfinance' as const, lender: 'FairMoney', rateType: 'flat_monthly' as const, rate: '4.0' },
    { name: 'Kuda Overdraft', category: 'digital_app' as const, lender: 'Kuda MFB', rateType: 'daily_rate' as const, rate: '0.075' },
    { name: 'Cooperative Society Loan', category: 'cooperative' as const, lender: 'Workplace Coop', rateType: 'reducing_balance' as const, rate: '2.0' },
    { name: 'Ajo / Esusu Contribution', category: 'ajo_esusu' as const, lender: 'Ajo Group', rateType: 'zero_interest' as const, rate: '0' }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setLenderName(preset.lender);
    setRateType(preset.rateType);
    setInterestRate(preset.rate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !balance || parseFloat(balance) <= 0) return;

    const principal = principalAmount ? parseFloat(principalAmount) : parseFloat(balance);
    const minPay = minimumPayment ? parseFloat(minimumPayment) : Math.max(1000, Math.round(parseFloat(balance) * 0.1));

    const payload = {
      name: name.trim(),
      category,
      lenderName: lenderName.trim() || undefined,
      principalAmount: principal,
      balance: parseFloat(balance),
      rateType,
      interestRate: parseFloat(interestRate) || 0,
      repaymentFrequency,
      minimumPayment: minPay,
      nextDueDate,
      paidBy,
      isPrivate,
      notes
    };

    if (editingDebt) {
      updateDebtAccount(editingDebt.id, payload);
    } else {
      addDebtAccount(payload);
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
              <Wallet3 size={20} variant="Bold" className="text-[#EF713F]" />
              <h2 className="font-zodiak text-xl font-bold text-[#231F1E]">
                {editingDebt ? 'Edit Debt / Loan' : 'New Debt, Loan, or Ajo Contribution'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#6B6560] hover:text-[#231F1E] transition-colors border-0 bg-transparent cursor-pointer"
            >
              <CloseCircle size={22} variant="Broken" />
            </button>
          </div>

          {/* Preset Lender Selector */}
          {!editingDebt && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-[#6B6560] uppercase font-mono tracking-wider">
                🇳🇬 Quick Lender & Informal Presets
              </label>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] text-xs font-medium whitespace-nowrap border-0 cursor-pointer transition-colors shrink-0 flex items-center space-x-1"
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Debt Name & Lender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Debt Nickname</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Carbon Loan, Ajo 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Lender / Provider Name</label>
                <input
                  type="text"
                  placeholder="E.g. GTBank, Carbon, Cooperative"
                  value={lenderName}
                  onChange={(e) => setLenderName(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Loan Category / Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none"
              >
                <option value="bank_loan">Bank Loan (GTBank, UBA, Zenith, FirstBank)</option>
                <option value="microfinance">Microfinance Bank Loan (Renmoney, FairMoney)</option>
                <option value="digital_app">Digital Loan App (Carbon, Branch, PalmCredit, Aella)</option>
                <option value="cooperative">Cooperative / Thrift Society Loan</option>
                <option value="ajo_esusu">Ajo / Esusu / Adashe Contribution (Informal)</option>
                <option value="personal_family">Personal / Family Loan</option>
                <option value="bnpl">BNPL / Paylater Purchase</option>
                <option value="salary_advance">Salary Advance / Deduction</option>
                <option value="credit_card">Credit Card Balance</option>
                <option value="other">Other Debt</option>
              </select>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Original Principal (₦)</label>
                <input
                  type="number"
                  placeholder="150000"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs font-mono text-[#231F1E] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Current Balance (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="120000"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs font-mono text-[#231F1E] focus:outline-none"
                />
              </div>
            </div>

            {/* Interest Rate & Type */}
            <div className="space-y-2 p-3.5 bg-[#FFF5F0] rounded-2xl border border-[#FFE8DC]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#EF713F]">Rate Calculation Type</label>
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as any)}
                    className="w-full bg-white border-0 rounded-xl p-2.5 text-xs text-[#231F1E] focus:outline-none"
                  >
                    <option value="flat_monthly">Flat Monthly Rate (%/mo)</option>
                    <option value="reducing_balance">Reducing Balance (%/mo)</option>
                    <option value="daily_rate">Daily Rate (%/day)</option>
                    <option value="zero_interest">Zero Interest (0%)</option>
                  </select>
                </div>

                {rateType !== 'zero_interest' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#EF713F]">Quoted Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full bg-white border-0 rounded-xl p-2.5 text-xs font-mono text-[#231F1E] focus:outline-none"
                      placeholder="E.g. 5"
                    />
                  </div>
                )}
              </div>

              {/* Live Auto-APR Financial Literacy Banner */}
              <div className="flex items-center space-x-2 pt-1 text-xs text-[#EF713F]">
                <Danger size={16} variant="Bold" className="shrink-0" />
                <span className="font-mono text-[11px] font-semibold">
                  Real Annualized APR: <strong className="text-base font-extrabold">{liveAPR}% APR</strong>
                  {liveAPR >= 50 && ' ⚠️ High Interest Loan!'}
                </span>
              </div>
            </div>

            {/* Minimum Payment & Next Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Minimum Installment (₦)</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs font-mono text-[#231F1E] focus:outline-none"
                />
              </div>

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
            </div>

            {/* Paid By / Ownership */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Who Covers This Debt?</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaidBy('Shared')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    paidBy === 'Shared' ? 'bg-[#EF713F] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  Joint / Shared
                </button>

                <button
                  type="button"
                  onClick={() => setPaidBy(userAName)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    paidBy === userAName || paidBy === currentUser?.name ? 'bg-[#231F1E] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  {userAName} Only
                </button>

                <button
                  type="button"
                  onClick={() => setPaidBy(userBName)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all ${
                    paidBy === userBName || paidBy === partnerUser?.name ? 'bg-[#231F1E] text-white' : 'bg-[#FBF9F5] text-[#6B6560]'
                  }`}
                >
                  {userBName} Only
                </button>
              </div>
            </div>

            {/* Repayment Frequency & Privacy */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#6B6560]">Repayment Frequency</label>
                <select
                  value={repaymentFrequency}
                  onChange={(e) => setRepaymentFrequency(e.target.value as any)}
                  className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs sm:text-sm text-[#231F1E] focus:outline-none capitalize"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly (2 Weeks)</option>
                  <option value="daily">Daily Deductions</option>
                  <option value="lump_sum">Lump Sum / Balloon</option>
                </select>
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center space-x-2 p-3 bg-[#FBF9F5] rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded accent-[#EF713F]"
                  />
                  <span className="text-xs text-[#6B6560] font-medium">Keep Private</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#6B6560]">Notes / Loan Account Number (Optional)</label>
              <input
                type="text"
                placeholder="E.g. Loan ID # 94021940 or Lender contact"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FBF9F5] border-0 rounded-xl p-3 text-xs text-[#231F1E] focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#EF713F] hover:bg-[#D95220] text-white font-semibold rounded-2xl text-xs sm:text-sm border-0 transition-all cursor-pointer shadow-md"
            >
              {editingDebt ? 'Save Debt Changes' : 'Save & Track Debt Payoff'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
