import React from 'react';

import type { LocalizedQuickAction } from '../../types/quickAction';
import AcademicCapIcon from '../icons/AcademicCapIcon';
import ChartBarIcon from '../icons/ChartBarIcon';
import DevicePhoneMobileIcon from '../icons/DevicePhoneMobileIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import GlobeAltIcon from '../icons/GlobeAltIcon';
import PresentationChartBarIcon from '../icons/PresentationChartBarIcon';

interface QuickActionBarProps {
  actions: LocalizedQuickAction[];
  selectedActionId?: string | null;
  onActionSelect: (actionId: string) => void;
}

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PresentationChartBarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
};

const QuickActionBar: React.FC<QuickActionBarProps> = ({ actions, selectedActionId, onActionSelect }) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div data-skin-quick-actions="true" className="flex flex-wrap items-center justify-center gap-2">
      {actions.map((action) => {
        const IconComponent = iconMap[action.icon];
        const isSelected = action.id === selectedActionId;

        return (
          <button
            key={action.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onActionSelect(action.id)}
            className={`group flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium leading-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.97] ${
              isSelected
                ? 'border-[color-mix(in_srgb,var(--lobster-primary)_45%,transparent)] bg-primary-muted text-primary'
                : 'border-[#e5e5e5] bg-white text-[#555555] hover:-translate-y-px hover:border-[#d4d4d4] hover:bg-[#fbfbfb] hover:text-[#111111]'
            }`}
          >
            {IconComponent && (
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                style={{ color: isSelected ? undefined : action.color }}
              >
                <IconComponent className="h-4 w-4 transition-colors duration-200" />
              </span>
            )}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionBar;
