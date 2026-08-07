import { Plug } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarMcpIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plug className={className} {...iconParkOutlineProps} />
);

export default SidebarMcpIcon;
