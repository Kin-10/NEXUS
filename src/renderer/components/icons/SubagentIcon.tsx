import { Robot } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SubagentIcon: React.FC<AppIconProps> = ({ className }) => (
  <Robot className={className} {...defaultIconProps} />
);

export default SubagentIcon;
