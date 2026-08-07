import React from 'react';

import { PlusCircle } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PlusCircleIcon: React.FC<AppIconProps> = ({ className }) => (
  <PlusCircle className={className} {...defaultIconProps} />
);

export default PlusCircleIcon;
