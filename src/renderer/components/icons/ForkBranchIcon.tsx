import { GitFork } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ForkBranchIcon: React.FC<AppIconProps> = ({ className }) => (
  <GitFork className={className} {...defaultIconProps} />
);

export default ForkBranchIcon;
