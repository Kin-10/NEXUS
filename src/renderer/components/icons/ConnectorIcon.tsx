import { Plugs } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const ConnectorIcon: React.FC<AppIconProps> = ({ className }) => (
  <Plugs className={className} {...defaultIconProps} />
);

export default ConnectorIcon;
