import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface FinanceKpiCardsProps {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  netSurplus: number;
  totalDebtPaidInPeriod: number;
  totalRemainingDebt: number;
}

export const FinanceKpiCards: React.FC<FinanceKpiCardsProps> = ({
  currency,
  totalIncome,
  totalExpense,
  netSurplus,
  totalDebtPaidInPeriod,
  totalRemainingDebt
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Earned */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl space-y-2 border-0 shadow-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B6560]">Earned in Period</span>
          <div className="w-8 h-8 rounded-xl bg-[#F0F7F2] text-[#4A7C59] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-extrabold text-[#4A7C59]">
          +{currency}{totalIncome.toLocaleString()}
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-[#6B6560]">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#4A7C59]" />
          <span>Total income streams</span>
        </div>
      </div>

      {/* Total Spent */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl space-y-2 border-0 shadow-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B6560]">Spent in Period</span>
          <div className="w-8 h-8 rounded-xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-extrabold text-[#231F1E]">
          -{currency}{totalExpense.toLocaleString()}
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-[#6B6560]">
          <ArrowDownRight className="w-3.5 h-3.5 text-[#EF713F]" />
          <span>Logged expenses & bills</span>
        </div>
      </div>

      {/* Net Surplus / Saved */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl space-y-2 border-0 shadow-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B6560]">Net Saved / Cash Flow</span>
          <div className="w-8 h-8 rounded-xl bg-[#FAF6EB] text-[#CF9130] flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className={`font-mono text-xl sm:text-2xl font-extrabold ${netSurplus >= 0 ? 'text-[#4A7C59]' : 'text-[#EF713F]'}`}>
          {netSurplus >= 0 ? '+' : ''}{currency}{netSurplus.toLocaleString()}
        </div>
        <div className="text-[11px] text-[#6B6560]">
          Earned minus spent
        </div>
      </div>

      {/* Debt & Savings Overview */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl space-y-2 border-0 shadow-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B6560]">Debt Paid in Period</span>
          <div className="w-8 h-8 rounded-xl bg-[#F6F3FA] text-[#8964B3] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-extrabold text-[#8964B3]">
          {currency}{totalDebtPaidInPeriod.toLocaleString()}
        </div>
        <div className="text-[11px] text-[#6B6560]">
          Remaining Debt: <span className="font-mono font-semibold text-[#231F1E]">{currency}{totalRemainingDebt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
