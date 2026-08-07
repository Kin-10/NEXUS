import React from 'react';

import { DotsThree } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const EllipsisHorizontalIcon: React.FC<AppIconProps> = ({ className }) => (
  <DotsThree className={className} {...defaultIconProps} />
);

export default EllipsisHorizontalIcon;
