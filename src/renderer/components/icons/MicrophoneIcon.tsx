import { Microphone } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const MicrophoneIcon: React.FC<AppIconProps> = ({ className }) => (
  <Microphone className={className} {...defaultIconProps} />
);

export default MicrophoneIcon;
