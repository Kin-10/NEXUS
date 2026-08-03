import { PuzzlePiece } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PuzzleIcon: React.FC<AppIconProps> = ({ className }) => (
  <PuzzlePiece className={className} {...defaultIconProps} />
);

export default PuzzleIcon;
