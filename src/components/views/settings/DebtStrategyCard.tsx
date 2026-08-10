import React from 'react';
import { useStore } from '../../../store/useStore';

export const DebtStrategyCard: React.FC = () => {
  const { debtStrategy, extraDebtContribution, updateDebtConfig } = useStore();

  return (
    <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
      <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-[#231F1E]">Debt Strategy & Extra Monthly Allocation</h3>
          <p className="text-xs text-[#6B6560]">Choose Snowball, Avalanche, or Minimum payment strategy</p>
        </div>
        <img src="/debt_freedom.svg" alt="Debt Freedom" className="w-16 h-16 object-contain shrink-0 hidden sm:block" />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
          Repayment Engine Strategy
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['Snowball', 'Avalanche', 'Minimum'] as const).map((strat) => (
            <button
              key={strat}
              onClick={() => updateDebtConfig(strat, extraDebtContribution)}
              className={`p-3 rounded-2xl text-xs font-bold border-0 cursor-pointer transition-all ${
                debtStrategy === strat
                  ? 'bg-[#231F1E] text-white shadow-md'
                  : 'bg-[#FBF9F5] text-[#6B6560] hover:text-[#231F1E]'
              }`}
            >
              {strat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
