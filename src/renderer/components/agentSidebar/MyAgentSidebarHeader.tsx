import React from 'react';

import { Plus } from '@/components/icons/iconParkCompat';

import { i18nService } from '../../services/i18n';
import Tooltip, { TooltipAlign, TooltipPosition } from '../ui/Tooltip';

interface MyAgentSidebarHeaderProps {
  onCreateAgent: () => void;
}

const MyAgentSidebarHeader: React.FC<MyAgentSidebarHeaderProps> = ({
  onCreateAgent,
}) => {
  return (
    <div className="group sticky top-0 z-30 bg-white pb-2 pt-2">
      <Tooltip
        content={i18nService.t('createNewAgent')}
        position={TooltipPosition.Bottom}
        align={TooltipAlign.End}
        delay={300}
        className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        <button
          type="button"
          onClick={onCreateAgent}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#e7e7e7] bg-white text-[12px] font-medium text-[#555555] shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:border-[#d7d7d7] hover:bg-[#fafafa] hover:text-[#111111]"
          aria-label={i18nService.t('createNewAgent')}
        >
          <Plus className="h-4 w-4" />
          <span>{i18nService.t('createNewAgent')}</span>
        </button>
      </Tooltip>
    </div>
  );
};

export default MyAgentSidebarHeader;
