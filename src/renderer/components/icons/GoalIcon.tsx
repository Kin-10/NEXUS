import { Flag } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const GoalIcon: React.FC<AppIconProps> = ({ className }) => (
  <Flag className={className} {...defaultIconProps} />
);

export default GoalIcon;
