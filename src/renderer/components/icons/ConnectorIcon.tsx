import React from 'react';

import { Plugs } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ConnectorIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plugs className={className} {...defaultIconProps} />
);

export default ConnectorIcon;
