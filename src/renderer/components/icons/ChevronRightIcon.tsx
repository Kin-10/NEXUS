import { CaretRight } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ChevronRightIcon: React.FC<AppIconProps> = ({ className }) => (
  <CaretRight className={className} {...defaultIconProps} />
);

export default ChevronRightIcon;
