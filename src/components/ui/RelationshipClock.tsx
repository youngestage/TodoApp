import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Heart, Clock } from 'iconsax-react';
import { Avatar } from './Avatar';

// Default relationship start date: April 14, 2024
const START_DATE = new Date('2024-04-14T00:00:00');

export const RelationshipClock: React.FC = () => {
  const { currentUser, partnerUser } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Relationship Elapsed Duration
  const diffMs = Math.max(0, now.getTime() - START_DATE.getTime());
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

  // Formatted Digital Clock
  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-3xl p-5 border-0 shadow-none flex items-center justify-between gap-4 select-none">
      
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
            <span className="text-[10px] text-[#6B6560] font-mono">• Since April 2024</span>
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

    </div>
  );
};
