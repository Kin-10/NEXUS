import React from 'react';

import { ListFilter } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarFilterIcon: React.FC<AppIconProps> = ({ className }) => (
  <ListFilter className={className} {...iconParkOutlineProps} />
);

export default SidebarFilterIcon;
