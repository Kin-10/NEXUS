import { GraduationCap } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const AcademicCapIcon: React.FC<AppIconProps> = ({ className }) => (
  <GraduationCap className={className} {...defaultIconProps} />
);

export default AcademicCapIcon;
