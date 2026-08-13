import React from 'react';

import { Plus } from '@/components/icons/iconParkCompat';

import { i18nService } from '../../services/i18n';
import SidebarSearchIcon from '../icons/SidebarSearchIcon';

interface MyAgentSidebarHeaderProps {
  onCreateAgent: () => void;
  onSearch: () => void;
}

const MyAgentSidebarHeader: React.FC<MyAgentSidebarHeaderProps> = ({
  onCreateAgent,
  onSearch,
}) => {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 bg-background pb-2 pt-2">
      <button
        type="button"
        onClick={onCreateAgent}
        className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface text-[12px] font-medium text-secondary shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:bg-surface-raised hover:text-foreground"
        aria-label={i18nService.t('createNewAgent')}
      >
        <Plus className="h-4 w-4" />
        <span className="truncate">{i18nService.t('createNewAgent')}</span>
      </button>
      <button
        type="button"
        onClick={onSearch}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-secondary shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:bg-surface-raised hover:text-foreground"
        aria-label={i18nService.t('search')}
        title={i18nService.t('search')}
      >
        <SidebarSearchIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
};

export default MyAgentSidebarHeader;
