import React from 'react';

import { MenuFold, MenuUnfold } from './iconParkCompat';
import { iconParkOutlineProps } from './iconStyle';

const SidebarToggleIcon: React.FC<{ className?: string; isCollapsed: boolean }> = ({
  className,
  isCollapsed,
}) => {
  const Icon = isCollapsed ? MenuUnfold : MenuFold;
  return <Icon className={className} {...iconParkOutlineProps} />;
};

export default SidebarToggleIcon;
