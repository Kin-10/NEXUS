import React from 'react';

import { Globe } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarSitesIcon: React.FC<AppIconProps> = ({ className = 'h-4 w-4' }) => (
  <Globe className={className} {...iconParkOutlineProps} />
);

export default SidebarSitesIcon;
