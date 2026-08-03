import { GlobeHemisphereWest } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SidebarSitesIcon: React.FC<AppIconProps> = ({ className = 'h-4 w-4' }) => (
  <GlobeHemisphereWest className={className} {...defaultIconProps} />
);

export default SidebarSitesIcon;
