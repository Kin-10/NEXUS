import React from 'react';

import { Users } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const UserGroupIcon: React.FC<AppIconProps> = ({ className }) => (
  <Users className={className} {...defaultIconProps} />
);

export default UserGroupIcon;
