import React from 'react';

/** Dedicated stop control for streaming turns — keep brand glyph, not chrome icons. */
const TaskPauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="17" cy="17" r="13" className="fill-neutral-950 dark:fill-white" />
      <rect x="12" y="12" width="10" height="10" rx="2" className="fill-white dark:fill-neutral-950" />
    </svg>
  );
};

export default TaskPauseIcon;
