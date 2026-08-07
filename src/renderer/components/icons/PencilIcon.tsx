import React from 'react';

import { PencilSimple } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PencilIcon: React.FC<AppIconProps> = ({ className }) => (
  <PencilSimple className={className} {...defaultIconProps} />
);

export default PencilIcon;
