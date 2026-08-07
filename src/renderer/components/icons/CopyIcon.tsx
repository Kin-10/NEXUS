import React from 'react';

import { Copy } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const CopyIcon: React.FC<AppIconProps> = ({ className }) => (
  <Copy className={className} {...defaultIconProps} />
);

export default CopyIcon;
