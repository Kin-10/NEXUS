import React from 'react';

import tianlongMarkUrl from '../../../assets/tianlong-mark.png';

/** TianLong (天隆科技) brand mark: blue left bar + stem, red right bar. */
const TianLongIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img
    alt="TianLong"
    className={className}
    height={24}
    src={tianlongMarkUrl}
    style={{ flex: '0 0 auto', lineHeight: 1, objectFit: 'contain' }}
    width={24}
  />
);

export default TianLongIcon;
