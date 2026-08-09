import React from 'react';

import { Puzzle } from './iconParkCompat';
import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SkillIcon: React.FC<AppIconProps> = ({ className }) => (
  <Puzzle className={className} {...iconParkOutlineProps} />
);

export default SkillIcon;
