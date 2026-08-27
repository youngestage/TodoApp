import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';

export type DateFilterPreset = '1M' | '2M' | '3M' | '6M' | '1Y' | 'CUSTOM';

interface CalendarHeaderFiltersProps {
  preset: DateFilterPreset;
  setPreset: (preset: DateFilterPreset) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

export const CalendarHeaderFilters: React.FC<CalendarHeaderFiltersProps> = ({
  preset,
  setPreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -120, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-4 border-0 shadow-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Header Title & Subtitle */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5F0] text-[#EF713F] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#231F1E] truncate">
              Finances Calendar & Analytics
            </h2>
            <p className="text-xs text-[#6B6560] truncate">
              Track monthly spending, earnings, category breakdowns, debt payoff & savings timeline
            </p>
          </div>
        </div>

        {/* Quick Presets Filter Container */}
        <div className="relative flex items-center shrink-0 max-w-full">
          {/* Scroll Left Button for Desktop */}
          <button
            type="button"
            onClick={scrollLeft}
            className="hidden sm:flex p-1 rounded-full bg-white/80 hover:bg-white text-[#6B6560] shadow-xs mr-1 border-0 cursor-pointer shrink-0"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Buttons Wrapper */}
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="flex items-center space-x-1.5 bg-[#FBF9F5] p-1.5 rounded-2xl overflow-x-auto max-w-full no-scrollbar scroll-smooth"
          >
            {[
              { id: '1M', label: '1 Month' },
              { id: '2M', label: '2 Months' },
              { id: '3M', label: '3 Months' },
              { id: '6M', label: '6 Months' },
              { id: '1Y', label: 'This Year' },
              { id: 'CUSTOM', label: 'Custom' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPreset(tab.id as DateFilterPreset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer shrink-0 ${
                  preset === tab.id
                    ? 'bg-[#231F1E] text-white shadow-xs'
                    : 'text-[#6B6560] hover:text-[#231F1E] bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scroll Right Button for Desktop */}
          <button
            type="button"
            onClick={scrollRight}
            className="hidden sm:flex p-1 rounded-full bg-white/80 hover:bg-white text-[#6B6560] shadow-xs ml-1 border-0 cursor-pointer shrink-0"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Date Range Selector */}
      {preset === 'CUSTOM' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-3 border-t border-[#F5F3EF] flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#6B6560]">Start:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FBF9F5] rounded-xl font-mono text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#6B6560]">End:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FBF9F5] rounded-xl font-mono text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]"
            />
          </div>
          <button
            type="button"
            onClick={() => setPreset('1M')}
            className="px-3 py-1.5 rounded-xl bg-[#FFF5F0] text-[#EF713F] font-semibold text-xs border-0 cursor-pointer flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
