import React from 'react';

import { Flag } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const GoalIcon: React.FC<AppIconProps> = ({ className }) => (
  <Flag className={className} {...defaultIconProps} />
);

export default GoalIcon;
