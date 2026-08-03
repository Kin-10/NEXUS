import { PresentationChart } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PresentationChartBarIcon: React.FC<AppIconProps> = ({ className }) => (
  <PresentationChart className={className} {...defaultIconProps} />
);

export default PresentationChartBarIcon;
