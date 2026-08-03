import { Link } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const LinkIcon: React.FC<AppIconProps> = ({ className }) => (
  <Link className={className} {...defaultIconProps} />
);

export default LinkIcon;
