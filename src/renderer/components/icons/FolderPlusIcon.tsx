import React from 'react';

import { FolderPlus } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const FolderPlusIcon: React.FC<AppIconProps> = ({ className }) => (
  <FolderPlus className={className} {...defaultIconProps} />
);

export default FolderPlusIcon;
