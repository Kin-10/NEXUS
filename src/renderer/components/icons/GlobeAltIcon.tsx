import React from 'react';

import { Globe } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const GlobeAltIcon: React.FC<AppIconProps> = ({ className }) => (
  <Globe className={className} {...iconParkOutlineProps} />
);

export default GlobeAltIcon;
