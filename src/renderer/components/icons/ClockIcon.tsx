import { Clock } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ClockIcon: React.FC<AppIconProps> = ({ className }) => (
  <Clock className={className} {...defaultIconProps} />
);

export default ClockIcon;
