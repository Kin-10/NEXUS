import { DeviceMobile } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const DevicePhoneMobileIcon: React.FC<AppIconProps> = ({ className }) => (
  <DeviceMobile className={className} {...defaultIconProps} />
);

export default DevicePhoneMobileIcon;
