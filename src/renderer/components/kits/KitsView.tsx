import React from 'react';

import { i18nService } from '../../services/i18n';
import { MANAGEMENT_BODY_TEXT, MANAGEMENT_PAGE_TITLE_TEXT } from '../common/managementTypography';
import ComposeIcon from '../icons/ComposeIcon';
import SidebarToggleIcon from '../icons/SidebarToggleIcon';
import KitsManager from './KitsManager';

interface KitsViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  updateBadge?: React.ReactNode;
  onTryAsking?: (text: string, kitId: string) => void;
  onUseKit?: (kitId: string) => void;
}

/**
 * Experts directory shell — marketplace pattern aligned with Skills / Connectors.
 * Search and Marketplace|Installed tabs live in KitsManager; this owns page identity.
 */
const KitsView: React.FC<KitsViewProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  updateBadge,
  onTryAsking,
  onUseKit,
}) => {
  const isMac = window.electron.platform === 'darwin';
  const isWindows = window.electron.platform === 'win32';

  const leadingSlot = isSidebarCollapsed && !isWindows ? (
    <div className={`non-draggable mr-1 flex items-center gap-1 ${isMac ? 'pl-[68px]' : ''}`}>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors duration-200 hover:bg-surface-raised hover:text-foreground"
      >
        <SidebarToggleIcon className="h-4 w-4" isCollapsed={true} />
      </button>
      {onNewChat && (
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors duration-200 hover:bg-surface-raised hover:text-foreground"
        >
          <ComposeIcon className="h-4 w-4" />
        </button>
      )}
      {updateBadge}
    </div>
  ) : isMac ? (
    <div className="w-[68px] shrink-0" aria-hidden="true" />
  ) : null;

  return (
    <div
      data-skin-management-page="true"
      className="relative z-10 flex h-full min-h-0 flex-1 flex-col bg-background"
    >
      <header className="draggable shrink-0 border-b border-border bg-background">
        <div className="flex h-12 items-center gap-3 px-4">
          {leadingSlot}
          <h1 className={`non-draggable ${MANAGEMENT_PAGE_TITLE_TEXT} font-semibold tracking-tight text-foreground`}>
            {i18nService.t('sidebarNavExperts')}
          </h1>
        </div>
        <div className="non-draggable mx-auto w-full max-w-[1120px] px-8 pb-4 pt-1">
          <p className={`${MANAGEMENT_BODY_TEXT} max-w-2xl text-secondary`}>
            {i18nService.t('kitDescription')}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <div className="mx-auto w-full max-w-[1120px] px-8 py-5">
          <KitsManager onTryAsking={onTryAsking} onUseKit={onUseKit} />
        </div>
      </div>
    </div>
  );
};

export default KitsView;
