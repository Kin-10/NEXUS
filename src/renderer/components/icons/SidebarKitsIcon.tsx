import { Application } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarKitsIcon: React.FC<AppIconProps> = ({ className }) => (
  <Application className={className} {...iconParkOutlineProps} />
);

export default SidebarKitsIcon;
