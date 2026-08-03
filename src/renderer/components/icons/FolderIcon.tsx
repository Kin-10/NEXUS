import { Folder } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const FolderIcon: React.FC<AppIconProps> = ({ className }) => (
  <Folder className={className} {...defaultIconProps} />
);

export default FolderIcon;
