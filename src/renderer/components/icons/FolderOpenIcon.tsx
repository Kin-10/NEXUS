import { FolderOpen } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const FolderOpenIcon: React.FC<AppIconProps> = ({ className }) => (
  <FolderOpen className={className} {...defaultIconProps} />
);

export default FolderOpenIcon;
