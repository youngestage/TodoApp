import React from 'react';
import { useStore } from '../../../store/useStore';

export const GlobalPreferencesCard: React.FC = () => {
  const { preferences, updatePreferences } = useStore();

  return (
    <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
      <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
        <h3 className="font-bold text-lg text-[#231F1E]">Currency & Localization</h3>
        <p className="text-xs text-[#6B6560]">Configure base currency symbol for split calculation</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider mb-2">
            Household Base Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['₦', '$', '£', '€'].map((sym) => (
              <button
                key={sym}
                onClick={() => updatePreferences({ currency: sym })}
                className={`p-3.5 rounded-2xl font-mono text-lg font-bold border-0 cursor-pointer transition-all ${
                  preferences.currency === sym
                    ? 'bg-[#231F1E] text-white shadow-md'
                    : 'bg-[#FBF9F5] text-[#231F1E] hover:bg-[#FAF6EB]'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider mb-2">
            First Day of the Week
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['Sunday', 'Monday'].map((day) => (
              <button
                key={day}
                onClick={() => updatePreferences({ firstDayOfWeek: day as any })}
                className={`p-3 rounded-2xl font-semibold text-xs border-0 cursor-pointer transition-all ${
                  preferences.firstDayOfWeek === day
                    ? 'bg-[#231F1E] text-white'
                    : 'bg-[#FBF9F5] text-[#231F1E] hover:bg-[#FAF6EB]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
