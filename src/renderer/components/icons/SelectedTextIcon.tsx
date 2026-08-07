import React from 'react';

import { TextT } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SelectedTextIcon: React.FC<AppIconProps> = ({ className }) => (
  <TextT className={className} {...defaultIconProps} />
);

export default SelectedTextIcon;
