import React from 'react';

import { SettingConfig } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const Cog6ToothIcon: React.FC<AppIconProps> = ({ className }) => (
  <SettingConfig className={className} {...iconParkOutlineProps} />
);

export default Cog6ToothIcon;
