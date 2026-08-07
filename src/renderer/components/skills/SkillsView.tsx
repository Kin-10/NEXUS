import React from 'react';

import { i18nService } from '../../services/i18n';
import ManagementPageShell from '../management/ManagementPageShell';
import SkillsManager from './SkillsManager';

interface SkillsViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onCreateSkillByChat?: () => void;
  updateBadge?: React.ReactNode;
  readOnly?: boolean;
}

const SkillsView: React.FC<SkillsViewProps> = ({ isSidebarCollapsed, onToggleSidebar, onNewChat, onCreateSkillByChat, updateBadge, readOnly }) => {
  return (
    <ManagementPageShell
      title={i18nService.t('skills')}
      subtitle={i18nService.t('skillsDescription')}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onNewChat={onNewChat}
      updateBadge={updateBadge}
    >
      <div className="mx-auto w-full max-w-[1120px] px-6 py-6">
        <SkillsManager readOnly={readOnly} onCreateByChat={onCreateSkillByChat} />
      </div>
    </ManagementPageShell>
  );
};

export default SkillsView;
