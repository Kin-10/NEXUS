import { Schedule } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarAutomationIcon: React.FC<AppIconProps> = ({ className }) => (
  <Schedule className={className} {...iconParkOutlineProps} />
);

export default SidebarAutomationIcon;
