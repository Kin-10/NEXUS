import React from 'react';

import { PuzzlePiece } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const PuzzleIcon: React.FC<AppIconProps> = ({ className }) => (
  <PuzzlePiece className={className} {...defaultIconProps} />
);

export default PuzzleIcon;
