import { FileText } from '@phosphor-icons/react';
import React from 'react';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const DocumentTextIcon: React.FC<AppIconProps> = ({ className }) => (
  <FileText className={className} {...defaultIconProps} />
);

export default DocumentTextIcon;
