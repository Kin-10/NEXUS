import React from 'react';

import { DeviceMobile } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const DevicePhoneMobileIcon: React.FC<AppIconProps> = ({ className }) => (
  <DeviceMobile className={className} {...iconParkOutlineProps} />
);

export default DevicePhoneMobileIcon;
