import React, { useState } from 'react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { SavingsGoal } from '../../types';
import { calculateGoalPace } from '../../utils/savingsEngine';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { sendPushNotification } from '../../utils/notifications';
import { CreateGoalModal } from './CreateGoalModal';
import { LogContributionModal } from './LogContributionModal';
import {
  Add,
  Archive,
  Cup,
  Edit2,
  NotificationCircle,
  TickCircle,
  Trash,
  TrendUp,
  Award,
  Wallet3
} from 'iconsax-react';

export const SavingsGoalsSection: React.FC = () => {
  const {
    savingsGoals,
    deleteSavingsGoal,
    archiveSavingsGoal,
    preferences,
    currentUser,
    partnerUser
  } = useStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [activeTab, setActiveTab] = useState<'Active' | 'Archived'>('Active');

  const defaultCurrency = preferences?.currency || '₦';

  const getUserAvatar = (name: string) => getUserAvatarUrl(name, currentUser, partnerUser);

  const activeGoals = savingsGoals.filter((g) => g.status === 'ACTIVE');
  const archivedGoals = savingsGoals.filter((g) => g.status === 'ARCHIVED' || g.status === 'COMPLETED');

  const totalSavedAcrossGoals = activeGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalTargetAcrossGoals = activeGoals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalPacePerMonth = activeGoals.reduce((acc, g) => acc + (g.suggestedContribution || 0), 0);

  const handleNudgePartner = (goal: SavingsGoal) => {
    const partnerName = partnerUser?.name || 'Partner';
    sendPushNotification(
      'Savings Goal Nudge! 🔔',
      `${currentUser?.name} sent a friendly reminder to contribute towards "${goal.name}"`
    );
  };

  const displayedGoals = activeTab === 'Active' ? activeGoals : archivedGoals;

  return (
    <div className="space-y-6">
      {/* 1. Summary Spend & Savings Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Total Saved Across Goals
          </span>
          <div className="font-display text-2xl font-extrabold text-[#4A7C59]">
            {defaultCurrency}{Math.round(totalSavedAcrossGoals).toLocaleString()}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#6B6560] font-mono">
            <Award size={16} variant="Bold" className="text-[#E9C277]" />
            <span>Target Total: {defaultCurrency}{Math.round(totalTargetAcrossGoals).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Monthly Target Pace
          </span>
          <div className="font-display text-2xl font-extrabold text-[#EF713F]">
            {defaultCurrency}{Math.round(totalPacePerMonth).toLocaleString()}/mo
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#8964B3] font-mono">
            <TrendUp size={16} variant="Bold" />
            <span>PiggyVest Target Math Active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-0 shadow-none space-y-2">
          <span className="text-xs font-semibold text-[#6B6560] block font-mono uppercase tracking-wider">
            Active Household Goals
          </span>
          <div className="font-display text-2xl font-extrabold text-[#231F1E]">
            {activeGoals.length} Active Pots
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#4A7C59] font-mono">
            <TickCircle size={16} variant="Bold" />
            <span>Joint & Personal Tracking</span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar & View Selector */}
      <div className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F3EF] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#231F1E]">
              Couple & Household Savings Goals
            </h2>
            <p className="text-xs text-[#6B6560]">
              Target-savings plans, contributor attribution, and PiggyVest yield tracking
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1 bg-[#FBF9F5] p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('Active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  activeTab === 'Active' ? 'bg-[#231F1E] text-white' : 'text-[#6B6560]'
                }`}
              >
                Active ({activeGoals.length})
              </button>
              <button
                onClick={() => setActiveTab('Archived')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                  activeTab === 'Archived' ? 'bg-[#231F1E] text-white' : 'text-[#6B6560]'
                }`}
              >
                Archived ({archivedGoals.length})
              </button>
            </div>

            <button
              onClick={() => {
                setEditingGoal(null);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#4A7C59] hover:bg-[#3D6849] text-white font-bold text-xs transition-colors border-0 cursor-pointer shadow-sm"
            >
              <Add size={16} variant="Linear" />
              <span>+ Create Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Multi-Card Grid for Savings Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedGoals.length === 0 ? (
          <div className="col-span-full p-8 rounded-3xl bg-white text-center space-y-3 border-0">
            <Cup size={36} className="mx-auto text-gray-300" />
            <p className="font-bold text-base text-[#231F1E]">
              {activeTab === 'Active' ? 'No active savings goals yet' : 'No archived goals'}
            </p>
            <p className="text-xs text-[#6B6560]">
              Create a goal to start saving together for Japa, Rent, Wedding, or Emergency pots!
            </p>
          </div>
        ) : (
          displayedGoals.map((goal) => {
            const pace = calculateGoalPace(goal);
            const currency = goal.currency || defaultCurrency;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-3xl p-5 border-0 shadow-none space-y-4 hover:bg-white/90 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0F7F2] text-2xl flex items-center justify-center shrink-0 shadow-xs">
                        {goal.icon || '🎯'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="font-bold text-base text-[#231F1E] truncate">
                            {goal.name}
                          </h3>

                          <span className="px-2 py-0.5 rounded-full bg-[#FAF6EB] text-[#CF9130] text-[10px] font-mono font-semibold">
                            {goal.category}
                          </span>
                        </div>

                        {/* Status Pace Badge */}
                        <div className="flex items-center space-x-2 text-xs font-mono pt-0.5">
                          <span className={`font-bold ${
                            pace.status === 'COMPLETED' ? 'text-[#4A7C59]' :
                            pace.status === 'AHEAD' ? 'text-[#8964B3]' :
                            pace.status === 'BEHIND' ? 'text-[#EF713F]' : 'text-[#4A7C59]'
                          }`}>
                            {pace.statusLabel}
                          </span>

                          {goal.targetDate && (
                            <span className="text-[#6B6560] text-[11px]">
                              • Deadline: {formatFriendlyDate(goal.targetDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-lg font-extrabold text-[#4A7C59] block">
                        {currency}{goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Target: {currency}{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Circular Indicator */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono text-[#6B6560]">
                      <span className="font-bold text-[#231F1E]">{pace.percentage}% Complete</span>
                      <span>Target Rate: {currency}{goal.suggestedContribution?.toLocaleString()}/{goal.cadence}</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pace.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#4A7C59] via-[#8964B3] to-[#EF713F]"
                      />
                    </div>
                  </div>

                  {/* Physical Storage Yield Note (PiggyVest / Cowrywise tag) */}
                  {goal.externalStorageNote && (
                    <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#F0ECE1] flex items-center space-x-2 text-[11px] font-mono text-[#6B6560]">
                      <span>🏦 Money Location: <strong className="text-[#231F1E] font-bold">{goal.externalStorageNote}</strong></span>
                    </div>
                  )}

                  {/* Contributor Avatars */}
                  <div className="flex items-center justify-between pt-1 text-xs text-[#6B6560]">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-mono">Contributors:</span>
                      <div className="flex items-center -space-x-1.5">
                        <img
                          src={getUserAvatar(currentUser.name)}
                          alt={currentUser.name}
                          className="w-5 h-5 rounded-full object-cover border border-white"
                          title={currentUser.name}
                        />
                        <img
                          src={getUserAvatar(partnerUser.name)}
                          alt={partnerUser.name}
                          className="w-5 h-5 rounded-full object-cover border border-white"
                          title={partnerUser.name}
                        />
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-[#8964B3] capitalize">
                      {goal.ownership} goal
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F5F3EF] mt-3">
                  <button
                    onClick={() => handleNudgePartner(goal)}
                    className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#8964B3] transition-colors border-0 cursor-pointer flex items-center space-x-1 text-xs font-semibold"
                    title="Nudge partner to contribute"
                  >
                    <NotificationCircle size={16} variant="Bold" />
                    <span className="hidden sm:inline">Nudge</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDepositGoal(goal)}
                      className="px-3.5 py-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3D6849] text-white text-xs font-bold transition-all border-0 cursor-pointer flex items-center space-x-1 shadow-xs"
                    >
                      <Add size={15} variant="Linear" />
                      <span>+ Add Deposit</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsCreateOpen(true);
                      }}
                      className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 size={16} variant="Linear" />
                    </button>

                    {goal.status === 'ACTIVE' ? (
                      <button
                        onClick={() => archiveSavingsGoal(goal.id)}
                        className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#F5F3EF] text-[#6B6560] transition-colors border-0 cursor-pointer"
                        title="Archive Goal"
                      >
                        <Archive size={16} variant="Linear" />
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-red-50 text-red-500 transition-colors border-0 cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash size={16} variant="Linear" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        editingGoal={editingGoal}
      />

      <LogContributionModal
        goal={depositGoal}
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
      />
    </div>
  );
};
