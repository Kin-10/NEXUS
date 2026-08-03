import { NotePencil } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PencilSquareIcon: React.FC<AppIconProps> = ({ className }) => (
  <NotePencil className={className} {...defaultIconProps} />
);

export default PencilSquareIcon;
