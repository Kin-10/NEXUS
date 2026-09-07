import React from 'react';

import { GraduationCap } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const AcademicCapIcon: React.FC<AppIconProps> = ({ className }) => (
  <GraduationCap className={className} {...iconParkOutlineProps} />
);

export default AcademicCapIcon;
