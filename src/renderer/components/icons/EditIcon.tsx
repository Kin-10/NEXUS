import { PencilSimple } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const EditIcon: React.FC<AppIconProps> = ({ className }) => (
  <PencilSimple className={className} {...defaultIconProps} />
);

export default EditIcon;
