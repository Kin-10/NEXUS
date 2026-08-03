import { Trash } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const TrashIcon: React.FC<AppIconProps> = ({ className }) => (
  <Trash className={className} {...defaultIconProps} />
);

export default TrashIcon;
