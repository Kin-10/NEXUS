import React from 'react';

import { Info } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const InformationCircleIcon: React.FC<AppIconProps> = ({ className }) => (
  <Info className={className} {...defaultIconProps} />
);

export default InformationCircleIcon;
