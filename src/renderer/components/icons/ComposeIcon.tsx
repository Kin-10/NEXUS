import { NotePencil } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ComposeIcon: React.FC<AppIconProps> = ({ className }) => (
  <NotePencil className={className} {...defaultIconProps} />
);

export default ComposeIcon;
