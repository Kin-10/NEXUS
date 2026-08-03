import { MagnifyingGlass } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const SearchIcon: React.FC<AppIconProps> = ({ className }) => (
  <MagnifyingGlass className={className} {...defaultIconProps} />
);

export default SearchIcon;
