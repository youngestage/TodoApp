import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { IncomeStream } from '../../types';
import { CreateIncomeModal } from './CreateIncomeModal';
import {
  Add,
  Edit2,
  MoneySend,
  TickCircle,
  Trash,
  TrendUp,
  Award,
  Wallet3
} from 'iconsax-react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';

export const IncomeSection: React.FC = () => {
  const {
    incomeStreams,
    logIncomePayout,
    deleteIncomeStream,
    preferences,
    currentUser,
    partnerUser
  } = useStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<IncomeStream | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Leslie' | 'Asa' | 'Joint'>('All');

  const currency = preferences?.currency || '₦';

  const getUserAvatar = (name: string) => getUserAvatarUrl(name, currentUser, partnerUser);

  const activeStreams = incomeStreams.filter(i => i.status !== 'PAUSED');
  const totalMonthlyIncome = activeStreams.reduce((acc, i) => acc + i.amount, 0);

  const leslieIncome = activeStreams
    .filter(i => i.earnedBy === 'Leslie' || i.earnedBy === currentUser.name)
    .reduce((acc, i) => acc + i.amount, 0);

  const asaIncome = activeStreams
    .filter(i => i.earnedBy === 'Asa' || i.earnedBy === partnerUser.name)
    .reduce((acc, i) => acc + i.amount, 0);

  const jointIncome = activeStreams
    .filter(i => i.earnedBy === 'Joint')
    .reduce((acc, i) => acc + i.amount, 0);

  const filteredStreams = activeStreams.filter(i => {
    if (activeFilter === 'Leslie') return i.earnedBy === 'Leslie' || i.earnedBy === currentUser.name;
    if (activeFilter === 'Asa') return i.earnedBy === 'Asa' || i.earnedBy === partnerUser.name;
    if (activeFilter === 'Joint') return i.earnedBy === 'Joint';
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* 1. Summary Spend & Income Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Household Income */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Total Household Income
          </span>
          <div className="font-display text-2xl font-extrabold text-[#4A7C59]">
            {currency}{Math.round(totalMonthlyIncome).toLocaleString()}/mo
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#8964B3] font-mono">
            <TrendUp size={16} variant="Bold" />
            <span>Combined Household Earnings</span>
          </div>
        </div>

        {/* Partner A vs Partner B Breakdown */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Partner Earnings Split
          </span>
          <div className="font-display text-xl font-extrabold text-[#231F1E] flex items-center justify-between">
            <span>{currency}{leslieIncome.toLocaleString()}</span>
            <span className="text-gray-300 font-normal">|</span>
            <span>{currency}{asaIncome.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-[#6B6560]">
            <div className="flex items-center space-x-1.5">
              <img
                src={getUserAvatar(currentUser.name)}
                alt={currentUser.name}
                className="w-4 h-4 rounded-full object-cover border border-[#EF713F]"
              />
              <span className="font-mono">{currentUser.name.split(' ')[0]}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <img
                src={getUserAvatar(partnerUser.name)}
                alt={partnerUser.name}
                className="w-4 h-4 rounded-full object-cover border border-[#4A7C59]"
              />
              <span className="font-mono">{partnerUser.name.startsWith('Waiting') ? 'Partner' : partnerUser.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Joint Business Income */}
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Joint Business & Side Hustles
          </span>
          <div className="font-display text-2xl font-extrabold text-[#EF713F]">
            {currency}{Math.round(jointIncome).toLocaleString()}/mo
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#6B6560] font-mono">
            <Award size={16} variant="Bold" className="text-[#E9C277]" />
            <span>Shared Business Revenue</span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F3EF] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#231F1E]">
              Income Streams & Payout Logs
            </h2>
            <p className="text-xs text-[#6B6560]">
              Track salaries, freelancing, business side hustles & log cash payouts
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1 bg-[#FBF9F5] p-1 rounded-2xl">
              {(['All', 'Leslie', 'Asa', 'Joint'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                    activeFilter === tab ? 'bg-[#231F1E] text-white' : 'text-[#6B6560]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingStream(null);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#4A7C59] hover:bg-[#3D6849] text-white font-bold text-xs transition-colors border-0 cursor-pointer shadow-sm"
            >
              <Add size={16} variant="Linear" />
              <span>+ Add Income Source</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Income Streams List */}
      <div className="space-y-3">
        {filteredStreams.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white text-center space-y-3 border-0">
            <MoneySend size={36} className="mx-auto text-gray-300" />
            <p className="font-bold text-base text-[#231F1E]">No income streams under this filter</p>
            <p className="text-xs text-[#6B6560]">Tap + Add Income Source to track salaries, freelance, or business revenue.</p>
          </div>
        ) : (
          filteredStreams.map((stream) => {
            const streamCurrency = stream.currency || currency;

            return (
              <motion.div
                key={stream.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-3 hover:bg-white/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#F0F7F2] text-[#4A7C59] flex items-center justify-center text-xl shrink-0 font-bold">
                    💵
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-bold text-base text-[#231F1E] truncate">
                        {stream.title}
                      </h3>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#F0F7F2] text-[#4A7C59] text-[10px] font-mono font-bold">
                        {stream.category}
                      </span>

                      <span className="px-2 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold capitalize">
                        {stream.cadence}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#6B6560] font-mono">
                      <img
                        src={getUserAvatar(stream.earnedBy)}
                        alt={stream.earnedBy}
                        className="w-4 h-4 rounded-full object-cover border border-[#4A7C59]"
                      />
                      <span>Earned by: <strong className="text-[#231F1E]">{stream.earnedBy}</strong></span>
                      {stream.notes && <span>• {stream.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right font-mono">
                    <span className="text-lg font-extrabold text-[#4A7C59] block">
                      {streamCurrency}{stream.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 block capitalize">
                      {stream.cadence} payout
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => logIncomePayout(stream.id)}
                      className="px-3.5 py-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3D6849] text-white text-xs font-bold transition-all border-0 cursor-pointer flex items-center space-x-1 shadow-xs"
                    >
                      <TickCircle size={15} variant="Bold" />
                      <span>Log Payout</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingStream(stream);
                        setIsCreateOpen(true);
                      }}
                      className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                      title="Edit Income Source"
                    >
                      <Edit2 size={16} variant="Linear" />
                    </button>

                    <button
                      onClick={() => deleteIncomeStream(stream.id)}
                      className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border-0 cursor-pointer"
                      title="Delete Income Source"
                    >
                      <Trash size={16} variant="Linear" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <CreateIncomeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        editingStream={editingStream}
      />
    </div>
  );
};
