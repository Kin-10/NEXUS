import React from 'react';

import { Schedule } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarAutomationIcon: React.FC<AppIconProps> = ({ className }) => (
  <Schedule className={className} {...iconParkOutlineProps} />
);

export default SidebarAutomationIcon;
