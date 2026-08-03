import { PlusCircle } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PlusCircleIcon: React.FC<AppIconProps> = ({ className }) => (
  <PlusCircle className={className} {...defaultIconProps} />
);

export default PlusCircleIcon;
