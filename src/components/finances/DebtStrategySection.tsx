import React, { useState } from 'react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { DebtAccount } from '../../types';
import { simulatePayoffStrategy } from '../../utils/debtEngine';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { CreateDebtModal } from './CreateDebtModal';
import { LogDebtPaymentModal } from './LogDebtPaymentModal';
import {
  Add,
  Danger,
  Edit2,
  Trash,
  TickCircle,
  TrendUp,
  Award,
  Wallet3
} from 'iconsax-react';

export const DebtStrategySection: React.FC = () => {
  const {
    debtAccounts,
    debtStrategy,
    extraDebtContribution,
    updateDebtConfig,
    deleteDebtAccount,
    preferences,
    currentUser,
    partnerUser
  } = useStore();

  const userAName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Leslie';
  const userBName = partnerUser?.name && !partnerUser.name.startsWith('Waiting') ? partnerUser.name.split(' ')[0] : 'Asa';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtAccount | null>(null);
  const [loggingPaymentDebt, setLoggingPaymentDebt] = useState<DebtAccount | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Shared' | 'Individual'>('All');

  const currency = preferences?.currency || '₦';

  const getUserAvatar = (name: string) => getUserAvatarUrl(name, currentUser, partnerUser);

  const activeDebts = debtAccounts.filter(d => d.status !== 'PAID_OFF');
  const totalDebtBalance = activeDebts.reduce((acc, d) => acc + d.balance, 0);

  const sharedDebts = activeDebts.filter(d => d.paidBy === 'Shared');
  const sharedTotal = sharedDebts.reduce((acc, d) => acc + d.balance, 0);
  const partnerAShared = Math.round(sharedTotal / 2);
  const partnerBShared = Math.round(sharedTotal / 2);

  const isUserA = (name?: string) => {
    if (!name) return false;
    if (name === currentUser.name || name === userAName) return true;
    if (userAName === 'Leslie' && name === 'Leslie') return true;
    return false;
  };

  const isUserB = (name?: string) => {
    if (!name) return false;
    if (name === partnerUser.name || name === userBName) return true;
    if (userBName === 'Asa' && name === 'Asa') return true;
    return false;
  };

  const userAIndivDebt = activeDebts
    .filter(d => d.paidBy !== 'Shared' && isUserA(d.paidBy))
    .reduce((acc, d) => acc + d.balance, 0);

  const userBIndivDebt = activeDebts
    .filter(d => d.paidBy !== 'Shared' && isUserB(d.paidBy))
    .reduce((acc, d) => acc + d.balance, 0);

  const indivTotal = userAIndivDebt + userBIndivDebt;

  // Run strategy simulation
  const simResult = simulatePayoffStrategy(activeDebts, extraDebtContribution, debtStrategy);
  const avalancheResult = simulatePayoffStrategy(activeDebts, extraDebtContribution, 'Avalanche');
  const snowballResult = simulatePayoffStrategy(activeDebts, extraDebtContribution, 'Snowball');
  const interestSavedVsSnowball = Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid);

  const filteredDebts = activeDebts.filter(d => {
    if (activeFilter === 'Shared') return d.paidBy === 'Shared';
    if (activeFilter === 'Individual') return d.paidBy !== 'Shared';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Summary Spend Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Total Household Debt
          </span>
          <div className="font-display text-2xl font-extrabold text-[#231F1E]">
            {currency}{Math.round(totalDebtBalance).toLocaleString()}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#8964B3] font-mono font-semibold">
            <Award size={16} variant="Bold" />
            <span>Freedom Date: {simResult.payoffDateStr}</span>
          </div>
        </div>

        {/* Shared Debts Card */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Shared Joint Debt
          </span>
          <div className="font-display text-2xl font-extrabold text-[#EF713F]">
            {currency}{Math.round(sharedTotal).toLocaleString()}
          </div>

          <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B6560]">
              <img
                src={getUserAvatar(currentUser.name)}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#EF713F]"
              />
              <span className="font-mono">{currentUser.name.split(' ')[0]}: <strong className="text-[#231F1E] font-extrabold">{currency}{partnerAShared.toLocaleString()}</strong></span>
            </div>

            <span className="text-gray-300">•</span>

            <div className="flex items-center space-x-1.5 text-xs text-[#6B6560]">
              <img
                src={getUserAvatar(partnerUser.name)}
                alt={partnerUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#4A7C59]"
              />
              <span className="font-mono">{partnerUser.name.startsWith('Waiting') ? 'Partner' : partnerUser.name.split(' ')[0]}: <strong className="text-[#231F1E] font-extrabold">{currency}{partnerBShared.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Individual Debts Card */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Individual Debts
          </span>
          <div className="font-display text-2xl font-extrabold text-[#4A7C59]">
            {currency}{Math.round(indivTotal).toLocaleString()}
          </div>

          <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B6560]">
              <img
                src={getUserAvatar(currentUser.name)}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#EF713F]"
              />
              <span className="font-mono">{currentUser.name.split(' ')[0]}: <strong className="text-[#231F1E] font-extrabold">{currency}{userAIndivDebt.toLocaleString()}</strong></span>
            </div>

            <span className="text-gray-300">•</span>

            <div className="flex items-center space-x-1.5 text-xs text-[#6B6560]">
              <img
                src={getUserAvatar(partnerUser.name)}
                alt={partnerUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#4A7C59]"
              />
              <span className="font-mono">{partnerUser.name.startsWith('Waiting') ? 'Partner' : partnerUser.name.split(' ')[0]}: <strong className="text-[#231F1E] font-extrabold">{currency}{userBIndivDebt.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Strategy Engine Control Bar */}
      <div className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F3EF] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#231F1E]">
              Payoff Strategy Engine & Extra Contribution
            </h2>
            <p className="text-xs text-[#6B6560]">
              Normalize rates & compare Avalanche (Highest APR) vs Snowball (Lowest Balance)
            </p>
          </div>

          <button
            onClick={() => {
              setEditingDebt(null);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer shrink-0 shadow-sm"
          >
            <Add size={16} variant="Linear" />
            <span>Add Debt / Loan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Strategy Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6B6560]">Payoff Order Strategy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateDebtConfig('Avalanche', extraDebtContribution)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center space-x-1 ${
                  debtStrategy === 'Avalanche'
                    ? 'bg-[#8964B3] text-white shadow-sm'
                    : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                }`}
              >
                <span>🏔️ Avalanche (Highest APR)</span>
              </button>

              <button
                type="button"
                onClick={() => updateDebtConfig('Snowball', extraDebtContribution)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center space-x-1 ${
                  debtStrategy === 'Snowball'
                    ? 'bg-[#4A7C59] text-white shadow-sm'
                    : 'bg-[#FBF9F5] text-[#6B6560] hover:bg-[#F5F3EF]'
                }`}
              >
                <span>❄️ Snowball (Lowest Balance)</span>
              </button>
            </div>
          </div>

          {/* Extra Contribution Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#6B6560]">Extra Monthly Acceleration</label>
              <span className="font-mono font-bold text-[#EF713F]">{currency}{extraDebtContribution.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={extraDebtContribution}
              onChange={(e) => updateDebtConfig(debtStrategy, Number(e.target.value))}
              className="w-full accent-[#EF713F] cursor-pointer"
            />
          </div>
        </div>

        {/* Strategy Impact Banner */}
        {debtStrategy === 'Avalanche' && interestSavedVsSnowball > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#F6F3FA] border border-[#E8DEF2] flex items-center space-x-2 text-xs text-[#8964B3] font-mono">
            <TrendUp size={16} variant="Bold" className="shrink-0 text-[#8964B3]" />
            <span>
              Avalanche strategy saves <strong>{currency}{interestSavedVsSnowball.toLocaleString()}</strong> in interest vs Snowball!
            </span>
          </div>
        )}
      </div>

      {/* 3. Gamified Payoff Timeline Visualizer ("Debts Falling Off") */}
      {simResult.debtsTimeline.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-3">
          <h3 className="font-bold text-sm text-[#231F1E] flex items-center space-x-1.5">
            <span>🚀 Projected Debt Elimination Order ({debtStrategy})</span>
          </h3>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {simResult.debtsTimeline.map((item, idx) => (
              <div
                key={item.debtId}
                className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-[#F0ECE1] shrink-0 w-48 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-[#EF713F] text-white text-[10px] font-mono font-extrabold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-[#8964B3] font-bold">
                    Cleared {item.eliminatedDateStr}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#231F1E] truncate">{item.debtName}</h4>
                <p className="text-[10px] text-[#6B6560] font-mono">Month {item.eliminatedInMonth} of plan</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Debts Filter & List */}
      <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto w-fit">
        {(['All', 'Shared', 'Individual'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
              activeFilter === tab
                ? 'bg-[#231F1E] text-white'
                : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white text-center space-y-3 border-0">
            <Wallet3 size={32} className="mx-auto text-gray-300" />
            <p className="font-bold text-base text-[#231F1E]">No active debts under this filter 🎉</p>
            <p className="text-xs text-[#6B6560]">You're currently debt free! Tap + Add Debt / Loan to track new accounts.</p>
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const isHighAPR = debt.effectiveAPR >= 50;
            const percentagePaid = debt.principalAmount > 0 
              ? Math.min(100, Math.round(((debt.principalAmount - debt.balance) / debt.principalAmount) * 100))
              : 0;

            return (
              <motion.div
                key={debt.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-3 hover:bg-white/90 transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center font-bold text-lg shrink-0">
                      🏛️
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-semibold text-base text-[#231F1E] truncate">
                          {debt.name}
                        </h3>

                        {isHighAPR ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EF713F] text-[10px] font-mono font-bold flex items-center space-x-1">
                            <Danger size={12} variant="Bold" />
                            <span>{debt.effectiveAPR}% APR High Warning</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#4A7C59] text-[10px] font-mono font-bold">
                            {debt.effectiveAPR}% APR
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold capitalize">
                          {debt.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-[#6B6560] font-mono flex-wrap gap-y-1">
                        <span>Lender: {debt.lenderName || 'Direct'}</span>
                        <span>• Next Due: {formatFriendlyDate(debt.nextDueDate || '')}</span>
                        <span>• Covered by {debt.paidBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Spend & Actions */}
                  <div className="flex items-center space-x-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right font-mono">
                      <span className="text-base font-extrabold text-[#EF713F] block">
                        {currency}{debt.balance.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Min: {currency}{debt.minimumPayment.toLocaleString()}/mo
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setLoggingPaymentDebt(debt)}
                        className="px-3.5 py-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3D6849] text-white text-xs font-bold transition-all border-0 cursor-pointer flex items-center space-x-1 shadow-xs"
                      >
                        <TickCircle size={15} variant="Bold" className="text-white" />
                        <span>Log Payment</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingDebt(debt);
                          setIsCreateOpen(true);
                        }}
                        className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                        title="Edit Debt"
                      >
                        <Edit2 size={16} variant="Linear" />
                      </button>

                      <button
                        onClick={() => deleteDebtAccount(debt.id)}
                        className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-0 cursor-pointer"
                        title="Delete Debt"
                      >
                        <Trash size={16} variant="Linear" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {debt.principalAmount > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#6B6560]">
                      <span>Paid: {percentagePaid}%</span>
                      <span>Original: {currency}{debt.principalAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#EF713F] to-[#4A7C59] transition-all duration-300"
                        style={{ width: `${percentagePaid}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateDebtModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        editingDebt={editingDebt}
      />

      <LogDebtPaymentModal
        debt={loggingPaymentDebt}
        isOpen={!!loggingPaymentDebt}
        onClose={() => setLoggingPaymentDebt(null)}
      />
    </div>
  );
};
