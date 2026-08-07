import React from 'react';

import { Path } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PlanModeIcon: React.FC<AppIconProps> = ({ className }) => (
  <Path className={className} {...defaultIconProps} />
);

export default PlanModeIcon;
