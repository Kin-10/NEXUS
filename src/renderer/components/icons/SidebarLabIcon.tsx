import React from 'react';

import { Flask } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarLabIcon: React.FC<AppIconProps> = ({ className }) => (
  <Flask className={className} {...iconParkOutlineProps} />
);

export default SidebarLabIcon;
