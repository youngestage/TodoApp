import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Heart, Clock, Edit2, CloseCircle, TickCircle } from 'iconsax-react';
import { Avatar } from '../ui/Avatar';
import { supabase } from '../../lib/supabase';

export const RelationshipClock: React.FC = () => {
  const { currentUser, partnerUser, household, updateHouseholdStartDate } = useStore();
  const [now, setNow] = useState(new Date());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [inputDate, setInputDate] = useState(household.relationshipStartDate || '2024-04-14');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startDate = new Date(household.relationshipStartDate || '2024-04-14T00:00:00');

  // Calculate Relationship Elapsed Duration
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Approximate Years, Months, Days
  const years = Math.floor(diffDays / 365);
  const remainingDaysAfterYears = diffDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  const format2 = (n: number) => n.toString().padStart(2, '0');

  const handleSaveStartDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDate) return;
    updateHouseholdStartDate(inputDate);
    setDatePickerOpen(false);

    // Save to Supabase if available
    try {
      await supabase.from('households').update({
        created_at: new Date(inputDate).toISOString()
      }).eq('id', household.id);
    } catch (err) {}
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 border-0 shadow-none flex items-center justify-between gap-4 select-none relative group">
        
        {/* Couple Avatars & Live Digital Duration */}
        <div className="flex items-center space-x-4 min-w-0">
          
          {/* Avatars with Heart Badge & Milestone SVG */}
          <div className="relative flex items-center shrink-0 space-x-2">
            <img src="/relationship_milestone.svg" alt="Relationship Milestone" className="w-10 h-10 object-contain hidden sm:block shrink-0" />
            <div className="relative flex items-center shrink-0">
              <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
              <div className="-ml-3 z-10">
                <Avatar name={partnerUser.name} src={partnerUser.avatarUrl} size="md" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 w-5 h-5 rounded-full bg-[#EF713F] text-white flex items-center justify-center shadow-sm">
                <Heart size={10} variant="Bold" />
              </div>
            </div>
          </div>

          {/* Digital Relationship Counter */}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#EF713F]">
                Together For
              </span>
              <span className="text-[10px] text-[#6B6560] font-mono">
                • Since {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h3 className="font-mono text-xl sm:text-2xl font-extrabold text-[#231F1E] tracking-tight truncate">
              {years > 0 && `${years}y `}{months}m {days}d
            </h3>

            <p className="text-xs font-mono text-[#6B6560] flex items-center space-x-1">
              <Clock size={12} variant="Linear" className="text-[#EF713F] inline" />
              <span>
                {format2(currentHour)}:{format2(currentMinute)}:{format2(currentSecond)}
              </span>
            </p>
          </div>
        </div>

        {/* Edit Relationship Start Date Button */}
        <button
          onClick={() => setDatePickerOpen(true)}
          className="p-2 rounded-2xl bg-[#FBF9F5] hover:bg-[#FAF6EB] text-[#6B6560] hover:text-[#EF713F] transition-colors border-0 cursor-pointer shrink-0"
          title="Set Relationship Start Date"
        >
          <Edit2 size={16} variant="Linear" />
        </button>
      </div>

      {/* Relationship Start Date Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDatePickerOpen(false)} />
          <form onSubmit={handleSaveStartDate} className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl border-0">
            <div className="flex items-center justify-between border-b border-[#F5F3EF] pb-3">
              <h3 className="font-bold text-lg text-[#231F1E]">Set Relationship Start Date</h3>
              <button type="button" onClick={() => setDatePickerOpen(false)} className="text-[#6B6560] border-0 bg-transparent cursor-pointer">
                <CloseCircle size={20} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#6B6560] uppercase mb-1">When did your relationship start?</label>
              <input
                type="date"
                required
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#FBF9F5] rounded-2xl text-sm font-mono text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#EF713F] hover:bg-[#D95220] text-white font-bold text-xs transition-colors border-0 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <TickCircle size={16} variant="Bold" />
              <span>Save Relationship Date</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
