import React from 'react';

import { type AppIconProps } from './iconStyle';

const SidebarLabIcon: React.FC<AppIconProps> = ({ className = 'h-4 w-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3v6.4c0 .35-.09.68-.27.98l-4.4 7.34A2 2 0 0 0 6.8 20.75h10.4a2 2 0 0 0 1.72-3.03l-4.4-7.34a1.9 1.9 0 0 1-.27-.98V3M8.25 3h7.5M7.5 14.25h9"
    />
  </svg>
);

export default SidebarLabIcon;
