import React from 'react';

import { FileText } from '@/components/icons/iconParkCompat';

import { type AppIconProps, defaultIconProps } from './iconStyle';

const DocumentTextIcon: React.FC<AppIconProps> = ({ className }) => (
  <FileText className={className} {...defaultIconProps} />
);

export default DocumentTextIcon;
