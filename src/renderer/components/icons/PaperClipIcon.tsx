import { Paperclip } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PaperClipIcon: React.FC<AppIconProps> = ({ className }) => (
  <Paperclip className={className} {...defaultIconProps} />
);

export default PaperClipIcon;
