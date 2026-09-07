import React from 'react';

import { PresentationChart } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const PresentationChartBarIcon: React.FC<AppIconProps> = ({ className }) => (
  <PresentationChart className={className} {...iconParkOutlineProps} />
);

export default PresentationChartBarIcon;
