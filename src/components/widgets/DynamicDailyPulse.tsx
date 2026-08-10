import React from 'react';
import { useStore } from '../../store/useStore';
import { Sun1, Moon, Flash, TaskSquare, Wallet3 } from 'iconsax-react';

export const DynamicDailyPulse: React.FC = () => {
  const { currentUser, partnerUser, tasks, recurringBills, household } = useStore();

  const currentHour = new Date().getHours();
  
  let greetingTime = 'Good afternoon';
  let IconComponent = Sun1;
  let emoji = '✨';

  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'Good morning';
    IconComponent = Sun1;
    emoji = '☀️';
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingTime = 'Good afternoon';
    IconComponent = Sun1;
    emoji = '✨';
  } else if (currentHour >= 17 && currentHour < 22) {
    greetingTime = 'Good evening';
    IconComponent = Moon;
    emoji = '🌙';
  } else {
    greetingTime = 'Good night';
    IconComponent = Moon;
    emoji = '💫';
  }

  // Calculate urgent items
  const pendingTasks = tasks.filter(t => !t.completed);
  const jointTasksWaiting = pendingTasks.filter(t => t.isJoint && (!t.userACompleted || !t.userBCompleted)).length;
  const dueBillsCount = recurringBills.filter(b => b.status === 'DUE' || b.status === 'UPCOMING').length;
  const hasSettleUp = household.settleBalance.amount > 0;

  // Build smart pulse summary sentence
  const pulseSentences: string[] = [];
  if (dueBillsCount > 0) {
    pulseSentences.push(`${dueBillsCount} bill${dueBillsCount > 1 ? 's' : ''} due this week`);
  }
  if (jointTasksWaiting > 0) {
    pulseSentences.push(`${jointTasksWaiting} shared task${jointTasksWaiting > 1 ? 's' : ''} waiting for check-off`);
  }
  if (hasSettleUp) {
    pulseSentences.push(`₦${household.settleBalance.amount.toLocaleString()} balance to settle`);
  }

  const pulseText = pulseSentences.length > 0
    ? pulseSentences.join(' and ')
    : 'All household tasks & bills are up to date!';

  return (
    <div className="bg-gradient-to-r from-[#FAF6EB] via-[#FFF5F0] to-[#F6F3FA] rounded-3xl p-5 border-0 shadow-none flex items-start space-x-4 select-none">
      <div className="w-10 h-10 rounded-2xl bg-white text-[#EF713F] flex items-center justify-center shrink-0 shadow-sm">
        <IconComponent size={22} variant="Bold" />
      </div>

      <div className="space-y-1 min-w-0 flex-1">
        <h2 className="font-display font-bold text-base sm:text-lg text-[#231F1E] leading-snug">
          {greetingTime}, {currentUser.name} & {partnerUser.name} {emoji}
        </h2>

        <p className="text-xs text-[#6B6560] leading-relaxed font-sans">
          {pulseText}.
        </p>

        {/* Quick Indicator Tags */}
        <div className="pt-1.5 flex flex-wrap items-center gap-2">
          {dueBillsCount > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white text-[10px] font-semibold text-[#CF9130]">
              <Wallet3 size={12} variant="Bold" />
              <span>{dueBillsCount} Bills Pending</span>
            </span>
          )}
          {jointTasksWaiting > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white text-[10px] font-semibold text-[#EF713F]">
              <TaskSquare size={12} variant="Bold" />
              <span>{jointTasksWaiting} Joint Tasks</span>
            </span>
          )}
          {hasSettleUp && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white text-[10px] font-semibold text-[#8964B3]">
              <Flash size={12} variant="Bold" />
              <span>₦{household.settleBalance.amount.toLocaleString()} Settlement</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
