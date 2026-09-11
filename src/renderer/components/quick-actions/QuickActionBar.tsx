import React from 'react';

import {
  ChartBar,
  DeviceMobile,
  FileText,
  Globe,
  GraduationCap,
  PresentationChart,
} from '@/components/icons/iconParkCompat';
import type { IconProps } from '@/components/icons/iconParkCompat';

import type { LocalizedQuickAction } from '../../types/quickAction';
import { iconParkOutlineProps } from '../icons/iconStyle';

interface QuickActionBarProps {
  actions: LocalizedQuickAction[];
  selectedActionId?: string | null;
  onActionSelect: (actionId: string) => void;
}

/** Map config icon keys → Lucide chrome icons (1.5 stroke, optically consistent). */
const iconMap: Record<string, React.ComponentType<IconProps>> = {
  PresentationChartBarIcon: PresentationChart,
  GlobeAltIcon: Globe,
  DevicePhoneMobileIcon: DeviceMobile,
  DocumentTextIcon: FileText,
  ChartBarIcon: ChartBar,
  AcademicCapIcon: GraduationCap,
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
        const accent = action.color || 'currentColor';

        return (
          <button
            key={action.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onActionSelect(action.id)}
            className={`group inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium leading-4 transition-colors duration-200 ${
              isSelected
                ? 'border-[color-mix(in_srgb,var(--baiying-primary)_42%,transparent)] bg-primary-muted text-primary'
                : 'border-border/80 bg-surface text-secondary hover:border-border hover:bg-surface-raised hover:text-foreground'
            }`}
          >
            {IconComponent ? (
              <span
                aria-hidden="true"
                className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-transparent'
                }`}
                style={isSelected ? undefined : {
                  color: `color-mix(in srgb, ${accent} 68%, var(--baiying-text-secondary, #64748b))`,
                }}
              >
                <IconComponent
                  className="h-3.5 w-3.5 transition-colors duration-200 group-hover:opacity-100"
                  {...iconParkOutlineProps}
                />
              </span>
            ) : null}
            <span className="pr-0.5">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionBar;
