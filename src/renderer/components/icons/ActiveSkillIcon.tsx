import React from 'react';

import { PuzzlePiece } from '@/components/icons/iconParkCompat';

import { type AppIconProps, filledIconProps } from './iconStyle';

const ActiveSkillIcon: React.FC<AppIconProps> = ({ className }) => (
  <PuzzlePiece className={className} {...filledIconProps} />
);

export default ActiveSkillIcon;
