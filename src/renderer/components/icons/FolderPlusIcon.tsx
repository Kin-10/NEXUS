import { FolderPlus } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const FolderPlusIcon: React.FC<AppIconProps> = ({ className }) => (
  <FolderPlus className={className} {...defaultIconProps} />
);

export default FolderPlusIcon;
