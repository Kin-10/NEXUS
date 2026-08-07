import { AddOne } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const ComposeIcon: React.FC<AppIconProps> = ({ className }) => (
  <AddOne className={className} {...iconParkOutlineProps} />
);

export default ComposeIcon;
