import React from 'react';

import { Application } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarKitsIcon: React.FC<AppIconProps> = ({ className }) => (
  <Application className={className} {...iconParkOutlineProps} />
);

export default SidebarKitsIcon;
