import { Plug } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PlugIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plug className={className} {...defaultIconProps} />
);

export default PlugIcon;
