import { ClockCountdown } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SidebarAutomationIcon: React.FC<AppIconProps> = ({ className }) => (
  <ClockCountdown className={className} {...defaultIconProps} />
);

export default SidebarAutomationIcon;
