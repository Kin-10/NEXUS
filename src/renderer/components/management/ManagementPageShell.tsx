import React from 'react';

import ComposeIcon from '../icons/ComposeIcon';
import SidebarToggleIcon from '../icons/SidebarToggleIcon';

interface ManagementPageTitleBarProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  updateBadge?: React.ReactNode;
  leadingContent?: React.ReactNode;
  actions?: React.ReactNode;
}

interface ManagementPageShellProps extends ManagementPageTitleBarProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const getPlatformFlags = () => ({
  isMac: window.electron.platform === 'darwin',
  isWindows: window.electron.platform === 'win32',
});

export const ManagementPageTitleBar: React.FC<ManagementPageTitleBarProps> = ({
  title,
  subtitle,
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  updateBadge,
  leadingContent,
  actions,
}) => {
  const { isMac, isWindows } = getPlatformFlags();
  const showCollapsedControls = Boolean(isSidebarCollapsed && !isWindows && onToggleSidebar);

  return (
    <div className={`draggable flex shrink-0 items-center justify-between border-b border-border/70 bg-surface/85 px-4 backdrop-blur-sm ${subtitle ? 'h-16' : 'h-14'}`}>
      <div className="flex min-w-0 items-center gap-2">
        {showCollapsedControls && (
          <div className={`non-draggable flex items-center gap-1 ${isMac ? 'pl-[68px]' : ''}`}>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              <SidebarToggleIcon className="h-4 w-4" isCollapsed />
            </button>
            {onNewChat && (
              <button
                type="button"
                onClick={onNewChat}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-raised hover:text-foreground"
              >
                <ComposeIcon className="h-4 w-4" />
              </button>
            )}
            {updateBadge}
          </div>
        )}
        {leadingContent}
        <div className="min-w-0">
          <h1 className="min-w-0 truncate text-[15px] font-semibold leading-6 text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="min-w-0 truncate text-xs leading-5 text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="non-draggable flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

const ManagementPageShell: React.FC<ManagementPageShellProps> = ({
  title,
  subtitle,
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  updateBadge,
  leadingContent,
  actions,
  children,
  className = '',
  contentClassName = 'min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]',
}) => (
  <div
    data-skin-management-page="true"
    className={`relative z-10 flex h-full min-h-0 flex-col bg-background ${className}`}
  >
    <ManagementPageTitleBar
      title={title}
      subtitle={subtitle}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onNewChat={onNewChat}
      updateBadge={updateBadge}
      leadingContent={leadingContent}
      actions={actions}
    />
    <div className={contentClassName}>
      {children}
    </div>
  </div>
);

export default ManagementPageShell;
