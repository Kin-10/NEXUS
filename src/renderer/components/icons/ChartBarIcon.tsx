import React from 'react';

import { ChartBar } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ChartBarIcon: React.FC<AppIconProps> = ({ className }) => (
  <ChartBar className={className} {...defaultIconProps} />
);

export default ChartBarIcon;
