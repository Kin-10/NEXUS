import React from 'react';

import { i18nService } from '../../services/i18n';
import DshExperimentalSettings from '../DshExperimentalSettings';
import ManagementPageShell from '../management/ManagementPageShell';

interface LabViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  updateBadge?: React.ReactNode;
}

const LabView: React.FC<LabViewProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  updateBadge,
}) => (
  <ManagementPageShell
    title={i18nService.t('sidebarNavLab')}
    subtitle={i18nService.t('labPageSubtitle')}
    isSidebarCollapsed={isSidebarCollapsed}
    onToggleSidebar={onToggleSidebar}
    onNewChat={onNewChat}
    updateBadge={updateBadge}
  >
    <div className="mx-auto w-full max-w-[720px] px-6 py-6">
      <DshExperimentalSettings />
    </div>
  </ManagementPageShell>
);

export default LabView;
