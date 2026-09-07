import React from 'react';

import { MANAGEMENT_META_TEXT, MANAGEMENT_TITLE_TEXT } from '../common/managementTypography';
import { CAPABILITIES_CARD_CLASS } from '../skillsAndConnectors/capabilitiesChrome';
import KitIcon from './KitIcon';

interface KitCardProps {
  title: string;
  description: string;
  icon?: string;
  /** Capsule actions next to the title (Install / Use). */
  actions?: React.ReactNode;
  /** Badge strip pinned to the bottom of the card. */
  meta?: React.ReactNode;
  onOpenDetail?: () => void;
}

/**
 * One expert kit in the directory grid — same shape as skill / MCP cards:
 * icon tile + single-line title, two-line description with reserved height,
 * meta strip at the bottom. Flat chrome only (no layout-shifting hover).
 */
const KitCard: React.FC<KitCardProps> = ({
  title,
  description,
  icon,
  actions,
  meta,
  onOpenDetail,
}) => (
  <div
    role={onOpenDetail ? 'button' : undefined}
    tabIndex={onOpenDetail ? 0 : undefined}
    onClick={onOpenDetail}
    onKeyDown={onOpenDetail ? ((event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpenDetail();
      }
    }) : undefined}
    className={`${CAPABILITIES_CARD_CLASS} ${onOpenDetail ? '' : 'cursor-default'}`}
  >
    <div className="mb-3 flex items-center gap-2.5">
      <KitIcon
        icon={icon}
        className="h-10 w-10 rounded-[10px]"
        fallbackClassName="rounded-[10px] bg-primary-muted text-primary"
        fallbackIconClassName="h-5 w-5"
      />
      <div className={`min-w-0 flex-1 truncate ${MANAGEMENT_TITLE_TEXT} font-semibold leading-snug text-foreground`}>
        {title}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-1">
          {actions}
        </div>
      )}
    </div>

    <p className="mb-3 line-clamp-2 min-h-[2.6em] text-xs leading-relaxed text-secondary">
      {description}
    </p>

    {meta && (
      <div className={`mt-auto flex min-w-0 flex-wrap items-center gap-1.5 ${MANAGEMENT_META_TEXT} text-muted`}>
        {meta}
      </div>
    )}
  </div>
);

export default KitCard;
