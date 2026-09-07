import React from 'react';

import { Path } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const PlanModeIcon: React.FC<AppIconProps> = ({ className }) => (
  <Path className={className} {...iconParkOutlineProps} />
);

export default PlanModeIcon;
