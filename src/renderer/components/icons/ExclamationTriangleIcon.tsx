import { Warning } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ExclamationTriangleIcon: React.FC<AppIconProps> = ({ className }) => (
  <Warning className={className} {...defaultIconProps} />
);

export default ExclamationTriangleIcon;
