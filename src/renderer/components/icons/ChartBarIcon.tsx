import React from 'react';

import { ChartBar } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const ChartBarIcon: React.FC<AppIconProps> = ({ className }) => (
  <ChartBar className={className} {...iconParkOutlineProps} />
);

export default ChartBarIcon;
