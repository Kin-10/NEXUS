import { Users } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const UserGroupIcon: React.FC<AppIconProps> = ({ className }) => (
  <Users className={className} {...defaultIconProps} />
);

export default UserGroupIcon;
