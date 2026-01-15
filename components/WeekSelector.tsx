
import React from 'react';

interface Props {
  activeWeek: number;
  onSelect: (week: number) => void;
}

export const WeekSelector: React.FC<Props> = ({ activeWeek, onSelect }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto">
      <div className="flex space-x-2 min-w-max">
        {Array.from({ length: 35 }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            onClick={() => onSelect(week)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition
              ${activeWeek === week 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            {week}
          </button>
        ))}
      </div>
    </div>
  );
};
