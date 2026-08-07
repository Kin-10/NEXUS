import React from 'react';

import { Brain } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const BrainIcon: React.FC<AppIconProps> = ({ className }) => (
  <Brain className={className} {...defaultIconProps} />
);

export default BrainIcon;
