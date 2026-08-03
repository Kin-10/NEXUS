import { X } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const XMarkIcon: React.FC<AppIconProps> = ({ className }) => (
  <X className={className} {...defaultIconProps} />
);

export default XMarkIcon;
