import React from 'react';

import { Warning } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ExclamationTriangleIcon: React.FC<AppIconProps> = ({ className }) => (
  <Warning className={className} {...defaultIconProps} />
);

export default ExclamationTriangleIcon;
