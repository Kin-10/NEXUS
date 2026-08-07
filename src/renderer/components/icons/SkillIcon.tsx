import { Puzzle } from '@icon-park/react';
import React from 'react';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const SkillIcon: React.FC<AppIconProps> = ({ className }) => (
  <Puzzle className={className} {...iconParkOutlineProps} />
);

export default SkillIcon;
