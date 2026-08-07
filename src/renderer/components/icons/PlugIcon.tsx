import React from 'react';

import { Plug } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PlugIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plug className={className} {...defaultIconProps} />
);

export default PlugIcon;
