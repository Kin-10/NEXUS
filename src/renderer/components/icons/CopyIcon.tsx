import { Copy } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const CopyIcon: React.FC<AppIconProps> = ({ className }) => (
  <Copy className={className} {...defaultIconProps} />
);

export default CopyIcon;
