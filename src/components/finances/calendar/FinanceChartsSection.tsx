import React from 'react';
import { PieChart as PieIcon, BarChart3, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

interface FinanceChartsSectionProps {
  currency: string;
  categoryBreakdownData: Array<{ name: string; value: number; color: string }>;
  cashFlowTrendData: Array<{ monthKey: string; monthLabel: string; income: number; expense: number }>;
  totalExpense: number;
  totalDebtPaidInPeriod: number;
  totalSavingsInPeriod: number;
}

export const FinanceChartsSection: React.FC<FinanceChartsSectionProps> = ({
  currency,
  categoryBreakdownData,
  cashFlowTrendData,
  totalExpense,
  totalDebtPaidInPeriod,
  totalSavingsInPeriod
}) => {
  const totalOutflows = totalExpense + totalDebtPaidInPeriod + totalSavingsInPeriod;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Expense Category Breakdown (Recharts Donut) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-4 border-0 shadow-none">
        <div className="flex items-center space-x-2 border-b border-[#F5F3EF] pb-3">
          <PieIcon className="w-5 h-5 text-[#EF713F]" />
          <h3 className="font-bold text-base text-[#231F1E]">Spending Category Breakdown</h3>
        </div>

        {categoryBreakdownData.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B6560] space-y-2">
            <Info className="w-8 h-8 mx-auto text-[#6B6560]/40" />
            <p>No expense data logged for this period.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#231F1E', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {categoryBreakdownData.map((cat) => {
                const pct = totalOutflows > 0 ? Math.round((cat.value / totalOutflows) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl bg-[#FBF9F5]">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate text-[#231F1E] font-medium">{cat.name}</span>
                    </div>
                    <span className="font-bold text-[#231F1E] shrink-0 ml-2">
                      {currency}{cat.value.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Income vs Expense Monthly Trend (Recharts Bar Chart) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-4 border-0 shadow-none">
        <div className="flex items-center space-x-2 border-b border-[#F5F3EF] pb-3">
          <BarChart3 className="w-5 h-5 text-[#4A7C59]" />
          <h3 className="font-bold text-base text-[#231F1E]">Monthly Cash Flow Trend</h3>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F3EF" />
              <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B6560' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6B6560' }} />
              <Tooltip
                formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`]}
                contentStyle={{ backgroundColor: '#231F1E', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Earned" fill="#4A7C59" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Spent" fill="#EF713F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
