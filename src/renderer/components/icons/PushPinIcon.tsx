import React from 'react';

import { PushPin, PushPinSlash } from '@/components/icons/iconParkCompat';

import { filledIconProps } from './iconStyle';

const PushPinIcon: React.FC<React.SVGProps<SVGSVGElement> & { slashed?: boolean }> = ({
  slashed,
  className,
  ...props
}) => {
  const Icon = slashed ? PushPinSlash : PushPin;
  return (
    <Icon
      className={className}
      {...filledIconProps}
      {...(props as React.ComponentProps<typeof PushPin>)}
    />
  );
};

export default PushPinIcon;
