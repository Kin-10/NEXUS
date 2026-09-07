import React from 'react';

import { FileText } from '@/components/icons/iconParkCompat';

import { type AppIconProps, iconParkOutlineProps } from './iconStyle';

const DocumentTextIcon: React.FC<AppIconProps> = ({ className }) => (
  <FileText className={className} {...iconParkOutlineProps} />
);

export default DocumentTextIcon;
