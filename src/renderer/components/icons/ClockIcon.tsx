import React from 'react';

import { Clock } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ClockIcon: React.FC<AppIconProps> = ({ className }) => (
  <Clock className={className} {...defaultIconProps} />
);

export default ClockIcon;
