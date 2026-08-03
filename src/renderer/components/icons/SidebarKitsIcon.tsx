import { SquaresFour } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SidebarKitsIcon: React.FC<AppIconProps> = ({ className }) => (
  <SquaresFour className={className} {...defaultIconProps} />
);

export default SidebarKitsIcon;
