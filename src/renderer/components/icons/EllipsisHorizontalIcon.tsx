import { DotsThree } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const EllipsisHorizontalIcon: React.FC<AppIconProps> = ({ className }) => (
  <DotsThree className={className} {...defaultIconProps} />
);

export default EllipsisHorizontalIcon;
