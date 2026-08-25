import React, { useState } from 'react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { RecurringBill } from '../../types';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { CreateBillModal } from './CreateBillModal';
import {
  Refresh,
  TickCircle,
  Pause,
  Play,
  Edit2,
  Trash,
  Add,
  WalletMoney,
  Card,
  Bank,
  Mobile,
  Money
} from 'iconsax-react';

export const RecurringBillsSection: React.FC = () => {
  const {
    recurringBills,
    payRecurringBill,
    togglePauseBill,
    deleteRecurringBill,
    preferences,
    currentUser,
    partnerUser
  } = useStore();

  const userAName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Leslie';
  const userBName = partnerUser?.name && !partnerUser.name.startsWith('Waiting') ? partnerUser.name.split(' ')[0] : 'Asa';

  const [activeFilter, setActiveFilter] = useState<'All' | 'Shared' | 'Individual' | 'Paused'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  const currency = preferences?.currency || '₦';

  const getUserAvatar = (name: string) => getUserAvatarUrl(name, currentUser, partnerUser);

  // Compute Total Spend metrics
  const activeBills = recurringBills.filter(b => b.status !== 'PAUSED');
  const totalMonthlySpend = activeBills.reduce((acc, b) => {
    let monthlyEquiv = b.amount;
    if (b.frequency === 'yearly') monthlyEquiv = b.amount / 12;
    if (b.frequency === 'weekly') monthlyEquiv = (b.amount * 52) / 12;
    if (b.frequency === 'bi-weekly') monthlyEquiv = (b.amount * 26) / 12;
    if (b.frequency === 'daily') monthlyEquiv = b.amount * 30;
    if (b.frequency === 'custom' && b.customIntervalDays) monthlyEquiv = (b.amount * 30) / b.customIntervalDays;
    return acc + monthlyEquiv;
  }, 0);

  const sharedSpend = activeBills.filter(b => b.paidBy === 'Shared').reduce((acc, b) => acc + b.amount, 0);
  const partnerAShared = Math.round(sharedSpend / 2);
  const partnerBShared = Math.round(sharedSpend / 2);

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

  const userAIndividualSpend = activeBills
    .filter(b => b.paidBy !== 'Shared' && isUserA(b.paidBy))
    .reduce((acc, b) => acc + b.amount, 0);

  const userBIndividualSpend = activeBills
    .filter(b => b.paidBy !== 'Shared' && isUserB(b.paidBy))
    .reduce((acc, b) => acc + b.amount, 0);

  const individualSpend = userAIndividualSpend + userBIndividualSpend;

  const filteredBills = recurringBills.filter(b => {
    if (activeFilter === 'Shared') return b.paidBy === 'Shared' && b.status !== 'PAUSED';
    if (activeFilter === 'Individual') return b.paidBy !== 'Shared' && b.status !== 'PAUSED';
    if (activeFilter === 'Paused') return b.status === 'PAUSED';
    return true;
  });

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'card': return <Card size={14} className="text-[#8964B3]" />;
      case 'bank_transfer': return <Bank size={14} className="text-[#4A7C59]" />;
      case 'apple_pay': return <Mobile size={14} className="text-[#231F1E]" />;
      case 'cash': return <Money size={14} className="text-[#EF713F]" />;
      default: return <WalletMoney size={14} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: RecurringBill['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#4A7C59] text-[10px] font-mono font-bold">Paid ✓</span>;
      case 'DUE':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-mono font-bold">Due Soon ⚡</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EF713F] text-[10px] font-mono font-bold">Overdue ⚠️</span>;
      case 'PAUSED':
        return <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-mono font-bold">Paused ⏸</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-mono font-bold">Upcoming 📅</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Spend Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Total Monthly Spend
          </span>
          <div className="font-display text-2xl font-extrabold text-[#231F1E]">
            {currency}{Math.round(totalMonthlySpend).toLocaleString()}
            <span className="text-xs font-normal text-gray-400 font-sans ml-1">/mo</span>
          </div>
          <p className="text-[11px] text-[#6B6560]">{activeBills.length} active recurring items</p>
        </div>

        {/* Shared Recurring Card */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Shared Recurring
          </span>
          <div className="font-display text-2xl font-extrabold text-[#EF713F]">
            {currency}{Math.round(sharedSpend).toLocaleString()}
          </div>
          
          {/* Partner Breakdown with Avatars */}
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

        {/* Individual Spend Card */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Individual Spend
          </span>
          <div className="font-display text-2xl font-extrabold text-[#4A7C59]">
            {currency}{Math.round(individualSpend).toLocaleString()}
          </div>

          {/* Partner Breakdown with Avatars */}
          <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1.5 text-xs text-[#6B6560]">
              <img
                src={getUserAvatar(currentUser.name)}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#EF713F]"
              />
              <span className="font-mono">{currentUser.name.split(' ')[0]}: <strong className="text-[#231F1E] font-extrabold">{currency}{userAIndividualSpend.toLocaleString()}</strong></span>
            </div>

            <span className="text-gray-300">•</span>

            <div className="flex items-center space-x-1.5 text-xs text-[#6B6560]">
              <img
                src={getUserAvatar(partnerUser.name)}
                alt={partnerUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#4A7C59]"
              />
              <span className="font-mono">{partnerUser.name.startsWith('Waiting') ? 'Partner' : partnerUser.name.split(' ')[0]}: <strong className="text-[#231F1E] font-extrabold">{currency}{userBIndividualSpend.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border-0 overflow-x-auto">
          {(['All', 'Shared', 'Individual', 'Paused'] as const).map((tab) => (
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

        <button
          onClick={() => {
            setEditingBill(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#8964B3] hover:bg-[#7852A4] text-white font-bold text-xs transition-colors border-0 cursor-pointer shrink-0 shadow-sm"
        >
          <Add size={16} variant="Linear" />
          <span>Add Subscription / Bill</span>
        </button>
      </div>

      {/* 3. Bills List */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white text-center space-y-3 border-0">
            <Refresh size={32} className="mx-auto text-gray-300 animate-spin-slow" />
            <p className="font-bold text-base text-[#231F1E]">No subscriptions under this filter</p>
            <p className="text-xs text-[#6B6560]">Tap + Add Subscription to track rent, streaming, or utility bills.</p>
          </div>
        ) : (
          filteredBills.map((bill) => (
            <motion.div
              key={bill.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-white rounded-3xl p-5 border-0 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/90 transition-all overflow-hidden"
            >
              {/* Left Info */}
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-[#F6F3FA] text-[#8964B3] flex items-center justify-center font-bold text-lg shrink-0">
                  {bill.icon || '⚡'}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="font-semibold text-base text-[#231F1E] truncate">
                      {bill.title}
                    </h3>
                    {getStatusBadge(bill.status)}
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold capitalize">
                      {bill.frequency === 'custom' ? `${bill.customIntervalDays || 30} days` : bill.frequency}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-[#6B6560] font-mono flex-wrap gap-y-1">
                    <span className="flex items-center space-x-1">
                      {getPaymentMethodIcon(bill.paymentMethod)}
                      <span className="capitalize">{bill.paymentMethod || 'Card'}</span>
                    </span>
                    <span>• Next: {formatFriendlyDate(bill.nextDueDate)}</span>
                    <span>• Covered by {bill.paidBy}</span>
                  </div>
                </div>
              </div>

              {/* Right Spend & Actions */}
              <div className="flex items-center space-x-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-right font-mono">
                  <span className="text-base font-extrabold text-[#231F1E] block">
                    {currency}{bill.amount.toLocaleString()}
                  </span>
                  {bill.lastPaidDate && (
                    <span className="text-[10px] text-gray-400 block">
                      Last paid: {formatFriendlyDate(bill.lastPaidDate)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1.5">
                  {/* Pay Now & Auto-Log Button */}
                  <button
                    onClick={() => payRecurringBill(bill.id)}
                    className="px-3 py-2 rounded-2xl bg-[#E9C277] hover:bg-[#DFAA4D] text-[#231F1E] text-xs font-bold transition-all border-0 cursor-pointer flex items-center space-x-1 shadow-xs"
                    title="Pay Now & Auto-Log to Settle-Up Balance"
                  >
                    <TickCircle size={15} variant="Bold" className="text-[#231F1E]" />
                    <span>Pay & Log</span>
                  </button>

                  {/* Pause / Resume */}
                  <button
                    onClick={() => togglePauseBill(bill.id)}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                    title={bill.status === 'PAUSED' ? 'Resume Subscription' : 'Pause Subscription'}
                  >
                    {bill.status === 'PAUSED' ? <Play size={16} variant="Linear" /> : <Pause size={16} variant="Linear" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditingBill(bill);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                    title="Edit Subscription"
                  >
                    <Edit2 size={16} variant="Linear" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteRecurringBill(bill.id)}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-0 cursor-pointer"
                    title="Delete Subscription"
                  >
                    <Trash size={16} variant="Linear" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <CreateBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBill={editingBill}
      />
    </div>
  );
};
