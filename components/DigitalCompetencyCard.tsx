
import React from 'react';
import { DigitalCompetency } from '../types';
import { DIGITAL_COMPETENCY_DETAILS } from '../constants';

interface Props {
  competency: DigitalCompetency;
  count: number;
}

export const DigitalCompetencyCard: React.FC<Props> = ({ competency, count }) => {
  const getIcon = () => {
    switch (competency) {
      case DigitalCompetency.INFO_DATA: return '📊';
      case DigitalCompetency.COMM_COLLAB: return '🤝';
      case DigitalCompetency.CONTENT_CREATION: return '🎨';
      case DigitalCompetency.SAFETY: return '🛡️';
      case DigitalCompetency.PROBLEM_SOLVING: return '💡';
    }
  };

  const getColors = () => {
    switch (competency) {
      case DigitalCompetency.INFO_DATA: return 'bg-blue-50 text-blue-700 border-blue-100';
      case DigitalCompetency.COMM_COLLAB: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case DigitalCompetency.CONTENT_CREATION: return 'bg-purple-50 text-purple-700 border-purple-100';
      case DigitalCompetency.SAFETY: return 'bg-amber-50 text-amber-700 border-amber-100';
      case DigitalCompetency.PROBLEM_SOLVING: return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getColors()} transition hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-2xl">{getIcon()}</span>
        <span className="font-bold text-lg">{count}</span>
      </div>
      <h3 className="font-semibold text-sm mb-1">{competency}</h3>
      <p className="text-[10px] opacity-80 leading-tight">
        {DIGITAL_COMPETENCY_DETAILS[competency]}
      </p>
    </div>
  );
};
