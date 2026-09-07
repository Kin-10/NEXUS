import React from 'react';

import { Library } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SidebarLibraryIcon: React.FC<AppIconProps> = ({ className }) => (
  <Library className={className} {...iconParkOutlineProps} />
);

export default SidebarLibraryIcon;
