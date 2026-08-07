import { Search } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarSearchIcon: React.FC<AppIconProps> = ({ className }) => (
  <Search className={className} {...iconParkOutlineProps} />
);

export default SidebarSearchIcon;
