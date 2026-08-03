import { Globe } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const GlobeAltIcon: React.FC<AppIconProps> = ({ className }) => (
  <Globe className={className} {...defaultIconProps} />
);

export default GlobeAltIcon;
