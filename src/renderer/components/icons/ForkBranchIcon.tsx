import React from 'react';

import { GitFork } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ForkBranchIcon: React.FC<AppIconProps> = ({ className }) => (
  <GitFork className={className} {...defaultIconProps} />
);

export default ForkBranchIcon;
