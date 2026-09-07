import React, { useEffect, useRef } from 'react';

import ComposeIcon from '../icons/ComposeIcon';
import SidebarToggleIcon from '../icons/SidebarToggleIcon';
import { McpManager } from '../mcp';
import { reportMcpAction } from '../mcp/analytics';
import { SkillsManager } from '../skills';
import { reportSkillAction } from '../skills/analytics';
import CapabilitiesPageHeader from './CapabilitiesPageHeader';
import { SkillsConnectorsSection } from './sections';

interface SkillsAndConnectorsViewProps {
  activeSection: SkillsConnectorsSection;
  onSectionChange: (section: SkillsConnectorsSection) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onCreateSkillByChat?: () => void;
  onUseSkill?: (skillId: string) => void;
  updateBadge?: React.ReactNode;
  skillsReadOnly?: boolean;
}

/**
 * Capabilities hub: Skills + Connectors as one marketplace directory.
 * Flat / Swiss chrome — search lives in each manager; this shell owns section identity.
 */
const SkillsAndConnectorsView: React.FC<SkillsAndConnectorsViewProps> = ({
  activeSection,
  onSectionChange,
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  onCreateSkillByChat,
  onUseSkill,
  updateBadge,
  skillsReadOnly,
}) => {
  const isMac = window.electron.platform === 'darwin';
  const isWindows = window.electron.platform === 'win32';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  const handleSectionSelect = (section: SkillsConnectorsSection) => {
    if (section === activeSection) return;
    const report = section === SkillsConnectorsSection.Connectors ? reportMcpAction : reportSkillAction;
    report('section_change', {
      source: 'skills_connectors_view',
      fromSection: activeSection,
      targetSection: section,
    });
    onSectionChange(section);
  };

  const leadingSlot = isSidebarCollapsed && !isWindows ? (
    <div className={`non-draggable mr-1 flex items-center gap-1 ${isMac ? 'pl-[68px]' : ''}`}>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors duration-200 hover:bg-surface-raised hover:text-foreground"
      >
        <SidebarToggleIcon className="h-4 w-4" isCollapsed={true} />
      </button>
      <button
        type="button"
        onClick={onNewChat}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors duration-200 hover:bg-surface-raised hover:text-foreground"
      >
        <ComposeIcon className="h-4 w-4" />
      </button>
      {updateBadge}
    </div>
  ) : isMac ? (
    <div className="w-[68px] shrink-0" aria-hidden="true" />
  ) : null;

  return (
    <div
      data-skin-management-page="true"
      className="relative z-10 flex h-full flex-1 flex-col bg-background"
    >
      <CapabilitiesPageHeader
        activeSection={activeSection}
        onSectionChange={handleSectionSelect}
        leadingSlot={leadingSlot}
      />

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <div className="mx-auto w-full max-w-[1120px] px-8 py-5">
          {activeSection === SkillsConnectorsSection.Connectors ? (
            <McpManager />
          ) : (
            <SkillsManager
              readOnly={skillsReadOnly}
              onCreateByChat={onCreateSkillByChat}
              onUseSkill={onUseSkill}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsAndConnectorsView;
