import React from 'react';

import { Plug } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarMcpIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plug className={className} {...iconParkOutlineProps} />
);

export default SidebarMcpIcon;
