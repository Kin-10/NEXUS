import { PlugsConnected } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SidebarMcpIcon: React.FC<AppIconProps> = ({ className }) => (
  <PlugsConnected className={className} {...defaultIconProps} />
);

export default SidebarMcpIcon;
