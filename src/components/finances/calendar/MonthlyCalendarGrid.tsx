import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyCalendarGridProps {
  currentCalendarDate: Date;
  setCurrentCalendarDate: (date: Date) => void;
  calendarDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }>;
  itemsByDateStr: Record<
    string,
    {
      incomes: number;
      expenses: number;
      items: Array<{ id: string; title: string; amount: number; type: 'income' | 'expense' | 'bill' | 'debt' | 'savings'; subtitle?: string }>;
    }
  >;
  currency: string;
  onSelectDay: (dateStr: string) => void;
}

export const MonthlyCalendarGrid: React.FC<MonthlyCalendarGridProps> = ({
  currentCalendarDate,
  setCurrentCalendarDate,
  calendarDays,
  itemsByDateStr,
  currency,
  onSelectDay
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-4 border-0 shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-[#EF713F]" />
          <h3 className="font-bold text-lg text-[#231F1E]">
            {currentCalendarDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              const prev = new Date(currentCalendarDate);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentCalendarDate(prev);
            }}
            className="p-2 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] border-0 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentCalendarDate(new Date())}
            className="px-3 py-1.5 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-xs font-semibold text-[#231F1E] border-0 cursor-pointer transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              const next = new Date(currentCalendarDate);
              next.setMonth(next.getMonth() + 1);
              setCurrentCalendarDate(next);
            }}
            className="p-2 rounded-xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#231F1E] border-0 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-[#6B6560] font-semibold py-1 border-b border-[#F5F3EF]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((cell, idx) => {
          const dayData = itemsByDateStr[cell.dateStr];
          const isToday = cell.dateStr === todayStr;
          const hasItems = dayData && dayData.items.length > 0;

          return (
            <div
              key={idx}
              onClick={() => {
                if (hasItems) onSelectDay(cell.dateStr);
              }}
              className={`min-h-[72px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between transition-all border-0 ${
                cell.isCurrentMonth
                  ? 'bg-[#FBF9F5] text-[#231F1E]'
                  : 'bg-[#FBF9F5]/40 text-[#6B6560]/40'
              } ${hasItems ? 'cursor-pointer hover:bg-[#FAF6EB] hover:shadow-xs' : ''} ${
                isToday ? 'ring-2 ring-[#EF713F]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isToday ? 'text-[#EF713F]' : ''}`}>
                  {cell.dayNum}
                </span>
                {hasItems && (
                  <span className="w-2 h-2 rounded-full bg-[#EF713F]" />
                )}
              </div>

              {/* Day Summary Badges */}
              <div className="space-y-0.5 min-w-0">
                {dayData?.incomes ? (
                  <div className="px-1 py-0.5 rounded-md bg-[#F0F7F2] text-[#4A7C59] text-[9px] sm:text-[10px] font-mono font-bold truncate">
                    +{currency}{dayData.incomes >= 1000 ? `${Math.round(dayData.incomes / 1000)}k` : dayData.incomes}
                  </div>
                ) : null}

                {dayData?.expenses ? (
                  <div className="px-1 py-0.5 rounded-md bg-[#FFF5F0] text-[#EF713F] text-[9px] sm:text-[10px] font-mono font-bold truncate">
                    -{currency}{dayData.expenses >= 1000 ? `${Math.round(dayData.expenses / 1000)}k` : dayData.expenses}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
