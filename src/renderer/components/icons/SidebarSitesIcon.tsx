import { Globe } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarSitesIcon: React.FC<AppIconProps> = ({ className = 'h-4 w-4' }) => (
  <Globe className={className} {...iconParkOutlineProps} />
);

export default SidebarSitesIcon;
