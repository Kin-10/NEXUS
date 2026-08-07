import React from 'react';

import { CaretRight } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ChevronRightIcon: React.FC<AppIconProps> = ({ className }) => (
  <CaretRight className={className} {...defaultIconProps} />
);

export default ChevronRightIcon;
