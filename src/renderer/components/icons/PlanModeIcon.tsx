import { Path } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PlanModeIcon: React.FC<AppIconProps> = ({ className }) => (
  <Path className={className} {...defaultIconProps} />
);

export default PlanModeIcon;
