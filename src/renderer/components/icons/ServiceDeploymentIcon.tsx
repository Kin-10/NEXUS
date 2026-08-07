import React from 'react';

import { Rocket } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ServiceDeploymentIcon: React.FC<AppIconProps> = ({ className }) => (
  <Rocket className={className} {...defaultIconProps} />
);

export default ServiceDeploymentIcon;
