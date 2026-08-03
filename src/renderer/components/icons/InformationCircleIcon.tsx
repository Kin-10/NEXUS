import { Info } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const InformationCircleIcon: React.FC<AppIconProps> = ({ className }) => (
  <Info className={className} {...defaultIconProps} />
);

export default InformationCircleIcon;
