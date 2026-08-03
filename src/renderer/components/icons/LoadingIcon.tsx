import { CircleNotch } from '@phosphor-icons/react';
import React from 'react';

import { defaultIconProps } from './iconStyle';

const LoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <CircleNotch
    className={className}
    {...defaultIconProps}
    {...(props as React.ComponentProps<typeof CircleNotch>)}
  />
);

export default LoadingIcon;
