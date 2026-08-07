import React from 'react';

import { ListChecks } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ListChecksIcon: React.FC<AppIconProps> = ({ className }) => (
  <ListChecks className={className} {...defaultIconProps} />
);

export default ListChecksIcon;
