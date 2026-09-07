import React from 'react';

import { Paperclip } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const PaperClipIcon: React.FC<AppIconProps> = ({ className }) => (
  <Paperclip className={className} {...iconParkOutlineProps} />
);

export default PaperClipIcon;
