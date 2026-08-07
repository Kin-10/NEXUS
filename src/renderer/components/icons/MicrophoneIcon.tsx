import React from 'react';

import { Microphone } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const MicrophoneIcon: React.FC<AppIconProps> = ({ className }) => (
  <Microphone className={className} {...defaultIconProps} />
);

export default MicrophoneIcon;
