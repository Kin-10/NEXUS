import React from 'react';

import { PresentationChart } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PresentationChartBarIcon: React.FC<AppIconProps> = ({ className }) => (
  <PresentationChart className={className} {...defaultIconProps} />
);

export default PresentationChartBarIcon;
