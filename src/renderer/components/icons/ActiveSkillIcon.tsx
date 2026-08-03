import { PuzzlePiece } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, filledIconProps } from './iconStyle';

const ActiveSkillIcon: React.FC<AppIconProps> = ({ className }) => (
  <PuzzlePiece className={className} {...filledIconProps} />
);

export default ActiveSkillIcon;
