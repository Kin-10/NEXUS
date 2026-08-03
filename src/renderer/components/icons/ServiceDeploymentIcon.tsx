import { Rocket } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ServiceDeploymentIcon: React.FC<AppIconProps> = ({ className }) => (
  <Rocket className={className} {...defaultIconProps} />
);

export default ServiceDeploymentIcon;
