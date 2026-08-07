import React from 'react';

import { i18nService } from '../../services/i18n';
import ManagementPageShell from '../management/ManagementPageShell';
import KitsManager from './KitsManager';

interface KitsViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  updateBadge?: React.ReactNode;
  onTryAsking?: (text: string, kitId: string) => void;
  onUseKit?: (kitId: string) => void;
}

const KitsView: React.FC<KitsViewProps> = ({ isSidebarCollapsed, onToggleSidebar, onNewChat, updateBadge, onTryAsking, onUseKit }) => {
  return (
    <ManagementPageShell
      title={i18nService.t('kits')}
      subtitle={i18nService.t('kitDescription')}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onNewChat={onNewChat}
      updateBadge={updateBadge}
    >
      <div className="mx-auto w-full max-w-[1120px] px-6 py-6">
        <KitsManager onTryAsking={onTryAsking} onUseKit={onUseKit} />
      </div>
    </ManagementPageShell>
  );
};

export default KitsView;
