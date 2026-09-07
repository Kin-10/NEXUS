import React, { useState } from 'react';

import { getNameAbbreviation } from '../common/nameAbbreviation';

interface SkillIconTileProps {
  /** Server-provided icon URL. Falls back to a name abbreviation when absent. */
  icon?: string;
  /** Display name used for the abbreviation fallback. */
  label?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Icon shown for a skill. Renders the server-provided image when there is one,
 * otherwise a two-character abbreviation of the skill name.
 */
const SkillIconTile: React.FC<SkillIconTileProps> = ({
  icon,
  label,
  className = 'h-10 w-10 rounded-[10px]',
  iconClassName = 'text-sm font-semibold',
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedIcon = icon?.trim();

  if (normalizedIcon && !imageFailed) {
    return (
      <img
        alt=""
        className={`${className} shrink-0 bg-surface-raised object-cover`}
        draggable={false}
        src={normalizedIcon}
        onError={() => setImageFailed(true)}
      />
    );
  }

  const abbreviation = getNameAbbreviation(label || '');

  return (
    <span
      aria-hidden="true"
      title={label}
      className={`${className} inline-flex shrink-0 items-center justify-center bg-primary-muted text-primary ${iconClassName}`}
    >
      {abbreviation}
    </span>
  );
};

export default SkillIconTile;
