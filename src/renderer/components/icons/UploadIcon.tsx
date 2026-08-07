import React from 'react';

import { UploadSimple } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const UploadIcon: React.FC<AppIconProps> = ({ className }) => (
  <UploadSimple className={className} {...defaultIconProps} />
);

export default UploadIcon;
