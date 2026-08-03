import { ListChecks } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ListChecksIcon: React.FC<AppIconProps> = ({ className }) => (
  <ListChecks className={className} {...defaultIconProps} />
);

export default ListChecksIcon;
