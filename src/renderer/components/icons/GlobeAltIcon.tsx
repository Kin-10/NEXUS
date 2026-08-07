import React from 'react';

import { Globe } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const GlobeAltIcon: React.FC<AppIconProps> = ({ className }) => (
  <Globe className={className} {...defaultIconProps} />
);

export default GlobeAltIcon;
