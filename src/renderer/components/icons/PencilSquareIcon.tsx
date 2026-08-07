import React from 'react';

import { NotePencil } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PencilSquareIcon: React.FC<AppIconProps> = ({ className }) => (
  <NotePencil className={className} {...defaultIconProps} />
);

export default PencilSquareIcon;
