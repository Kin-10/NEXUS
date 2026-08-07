import { SettingConfig } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const Cog6ToothIcon: React.FC<AppIconProps> = ({ className }) => (
  <SettingConfig className={className} {...iconParkOutlineProps} />
);

export default Cog6ToothIcon;
