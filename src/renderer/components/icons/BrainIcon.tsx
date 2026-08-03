import { Brain } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const BrainIcon: React.FC<AppIconProps> = ({ className }) => (
  <Brain className={className} {...defaultIconProps} />
);

export default BrainIcon;
