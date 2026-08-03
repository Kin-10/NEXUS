import { Plus } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PromptAddIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plus className={className} {...defaultIconProps} />
);

export default PromptAddIcon;
