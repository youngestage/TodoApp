import { SavingsGoal, GoalCadence } from '../types';

/**
 * Calculates PiggyVest target-savings style required contribution per cadence to reach the goal.
 */
export function calculateRequiredContribution(
  targetAmount: number,
  currentAmount: number,
  targetDateStr?: string,
  cadence: GoalCadence = 'monthly'
): number {
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (remaining <= 0 || cadence === 'manual') return 0;

  if (!targetDateStr) {
    // Default 12 months horizon
    return Math.round(remaining / 12);
  }

  const targetDate = new Date(targetDateStr);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  switch (cadence) {
    case 'daily':
      return Math.round(remaining / diffDays);

    case 'weekly': {
      const weeks = Math.max(1, Math.ceil(diffDays / 7));
      return Math.round(remaining / weeks);
    }

    case 'bi-weekly': {
      const biWeeks = Math.max(1, Math.ceil(diffDays / 14));
      return Math.round(remaining / biWeeks);
    }

    case 'monthly':
    default: {
      const months = Math.max(1, Math.ceil(diffDays / 30));
      return Math.round(remaining / months);
    }
  }
}

export interface GoalPaceAnalysis {
  percentage: number;
  remainingAmount: number;
  status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED';
  statusLabel: string;
  projectedCompletionStr: string;
}

/**
 * Evaluates real-time goal progress against required pace.
 */
export function calculateGoalPace(goal: SavingsGoal): GoalPaceAnalysis {
  const target = goal.targetAmount || goal.goalAmount || 1;
  const current = goal.currentAmount || 0;
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const remainingAmount = Math.max(0, target - current);

  if (percentage >= 100) {
    return {
      percentage: 100,
      remainingAmount: 0,
      status: 'COMPLETED',
      statusLabel: 'Goal Target Reached! 🎉',
      projectedCompletionStr: 'Completed'
    };
  }

  if (!goal.targetDate) {
    return {
      percentage,
      remainingAmount,
      status: 'ON_TRACK',
      statusLabel: 'Saving at your pace',
      projectedCompletionStr: 'Open Target'
    };
  }

  const startDate = goal.createdAt ? new Date(goal.createdAt) : new Date();
  const targetDate = new Date(goal.targetDate);
  const today = new Date();

  const totalDuration = targetDate.getTime() - startDate.getTime();
  const elapsedDuration = today.getTime() - startDate.getTime();
  const expectedPercentage = totalDuration > 0 ? Math.min(100, (elapsedDuration / totalDuration) * 100) : 50;

  let status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' = 'ON_TRACK';
  let statusLabel = 'On Track 🚀';

  if (percentage >= expectedPercentage + 5) {
    status = 'AHEAD';
    statusLabel = 'Ahead of Pace! 🔥';
  } else if (percentage < expectedPercentage - 10) {
    status = 'BEHIND';
    statusLabel = 'Slightly Behind Pace ⏳';
  }

  // Calculate projected date
  const monthlyRate = goal.suggestedContribution || (target / 12);
  const monthsNeeded = Math.ceil(remainingAmount / Math.max(100, monthlyRate));
  const projectedDate = new Date(today);
  projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);

  return {
    percentage,
    remainingAmount,
    status,
    statusLabel,
    projectedCompletionStr: projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };
}
