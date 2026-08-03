import { ChartBar } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ChartBarIcon: React.FC<AppIconProps> = ({ className }) => (
  <ChartBar className={className} {...defaultIconProps} />
);

export default ChartBarIcon;
