import React from 'react';

import { Robot } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SubagentIcon: React.FC<AppIconProps> = ({ className }) => (
  <Robot className={className} {...defaultIconProps} />
);

export default SubagentIcon;
