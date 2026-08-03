import { GearSix } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const Cog6ToothIcon: React.FC<AppIconProps> = ({ className }) => (
  <GearSix className={className} {...defaultIconProps} />
);

export default Cog6ToothIcon;
