import React from 'react';

import { GraduationCap } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const AcademicCapIcon: React.FC<AppIconProps> = ({ className }) => (
  <GraduationCap className={className} {...defaultIconProps} />
);

export default AcademicCapIcon;
