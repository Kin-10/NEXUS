import React from 'react';

import { Trash } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const TrashIcon: React.FC<AppIconProps> = ({ className }) => (
  <Trash className={className} {...defaultIconProps} />
);

export default TrashIcon;
