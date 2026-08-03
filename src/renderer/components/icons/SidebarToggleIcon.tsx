import { SidebarSimple } from '@phosphor-icons/react';
import React from 'react';

import { defaultIconProps } from './iconStyle';

const SidebarToggleIcon: React.FC<{ className?: string; isCollapsed: boolean }> = ({
  className,
  isCollapsed,
}) => (
  <SidebarSimple
    className={className}
    {...defaultIconProps}
    style={isCollapsed ? { transform: 'scaleX(-1)' } : undefined}
  />
);

export default SidebarToggleIcon;
