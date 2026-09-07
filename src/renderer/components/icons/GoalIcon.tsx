import React from 'react';

import { Flag } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const GoalIcon: React.FC<AppIconProps> = ({ className }) => (
  <Flag className={className} {...iconParkOutlineProps} />
);

export default GoalIcon;
