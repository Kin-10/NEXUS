import React from 'react';

import { X } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const XMarkIcon: React.FC<AppIconProps> = ({ className }) => (
  <X className={className} {...defaultIconProps} />
);

export default XMarkIcon;
