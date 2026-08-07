import React from 'react';

import { MagnifyingGlass } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SearchIcon: React.FC<AppIconProps> = ({ className }) => (
  <MagnifyingGlass className={className} {...defaultIconProps} />
);

export default SearchIcon;
