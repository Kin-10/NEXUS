import React from 'react';

/**
 * Soft triple-dot "alive" wave — Soft UI Evolution ambient motion.
 * One focal motion cluster (not 5+ competing animations).
 */
const CoworkAliveWave: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({
  className = '',
  size = 'md',
}) => (
  <span
    className={[
      'cowork-alive-wave',
      size === 'sm' ? 'cowork-alive-wave--sm' : '',
      className,
    ].filter(Boolean).join(' ')}
    aria-hidden="true"
  >
    <span className="cowork-alive-wave__dot" />
    <span className="cowork-alive-wave__dot" />
    <span className="cowork-alive-wave__dot" />
  </span>
);

export default CoworkAliveWave;
