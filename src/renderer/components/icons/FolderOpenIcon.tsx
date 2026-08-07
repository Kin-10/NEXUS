import React from 'react';

import { FolderOpen } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const FolderOpenIcon: React.FC<AppIconProps> = ({ className }) => (
  <FolderOpen className={className} {...defaultIconProps} />
);

export default FolderOpenIcon;
