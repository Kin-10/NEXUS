import React from 'react';

import { Link } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const LinkIcon: React.FC<AppIconProps> = ({ className }) => (
  <Link className={className} {...defaultIconProps} />
);

export default LinkIcon;
