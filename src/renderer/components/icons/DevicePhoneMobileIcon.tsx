import React from 'react';

import { DeviceMobile } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const DevicePhoneMobileIcon: React.FC<AppIconProps> = ({ className }) => (
  <DeviceMobile className={className} {...defaultIconProps} />
);

export default DevicePhoneMobileIcon;
