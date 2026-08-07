import React from 'react';

import { CircleNotch } from '@/components/icons/iconParkCompat';

import { defaultIconProps } from './iconStyle';

const LoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <CircleNotch
    className={className}
    {...defaultIconProps}
    {...(props as React.ComponentProps<typeof CircleNotch>)}
  />
);

export default LoadingIcon;
