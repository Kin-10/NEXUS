import React from 'react';

import { i18nService } from '../../services/i18n';
import ManagementPageShell from '../management/ManagementPageShell';
import McpManager from './McpManager';

interface McpViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  updateBadge?: React.ReactNode;
}

const McpView: React.FC<McpViewProps> = ({ isSidebarCollapsed, onToggleSidebar, onNewChat, updateBadge }) => {
  return (
    <ManagementPageShell
      title={i18nService.t('mcpServers')}
      subtitle={i18nService.t('mcpDescription')}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onNewChat={onNewChat}
      updateBadge={updateBadge}
    >
      <div className="mx-auto w-full max-w-[1120px] px-6 py-6">
        <McpManager />
      </div>
    </ManagementPageShell>
  );
};

export default McpView;
