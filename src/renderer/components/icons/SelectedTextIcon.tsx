import { TextT } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SelectedTextIcon: React.FC<AppIconProps> = ({ className }) => (
  <TextT className={className} {...defaultIconProps} />
);

export default SelectedTextIcon;
