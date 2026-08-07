import React from 'react';

import { Paperclip } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PaperClipIcon: React.FC<AppIconProps> = ({ className }) => (
  <Paperclip className={className} {...defaultIconProps} />
);

export default PaperClipIcon;
