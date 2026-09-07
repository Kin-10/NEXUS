import React from 'react';

import { i18nService } from '../../services/i18n';
import { MANAGEMENT_BODY_TEXT, MANAGEMENT_PAGE_TITLE_TEXT } from '../common/managementTypography';
import {
  SKILLS_CONNECTORS_SECTION_LABEL_KEYS,
  SKILLS_CONNECTORS_SECTION_ORDER,
  SkillsConnectorsSection,
} from './sections';

const SECTION_DESCRIPTION_KEYS: Record<SkillsConnectorsSection, string> = {
  [SkillsConnectorsSection.Skills]: 'skillsDescription',
  [SkillsConnectorsSection.Connectors]: 'mcpDescription',
};

interface CapabilitiesPageHeaderProps {
  activeSection: SkillsConnectorsSection;
  onSectionChange: (section: SkillsConnectorsSection) => void;
  leadingSlot?: React.ReactNode;
  trailingSlot?: React.ReactNode;
}

/**
 * Marketplace-style page header: title, one-line purpose, segmented section switch.
 * Flat hierarchy — active section via raised pill, not underline (tabs below own that).
 */
const CapabilitiesPageHeader: React.FC<CapabilitiesPageHeaderProps> = ({
  activeSection,
  onSectionChange,
  leadingSlot,
  trailingSlot,
}) => {
  return (
    <header className="draggable shrink-0 border-b border-border bg-background">
      <div className="flex h-12 items-center gap-3 px-4">
        {leadingSlot}
        <h1 className={`non-draggable ${MANAGEMENT_PAGE_TITLE_TEXT} font-semibold tracking-tight text-foreground`}>
          {i18nService.t('skillsAndConnectors')}
        </h1>
        {trailingSlot}
      </div>

      <div className="non-draggable mx-auto w-full max-w-[1120px] space-y-3 px-8 pb-4 pt-1">
        <p className={`${MANAGEMENT_BODY_TEXT} max-w-2xl text-secondary`}>
          {i18nService.t(SECTION_DESCRIPTION_KEYS[activeSection])}
        </p>

        <div
          role="tablist"
          aria-label={i18nService.t('skillsAndConnectors')}
          className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-raised/70 p-1"
        >
          {SKILLS_CONNECTORS_SECTION_ORDER.map((section) => {
            const isActive = activeSection === section;
            return (
              <button
                key={section}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSectionChange(section)}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-surface text-foreground'
                    : 'text-secondary hover:text-foreground'
                }`}
              >
                {i18nService.t(SKILLS_CONNECTORS_SECTION_LABEL_KEYS[section])}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default CapabilitiesPageHeader;
