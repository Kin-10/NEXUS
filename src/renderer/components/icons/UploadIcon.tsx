import { UploadSimple } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const UploadIcon: React.FC<AppIconProps> = ({ className }) => (
  <UploadSimple className={className} {...defaultIconProps} />
);

export default UploadIcon;
