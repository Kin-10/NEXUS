import React from 'react';

import { Plus } from '@/components/icons/iconParkCompat';

import { i18nService } from '../../services/i18n';

interface MyAgentSidebarHeaderProps {
  onCreateAgent: () => void;
}

const MyAgentSidebarHeader: React.FC<MyAgentSidebarHeaderProps> = ({
  onCreateAgent,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-background pb-2 pt-2">
      <button
        type="button"
        onClick={onCreateAgent}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface text-[12px] font-medium text-secondary shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:bg-surface-raised hover:text-foreground"
        aria-label={i18nService.t('createNewAgent')}
      >
        <Plus className="h-4 w-4" />
        <span>{i18nService.t('createNewAgent')}</span>
      </button>
    </div>
  );
};

export default MyAgentSidebarHeader;
