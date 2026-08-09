import React from 'react';

import { Search } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarSearchIcon: React.FC<AppIconProps> = ({ className }) => (
  <Search className={className} {...iconParkOutlineProps} />
);

export default SidebarSearchIcon;
