import React from 'react';

import { AddOne } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const ComposeIcon: React.FC<AppIconProps> = ({ className }) => (
  <AddOne className={className} {...iconParkOutlineProps} />
);

export default ComposeIcon;
