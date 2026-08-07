import React from 'react';

import { Folder } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const FolderIcon: React.FC<AppIconProps> = ({ className }) => (
  <Folder className={className} {...defaultIconProps} />
);

export default FolderIcon;
