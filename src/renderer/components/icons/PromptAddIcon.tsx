import React from 'react';

import { Plus } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PromptAddIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plus className={className} {...defaultIconProps} />
);

export default PromptAddIcon;
